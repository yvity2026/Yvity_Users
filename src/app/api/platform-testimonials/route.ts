import { NextResponse } from "next/server";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { getSessionUser } from "@/lib/server/session";
import { verifyOtpCode } from "@/lib/server/auth";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";
import { saveTestimonialMedia, validateTestimonialMedia } from "@/lib/server/testimonial-uploads";

export const runtime = "nodejs";

type PlatformTestimonialRow = {
  id: string;
  name: string;
  profession: string;
  city: string;
  respondent_type: string;
  testimonial_type: string;
  testimonial_rating: number;
  content: string | null;
  media_url: string | null;
  yvity_reply: string | null;
  status: string;
};

function mapForLanding(row: PlatformTestimonialRow) {
  const type = row.testimonial_type || "text";
  return {
    id: row.id,
    name: row.name,
    role: `${row.profession || "Member"} • ${row.city || "India"}`,
    type: row.respondent_type === "advisor" ? "Advisor" : "Customer",
    text:
      type === "text"
        ? `"${row.content || ""}"`
        : `"Shared a ${type} testimonial about their YVITY experience."`,
    rating: row.testimonial_rating || 0,
    status: "Verified",
    hasAudio: type === "audio",
    hasVideo: type === "video",
    hasMedia: type === "audio" || type === "video",
    mediaUrl: row.media_url,
    replyText: row.yvity_reply || null,
  };
}

function parseType(val: FormDataEntryValue | null): "text" | "audio" | "video" {
  if (val === "audio") return "audio";
  if (val === "video") return "video";
  return "text";
}

function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export async function POST(request: Request) {
  try {
    const supabase = getAdminClientOrNull();
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const formData = await request.formData();

    const otp     = String(formData.get("otp")     ?? "").trim();
    const type    = parseType(formData.get("type"));
    const name    = String(formData.get("name")    ?? "").trim();
    const mobile  = String(formData.get("mobile")  ?? "").trim();
    const profession   = String(formData.get("profession")   ?? "").trim();
    const city         = String(formData.get("city")         ?? "").trim();
    const content      = String(formData.get("content")      ?? "").trim();
    const respondentType = formData.get("respondentType") === "advisor" ? "advisor" : "customer";
    const audioDuration = String(formData.get("audioDuration") ?? "").trim();
    const videoDuration = String(formData.get("videoDuration") ?? "").trim();
    const media = formData.get("media");

    const rating = Number(formData.get("rating"));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "A rating between 1 and 5 is required." }, { status: 400 });
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    if (!isValidMobile(mobile)) {
      return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
    }

    // OTP check — skipped for signed-in users
    const session = await getSessionUser();
    const skipOtp = Boolean(session?.id);
    if (!skipOtp) {
      if (!otp || otp.length < 6) {
        return NextResponse.json({ error: "Enter the 6-digit OTP sent to your mobile." }, { status: 400 });
      }
      if (!(await verifyOtpCode(mobile, OTP_PURPOSE.PLATFORM_REVIEW, otp))) {
        return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 401 });
      }
    }

    // Validate content for text type
    if (type === "text" && !content) {
      return NextResponse.json({ error: "Please share your experience in writing." }, { status: 400 });
    }

    // Media upload for audio/video
    let mediaUrl: string | null = null;
    if ((type === "audio" || type === "video") && media instanceof File && media.size > 0) {
      const mediaErr = validateTestimonialMedia(media, type);
      if (mediaErr) return NextResponse.json({ error: mediaErr }, { status: 400 });
      // Store under "platform/" subfolder in the shared testimonials bucket
      const saved = await saveTestimonialMedia(media, type, "platform");
      mediaUrl = saved.url;
    } else if (type !== "text" && !mediaUrl) {
      return NextResponse.json({ error: `Please upload your ${type} file.` }, { status: 400 });
    }

    const displayContent =
      type === "text"
        ? content
        : type === "audio"
          ? (audioDuration ? `Audio • ${audioDuration}` : "Shared an audio review of YVITY.")
          : (videoDuration ? `Video • ${videoDuration}` : "Shared a video review of YVITY.");

    const { error } = await supabase.from("yvity_testimonials").insert({
      name:             name.slice(0, 100),
      profession:       profession.slice(0, 100) || "",
      city:             city.slice(0, 100) || "",
      respondent_type:  respondentType,
      testimonial_type: type,
      testimonial_rating: rating,
      content:          displayContent || null,
      media_url:        mediaUrl,
      status:           "approved",
      user_id:          session?.id ?? null,
    });

    if (error) {
      console.error("POST /api/platform-testimonials failed:", error);
      return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/platform-testimonials failed:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getAdminClientOrNull();
    if (!supabase) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from("yvity_testimonials")
      .select(
        "id, name, profession, city, respondent_type, testimonial_type, testimonial_rating, content, media_url, yvity_reply, status",
      )
      .eq("status", "approved")
      .order("testimonial_rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("GET /api/platform-testimonials failed:", error);
      return NextResponse.json({ error: "Unable to load testimonials" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: (data || []).map((row) => mapForLanding(row as PlatformTestimonialRow)),
    });
  } catch (error) {
    console.error("GET /api/platform-testimonials failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

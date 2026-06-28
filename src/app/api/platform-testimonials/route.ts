import { NextResponse } from "next/server";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { getSessionUser } from "@/lib/server/session";

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

export async function POST(request: Request) {
  try {
    const supabase = getAdminClientOrNull();
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const body = (await request.json()) as {
      rating?: unknown;
      content?: unknown;
      name?: unknown;
      respondentType?: unknown;
    };

    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "A rating between 1 and 5 is required." }, { status: 400 });
    }

    const content = typeof body.content === "string" ? body.content.trim().slice(0, 1000) : null;
    const respondentType = body.respondentType === "advisor" ? "advisor" : "customer";

    // Use session name if available, otherwise use submitted name
    const session = await getSessionUser();
    const submittedName = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
    const name = submittedName || (session ? "YVITY Member" : "Anonymous");

    const { error } = await supabase.from("yvity_testimonials").insert({
      name,
      profession: "",
      city: "",
      respondent_type: respondentType,
      testimonial_type: "text",
      testimonial_rating: rating,
      content: content || null,
      status: "pending",
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

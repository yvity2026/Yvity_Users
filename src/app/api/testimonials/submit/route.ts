import { NextResponse } from "next/server";
import { uid } from "@/lib/id";
import type { TestimonialItem, TestimonialType } from "@/lib/sections/types";
import { verifyOtpCode } from "@/lib/server/auth";
import { saveTestimonialMedia } from "@/lib/server/testimonial-uploads";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import { appendPublishedTestimonial } from "@/lib/server/testimonials-persistence";
import {
  formatMediaDuration,
  formatTestimonialDate,
  validateGiveContent,
  validateGiveDetails,
  validateMobile,
} from "@/lib/testimonials/submit-utils";

export const runtime = "nodejs";

function parseType(value: FormDataEntryValue | null): TestimonialType | null {
  if (value === "text" || value === "audio" || value === "video") return value;
  return null;
}

export async function POST(request: Request) {
  const advisorSettings = await loadAdvisorSettings();
  if (!advisorSettings.leads.testimonialRequests) {
    return NextResponse.json(
      { error: "Testimonial submissions are not available at the moment." },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const otp = String(formData.get("otp") ?? "").trim();
    const type = parseType(formData.get("type"));
    const fullName = String(formData.get("fullName") ?? "").trim();
    const mobile = String(formData.get("mobile") ?? "").trim();
    const profession = String(formData.get("profession") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const quote = String(formData.get("quote") ?? "").trim();
    const audioDuration = String(formData.get("audioDuration") ?? "").trim();
    const videoDuration = String(formData.get("videoDuration") ?? "").trim();
    const media = formData.get("media");

    if (!verifyOtpCode(otp)) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 401 });
    }

    if (!type) {
      return NextResponse.json({ error: "Invalid testimonial type" }, { status: 400 });
    }

    const draft = {
      type,
      fullName,
      mobile,
      profession,
      location,
      quote,
      mediaFile: media instanceof File && media.size > 0 ? media : null,
    };

    const detailsErr = validateGiveDetails(draft);
    if (detailsErr) return NextResponse.json({ error: detailsErr }, { status: 400 });

    const contentErr = validateGiveContent(draft);
    if (contentErr) return NextResponse.json({ error: contentErr }, { status: 400 });

    if (!validateMobile(mobile)) {
      return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
    }

    let mediaUrl: string | undefined;
    if (type !== "text" && draft.mediaFile) {
      const saved = await saveTestimonialMedia(draft.mediaFile, type);
      mediaUrl = saved.url;
    }

    const displayQuote =
      quote ||
      (type === "audio"
        ? "Shared an audio testimonial about their experience."
        : "Shared a video testimonial about their experience.");

    const item: TestimonialItem = {
      id: uid("tst"),
      source: "customer",
      type,
      service: "life",
      name: fullName,
      profession: profession || "Client",
      location: location || "Andhra Pradesh",
      quote: displayQuote,
      rating: 5,
      date: formatTestimonialDate(),
      memberBadge: "mobile-verified",
      verified: true,
      status: "published",
      mediaUrl,
      audioDuration:
        type === "audio"
          ? audioDuration || (draft.mediaFile ? formatMediaDuration(45) : undefined)
          : undefined,
      videoDuration:
        type === "video"
          ? videoDuration || (draft.mediaFile ? formatMediaDuration(72) : undefined)
          : undefined,
    };

    const published = await appendPublishedTestimonial(item);
    return NextResponse.json({ ok: true, data: published });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Submission failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

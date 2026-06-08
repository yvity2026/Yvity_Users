import { NextResponse } from "next/server";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { getAdvisorPlanContext } from "@/lib/advisor-membership/plan-enforcement-server";
import { uid } from "@/lib/id";
import { isRegisteredTestimonialService } from "@/lib/sections/testimonial-service-options";
import type { TestimonialItem, TestimonialService, TestimonialType } from "@/lib/sections/types";
import { verifyOtpCode } from "@/lib/server/auth";
import { getSessionUser } from "@/lib/server/session";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { saveTestimonialMedia } from "@/lib/server/testimonial-uploads";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";
import { loadServicesForUser } from "@/lib/server/section-persistence";
import { appendPublishedTestimonial, loadTestimonials } from "@/lib/server/testimonials-persistence";
import {
  formatMediaDuration,
  formatTestimonialDate,
  isTestimonialService,
  parseTestimonialRating,
  validateGiveContent,
  validateGiveDetails,
  validateMobile,
} from "@/lib/testimonials/submit-utils";
import {
  ADVISOR_SELF_TESTIMONIAL_MESSAGE,
  rejectAdvisorSelfSubmission,
} from "@/lib/server/advisor-self-submission-guard";
import { hasRecentTestimonialFromMobileForService } from "@/lib/server/testimonial-submission-limits";
import { TESTIMONIAL_MONTHLY_DUPLICATE_MESSAGE } from "@/lib/testimonials/submission-limits";

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
    const serviceRaw = String(formData.get("service") ?? "").trim();
    const rating = parseTestimonialRating(formData.get("rating"));
    const audioDuration = String(formData.get("audioDuration") ?? "").trim();
    const videoDuration = String(formData.get("videoDuration") ?? "").trim();
    const media = formData.get("media");

    const session = await getSessionUser();
    const skipOtp = Boolean(session?.id);
    if (!skipOtp && !verifyOtpCode(otp)) {
      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 401 });
    }

    if (!type) {
      return NextResponse.json({ error: "Invalid testimonial type" }, { status: 400 });
    }

    const service: TestimonialService | "" = isTestimonialService(serviceRaw) ? serviceRaw : "";

    const draft = {
      type,
      service,
      rating: rating ?? 0,
      fullName,
      mobile,
      profession,
      location,
      quote,
      mediaFile: media instanceof File && media.size > 0 ? media : null,
    };

    const detailsErr = validateGiveDetails(draft);
    if (detailsErr) return NextResponse.json({ error: detailsErr }, { status: 400 });

    const advisorUserId = await resolveAdvisorDataUserId();
    if (!advisorUserId) {
      return NextResponse.json({ error: "Advisor profile not found." }, { status: 404 });
    }

    const planCtx = await getAdvisorPlanContext(advisorUserId);
    if (!planCtx) {
      return NextResponse.json({ error: "Advisor profile not found." }, { status: 404 });
    }

    const profile = await getAdvisorProfileForUser(advisorUserId);
    const services = await loadServicesForUser(advisorUserId);
    const profileApproved = isAdvisorProfileApproved(profile);

    if (
      !isRegisteredTestimonialService(service, services, {
        profileApproved,
        publicOnly: true,
      })
    ) {
      return NextResponse.json(
        { error: "Please select a service offered on this advisor profile." },
        { status: 400 },
      );
    }

    const existing = await loadTestimonials();
    void existing;

    const contentErr = validateGiveContent(draft);
    if (contentErr) return NextResponse.json({ error: contentErr }, { status: 400 });

    if (!validateMobile(mobile)) {
      return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
    }

    const selfBlocked = await rejectAdvisorSelfSubmission(
      advisorUserId,
      mobile,
      ADVISOR_SELF_TESTIMONIAL_MESSAGE,
    );
    if (selfBlocked) return selfBlocked;

    if (await hasRecentTestimonialFromMobileForService(advisorUserId, mobile, service)) {
      return NextResponse.json({ error: TESTIMONIAL_MONTHLY_DUPLICATE_MESSAGE }, { status: 409 });
    }

    let mediaUrl: string | undefined;
    if (type !== "text" && draft.mediaFile) {
      const saved = await saveTestimonialMedia(draft.mediaFile, type, advisorUserId);
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
      service,
      name: fullName,
      profession: profession || "Client",
      location: location || "Andhra Pradesh",
      quote: displayQuote,
      rating: draft.rating,
      date: formatTestimonialDate(),
      memberBadge: "mobile-verified",
      verified: true,
      status: "published",
      submittedAt: new Date().toISOString(),
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

    const published = await appendPublishedTestimonial(item, mobile);
    return NextResponse.json({ ok: true, data: published });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Submission failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

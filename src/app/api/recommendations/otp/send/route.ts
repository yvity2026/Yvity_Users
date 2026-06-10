import { NextResponse } from "next/server";
import {
  ADVISOR_SELF_RECOMMENDATION_MESSAGE,
  rejectAdvisorSelfSubmissionForCurrentProfile,
} from "@/lib/server/advisor-self-submission-guard";
import { hasVerifiedRecommendationFromMobile } from "@/lib/server/recommendations-persistence";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";
import { issueOtp } from "@/lib/server/otp/service";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";

function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export async function POST(request: Request) {
  const advisorSettings = await loadAdvisorSettings();
  if (!advisorSettings.leads.recommendationRequests) {
    return NextResponse.json(
      { error: "Recommendation submissions are currently disabled." },
      { status: 403 },
    );
  }

  let body: { mobile?: string };
  try {
    body = (await request.json()) as { mobile?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mobile = body.mobile?.trim() ?? "";
  if (!isValidMobile(mobile)) {
    return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });
  }

  const advisorUserId = await resolveAdvisorDataUserId();
  if (!advisorUserId) {
    return NextResponse.json({ error: "Advisor profile not found." }, { status: 404 });
  }

  const selfBlocked = await rejectAdvisorSelfSubmissionForCurrentProfile(
    mobile,
    ADVISOR_SELF_RECOMMENDATION_MESSAGE,
  );
  if (selfBlocked) return selfBlocked;

  if (await hasVerifiedRecommendationFromMobile(mobile, advisorUserId)) {
    return NextResponse.json(
      {
        error:
          "This mobile number has already submitted a recommendation. Thank you for your support!",
      },
      { status: 409 },
    );
  }

  const result = await issueOtp({
    identifier: mobile,
    purpose: OTP_PURPOSE.RECOMMENDATION,
    channel: "whatsapp",
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not send verification code." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: result.message ?? "Verification code sent on WhatsApp.",
  });
}

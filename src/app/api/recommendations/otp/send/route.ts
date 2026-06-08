import { NextResponse } from "next/server";
import { DUMMY_OTP } from "@/lib/constants";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import {
  ADVISOR_SELF_RECOMMENDATION_MESSAGE,
  rejectAdvisorSelfSubmissionForCurrentProfile,
} from "@/lib/server/advisor-self-submission-guard";
import { hasVerifiedRecommendationFromMobile } from "@/lib/server/recommendations-persistence";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";

function isValidMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Sends an OTP to the supplied mobile number for the Recommend Advisor
 * flow. In demo mode there is no SMS provider — the client simply
 * displays the well-known `DUMMY_OTP` value as a hint.
 *
 * Returns 403 when the advisor has disabled recommendation requests
 * (Settings → Leads), and 409 when the mobile number has already been
 * used to submit a verified recommendation. Surfacing this *before*
 * sending the OTP avoids wasting the visitor's time.
 */
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

  return NextResponse.json({
    ok: true,
    message: `Demo OTP sent. Use ${DUMMY_OTP} to verify.`,
  });
}

import { NextResponse } from "next/server";
import { getAdvisorPlanContext } from "@/lib/advisor-membership/plan-enforcement-server";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import { unauthorized, requireSession } from "@/lib/server/api-auth";
import {
  appendRecommendation,
  hasVerifiedRecommendationFromMobile,
  loadRecommendations,
} from "@/lib/server/recommendations-persistence";
import {
  countHeldRecommendations,
  countPublishedRecommendations,
} from "@/lib/advisor-membership/content-visibility";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";
import {
  isRecommendationTag,
  normaliseMobile,
  type RecommendationTag,
} from "@/lib/recommendations/types";
import { verifyOtpCode } from "@/lib/server/auth";
import { OTP_PURPOSE } from "@/lib/server/otp/purposes";
import { getSessionUser } from "@/lib/server/session";
import {
  ADVISOR_SELF_RECOMMENDATION_MESSAGE,
  rejectAdvisorSelfSubmission,
} from "@/lib/server/advisor-self-submission-guard";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  const list = await loadRecommendations(user.id);
  const verified = list.filter((row) => row.verified);
  const planCtx = await getAdvisorPlanContext(user.id);

  if (planCtx) {
    const publishedCount = countPublishedRecommendations(planCtx.limits, list);
    const heldCount = countHeldRecommendations(planCtx.limits, list);
    return NextResponse.json({
      count: publishedCount,
      totalCount: verified.length,
      publishedCount,
      heldCount,
    });
  }

  return NextResponse.json({
    count: verified.length,
    totalCount: verified.length,
    publishedCount: verified.length,
    heldCount: 0,
  });
}

type RecommendationSubmission = {
  fullName?: string;
  mobile?: string;
  otp?: string;
  tags?: unknown;
  comment?: string;
};

export async function POST(request: Request) {
  const advisorSettings = await loadAdvisorSettings();
  if (!advisorSettings.leads.recommendationRequests) {
    return NextResponse.json(
      { error: "Recommendation submissions are currently disabled." },
      { status: 403 },
    );
  }

  let body: RecommendationSubmission;
  try {
    body = (await request.json()) as RecommendationSubmission;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fullName = body.fullName?.trim() ?? "";
  const mobile = body.mobile?.trim() ?? "";
  const otp = body.otp?.trim() ?? "";
  const comment = body.comment?.trim() ?? "";

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Please enter your full name" }, { status: 400 });
  }

  const normalised = normaliseMobile(mobile);
  if (normalised.length < 10) {
    return NextResponse.json({ error: "Please enter a valid mobile number" }, { status: 400 });
  }

  // Tag allowlist — must be a non-empty array of recognised tags. The UI
  // requires at least one chip to be selected before enabling Submit.
  const rawTags = Array.isArray(body.tags) ? body.tags : [];
  const tags: RecommendationTag[] = [];
  const seen = new Set<string>();
  for (const t of rawTags) {
    if (isRecommendationTag(t) && !seen.has(t)) {
      tags.push(t);
      seen.add(t);
    }
  }
  if (tags.length === 0) {
    return NextResponse.json(
      { error: "Pick at least one reason you recommend this advisor" },
      { status: 400 },
    );
  }

  // OTP for anonymous visitors; signed-in YVITY users skip OTP.
  const session = await getSessionUser();
  const skipOtp = Boolean(session?.id);
  if (!skipOtp && !(await verifyOtpCode(mobile, OTP_PURPOSE.RECOMMENDATION, otp))) {
    return NextResponse.json(
      { error: "Mobile number not verified. Please verify with OTP first." },
      { status: 401 },
    );
  }

  const advisorUserId = await resolveAdvisorDataUserId();
  if (!advisorUserId) {
    return NextResponse.json({ error: "Advisor profile not found." }, { status: 404 });
  }

  const selfBlocked = await rejectAdvisorSelfSubmission(
    advisorUserId,
    mobile,
    ADVISOR_SELF_RECOMMENDATION_MESSAGE,
  );
  if (selfBlocked) return selfBlocked;

  // Duplicate prevention — one verified recommendation per mobile.
  if (await hasVerifiedRecommendationFromMobile(mobile, advisorUserId)) {
    return NextResponse.json(
      {
        error:
          "This mobile number has already submitted a recommendation. Thank you for your support!",
      },
      { status: 409 },
    );
  }

  const entry = await appendRecommendation(
    {
      fullName,
      mobile,
      mobileNormalised: normalised,
      tags,
      comment: comment || undefined,
      verified: true,
    },
    advisorUserId,
  );

  return NextResponse.json({ ok: true, id: entry.id });
}

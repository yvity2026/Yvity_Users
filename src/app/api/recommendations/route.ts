import { NextResponse } from "next/server";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import {
  appendRecommendation,
  hasVerifiedRecommendationFromMobile,
} from "@/lib/server/recommendations-persistence";
import {
  isRecommendationTag,
  normaliseMobile,
  type RecommendationTag,
} from "@/lib/recommendations/types";
import { verifyOtpCode } from "@/lib/server/auth";

export const runtime = "nodejs";

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

  // OTP verification is mandatory — we only persist *verified*
  // recommendations. The OTP was already validated by the inline
  // `/otp/verify` endpoint; this is the authoritative re-check.
  if (!verifyOtpCode(otp)) {
    return NextResponse.json(
      { error: "Mobile number not verified. Please verify with OTP first." },
      { status: 401 },
    );
  }

  // Duplicate prevention — one verified recommendation per mobile.
  if (await hasVerifiedRecommendationFromMobile(mobile)) {
    return NextResponse.json(
      {
        error:
          "This mobile number has already submitted a recommendation. Thank you for your support!",
      },
      { status: 409 },
    );
  }

  const entry = await appendRecommendation({
    fullName,
    mobile,
    mobileNormalised: normalised,
    tags,
    comment: comment || undefined,
    verified: true,
  });

  return NextResponse.json({ ok: true, id: entry.id });
}

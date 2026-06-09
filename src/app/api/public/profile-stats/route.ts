import { NextResponse } from "next/server";
import { buildDecayNegativeRules } from "@/lib/advisor-score/decay";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";
import { filterTestimonialsForPublicDisplay, countPublishedRecommendations } from "@/lib/advisor-membership/content-visibility";
import { evaluateAdvisorScoreDecay } from "@/lib/server/evaluate-score-decay";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { loadRecommendations } from "@/lib/server/recommendations-persistence";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";
import { loadPublicProfileEngagementTelemetry } from "@/lib/server/score-activity-persistence";
import { loadTestimonials } from "@/lib/server/testimonials-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public profile engagement stats for the viewed advisor (cookie or session). */
export async function GET() {
  const userId = await resolveAdvisorDataUserId();
  if (!userId) {
    return NextResponse.json({
      recommendationCount: 0,
      testimonialCount: 0,
      decayPenalty: 0,
      decayActive: false,
      graceDaysRemaining: null,
    });
  }

  const profile = await getAdvisorProfileForUser(userId);
  const limits = resolvePlanLimits(profile?.subscription_plan, profile?.account_status);
  const approved = isAdvisorProfileApproved(profile);
  const [testimonials, recommendations, decayState, engagement] = await Promise.all([
    loadTestimonials(),
    loadRecommendations(userId),
    evaluateAdvisorScoreDecay(userId, {
      profileApproved: approved,
    }),
    approved ? loadPublicProfileEngagementTelemetry(userId) : null,
  ]);

  const visibleTestimonials = filterTestimonialsForPublicDisplay(limits, testimonials);
  const recommendationCount = countPublishedRecommendations(limits, recommendations);

  return NextResponse.json({
    recommendationCount: Math.max(0, recommendationCount),
    testimonialCount: visibleTestimonials.length,
    profileViews: engagement?.profileViews ?? 0,
    profileViewsDelta: engagement?.profileViewsDelta ?? "0%",
    profileSharesByOthers: engagement?.clientSharers ?? 0,
    profileSharesDelta: engagement?.clientSharersDelta ?? "0%",
    decayPenalty: decayState.penalty,
    decayActive: decayState.active,
    graceDaysRemaining: decayState.graceDaysRemaining,
    currentMonthActivity: decayState.currentMonthActivity,
    negativeRules: buildDecayNegativeRules(decayState),
  });
}

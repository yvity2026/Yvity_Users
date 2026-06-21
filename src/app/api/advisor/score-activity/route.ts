import { NextResponse } from "next/server";
import { buildDecayNegativeRules } from "@/lib/advisor-score/decay";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";
import { evaluateAdvisorScoreDecayForSession } from "@/lib/server/evaluate-score-decay";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { loadAdvisorPerformanceTelemetry } from "@/lib/server/score-activity-persistence";
import { unauthorized, requireSession } from "@/lib/server/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Monthly activity + decay ledger for the signed-in advisor's YVITY Score. */
export async function GET() {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  const state = await evaluateAdvisorScoreDecayForSession();
  if (!state) return unauthorized();

  const profile = await getAdvisorProfileForUser(user.id);
  const approved = isAdvisorProfileApproved(profile);
  const limits = resolvePlanLimits(profile?.subscription_plan, profile?.account_status);
  const telemetry = approved
    ? await loadAdvisorPerformanceTelemetry(user.id)
    : {
        profileViews: 0,
        profileViewsDelta: "0%",
        totalProfileViews: 0,
        searchAppearances: 0,
        searchDelta: "0%",
      };

  const searchTelemetry = limits.profileAnalytics
    ? telemetry
    : { ...telemetry, searchAppearances: 0, searchDelta: "0%" };

  return NextResponse.json({
    decayPenalty: state.penalty,
    decayActive: state.active,
    graceDaysRemaining: state.graceDaysRemaining,
    breakdown: state.breakdown,
    currentMonthActivity: state.currentMonthActivity,
    negativeRules: buildDecayNegativeRules(state),
    profileViews: telemetry.profileViews,
    profileViewsDelta: telemetry.profileViewsDelta,
    totalProfileViews: telemetry.totalProfileViews,
    searchAppearances: searchTelemetry.searchAppearances,
    searchDelta: searchTelemetry.searchDelta,
    analyticsEnabled: limits.profileAnalytics,
  });
}

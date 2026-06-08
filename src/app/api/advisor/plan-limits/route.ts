import { NextResponse } from "next/server";
import { resolvePlanLimitsAsync } from "@/lib/advisor-membership/plan-limits-server";
import { getEffectivePlan } from "@/lib/advisor/planFeatures";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { getGlobalFeatureFlags } from "@/lib/server/feature-controls-store";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const profile = await getAdvisorProfileForUser(session.id);
    const planId = getEffectivePlan(
      profile?.subscription_plan,
      profile?.account_status ?? "active",
    ) as MembershipPlanId;

    const [limits, globalFlags] = await Promise.all([
      resolvePlanLimitsAsync(profile?.subscription_plan, profile?.account_status ?? "active"),
      getGlobalFeatureFlags(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        planId,
        limits,
        globalFlags,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load plan limits";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

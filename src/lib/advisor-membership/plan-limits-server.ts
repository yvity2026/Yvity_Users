import "server-only";

import { getEffectivePlan } from "@/lib/advisor/planFeatures";
import { getConfiguredPlanLimits } from "@/lib/server/feature-controls-store";
import {
  getPlanLimits,
  PLAN_LIMITS,
  type PlanLimits,
} from "@/lib/advisor-membership/plan-limits";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";

export async function getConfiguredPlanLimitsAsync(
  planId: MembershipPlanId,
): Promise<PlanLimits> {
  try {
    return await getConfiguredPlanLimits(planId);
  } catch {
    return PLAN_LIMITS[planId];
  }
}

export async function resolvePlanLimitsAsync(
  subscriptionPlan: unknown,
  accountStatus: unknown = "active",
): Promise<PlanLimits> {
  const planId = getEffectivePlan(subscriptionPlan, accountStatus) as MembershipPlanId;
  return getConfiguredPlanLimitsAsync(planId);
}

export function resolvePlanLimitsFromProfile(
  subscriptionPlan: unknown,
  accountStatus: unknown = "active",
): PlanLimits {
  const planId = getEffectivePlan(subscriptionPlan, accountStatus) as MembershipPlanId;
  return getPlanLimits(planId);
}

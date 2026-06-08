import "server-only";

import { getEffectivePlan } from "@/lib/advisor/planFeatures";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { resolvePlanLimitsAsync } from "./plan-limits-server";
import type { PlanLimits } from "./plan-limits";
import type { MembershipPlanId } from "./types";

export type AdvisorPlanContext = {
  userId: string;
  planId: MembershipPlanId;
  limits: PlanLimits;
};

export async function getAdvisorPlanContext(userId: string): Promise<AdvisorPlanContext | null> {
  const id = userId.trim();
  if (!id) return null;
  const profile = await getAdvisorProfileForUser(id);
  if (!profile) return null;
  const planId = getEffectivePlan(profile.subscription_plan, profile.account_status) as MembershipPlanId;
  return {
    userId: id,
    planId,
    limits: await resolvePlanLimitsAsync(profile.subscription_plan, profile.account_status),
  };
}

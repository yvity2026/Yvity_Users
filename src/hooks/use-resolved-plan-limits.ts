"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { getEffectivePlan } from "@/lib/advisor/planFeatures";
import { allowedThemeIds } from "@/lib/advisor-membership/plan-enforcement";
import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";

/** Plan limits for the advisor being viewed (public profile) or signed-in user. */
export function useResolvedPlanLimits() {
  const { advisor } = useAuth();
  const publicView = usePublicProfileView();

  return useMemo(() => {
    const subscriptionPlan =
      publicView?.profile?.subscription_plan ?? advisor?.subscription_plan;
    const accountStatus =
      publicView?.profile?.account_status ?? advisor?.account_status ?? "active";
    const planId = getEffectivePlan(subscriptionPlan, accountStatus) as MembershipPlanId;
    const limits = resolvePlanLimits(subscriptionPlan, accountStatus);

    return {
      planId,
      limits,
      themes: allowedThemeIds(limits),
      canAccessAnalytics: limits.profileAnalytics,
      canAppearInSearch: limits.searchAppearance,
      canVerifyServices: limits.serviceVerification,
      showYvityVerifiedBadge: limits.yvityVerifiedBadge,
      introVideoEnabled: limits.introVideoEnabled,
      introVideoMaxSeconds: limits.introVideoMaxSeconds,
      introVideoHeroPlacement: limits.introVideoHeroPlacement,
    };
  }, [
    publicView?.profile?.subscription_plan,
    publicView?.profile?.account_status,
    advisor?.subscription_plan,
    advisor?.account_status,
  ]);
}

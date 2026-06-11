"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { getEffectivePlan } from "@/lib/advisor/planFeatures";
import {
  allowedThemeIds,
  canAcceptRecommendation,
  canAcceptTestimonialType,
  canAddGalleryPhoto,
  countCustomerTestimonialsByType,
} from "@/lib/advisor-membership/plan-enforcement";
import { resolvePlanLimits, type PlanLimits } from "@/lib/advisor-membership/plan-limits";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import type { TestimonialItem, TestimonialType } from "@/lib/sections/types";

function buildLimitHelpers(planId: MembershipPlanId, limits: PlanLimits) {
  return {
    planId,
    limits,
    themes: allowedThemeIds(planId),
    canAccessAnalytics: limits.profileAnalytics,
    canAppearInSearch: limits.searchAppearance,
    canVerifyServices: limits.serviceVerification,
    showYvityVerifiedBadge: limits.yvityVerifiedBadge,
    testimonialCap: (type: TestimonialType) => limits.testimonials[type],
    galleryCap: limits.galleryPhotos,
    recommendationCap: limits.recommendations,
    leadsCap: limits.leadsVisible,
    introVideoEnabled: limits.introVideoEnabled,
    introVideoMaxSeconds: limits.introVideoMaxSeconds,
    introVideoHeroPlacement: limits.introVideoHeroPlacement,
    canAddTestimonial: (items: TestimonialItem[], type: TestimonialType) =>
      canAcceptTestimonialType(limits, items, type, planId),
    canAddGalleryItem: (count: number) => canAddGalleryPhoto(limits, count, planId),
    canAddRecommendation: (count: number) => canAcceptRecommendation(limits, count, planId),
    countTestimonials: (items: TestimonialItem[]) => countCustomerTestimonialsByType(items),
  };
}

/** Client-side plan limits for the signed-in advisor. */
export function usePlanLimits() {
  const { advisor } = useAuth();
  const [remoteLimits, setRemoteLimits] = useState<PlanLimits | null>(null);

  const planId = getEffectivePlan(
    advisor?.subscription_plan,
    advisor?.account_status ?? "active",
  ) as MembershipPlanId;

  const fallbackLimits = useMemo(
    () => resolvePlanLimits(advisor?.subscription_plan, advisor?.account_status ?? "active"),
    [advisor?.subscription_plan, advisor?.account_status],
  );

  useEffect(() => {
    if (!advisor?.id) {
      setRemoteLimits(null);
      return;
    }

    let cancelled = false;
    void fetch("/api/advisor/plan-limits", { cache: "no-store", credentials: "same-origin" })
      .then(async (res) => {
        const json = (await res.json()) as {
          success?: boolean;
          data?: { limits?: PlanLimits };
        };
        if (!cancelled && res.ok && json.success && json.data?.limits) {
          setRemoteLimits(json.data.limits);
        }
      })
      .catch(() => {
        if (!cancelled) setRemoteLimits(null);
      });

    return () => {
      cancelled = true;
    };
  }, [advisor?.id, advisor?.subscription_plan, advisor?.account_status]);

  const limits = remoteLimits ?? fallbackLimits;
  return useMemo(() => buildLimitHelpers(planId, limits), [planId, limits]);
}

export type UsePlanLimitsResult = ReturnType<typeof usePlanLimits> & {
  planId: MembershipPlanId;
};

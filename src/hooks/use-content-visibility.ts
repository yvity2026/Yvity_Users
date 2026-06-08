"use client";

import { useMemo } from "react";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import {
  countHeldRecommendations,
  countHeldTestimonials,
  countPublishedRecommendations,
  heldTestimonialsByType,
  resolveTestimonialPublicVisibility,
  upgradePlanForHeldContent,
  type PublicVisibility,
} from "@/lib/advisor-membership/content-visibility";
import type { TestimonialItem } from "@/lib/sections/types";

export function useTestimonialVisibility(items: TestimonialItem[]) {
  const { limits, planId } = usePlanLimits();

  return useMemo(() => {
    const visibility = resolveTestimonialPublicVisibility(limits, items);
    const visibilityFor = (id: string): PublicVisibility =>
      visibility.get(id) ?? "published";

    return {
      planId,
      limits,
      visibilityFor,
      heldCount: countHeldTestimonials(limits, items),
      heldByType: heldTestimonialsByType(limits, items),
      upgradePlan: upgradePlanForHeldContent(planId),
      publishedItems: items.filter((item) => visibilityFor(item.id) === "published"),
    };
  }, [items, limits, planId]);
}

export function useHeldRecommendationCount(recommendationCount: number, heldCount = 0) {
  const { planId, recommendationCap } = usePlanLimits();

  return useMemo(
    () => ({
      publishedCount: Math.max(0, recommendationCount - heldCount),
      heldCount,
      upgradePlan: upgradePlanForHeldContent(planId),
      recommendationCap,
    }),
    [recommendationCount, heldCount, planId, recommendationCap],
  );
}

/** Re-export for API-side usage in hooks that fetch held count from server. */
export { countHeldRecommendations, countPublishedRecommendations };

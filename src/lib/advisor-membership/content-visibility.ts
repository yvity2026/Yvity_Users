import type { AdvisorRecommendation } from "@/lib/recommendations/types";
import type { TestimonialItem, TestimonialType } from "@/lib/sections/types";
import type { PlanLimits } from "./plan-limits";
import { nextUpgradePlan } from "./plan-limits";
import type { MembershipPlanId } from "./types";

export type PublicVisibility = "published" | "held";

const CAPPED_TESTIMONIAL_TYPES: TestimonialType[] = ["audio", "video"];

/** Lower index in `items` = newer (list is stored newest-first). */
function listIndex(items: TestimonialItem[], id: string): number {
  const index = items.findIndex((item) => item.id === id);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/** First-come slots: oldest customer submissions keep public visibility once the cap is full. */
export function resolveTestimonialPublicVisibility(
  limits: PlanLimits,
  items: TestimonialItem[],
): Map<string, PublicVisibility> {
  const visibility = new Map<string, PublicVisibility>();

  for (const item of items) {
    if (item.source === "advisor" || item.type === "text") {
      visibility.set(item.id, "published");
    }
  }

  for (const type of CAPPED_TESTIMONIAL_TYPES) {
    const cap = limits.testimonials[type];
    const ofType = items.filter((item) => item.source !== "advisor" && item.type === type);

    if (cap === null) {
      ofType.forEach((item) => visibility.set(item.id, "published"));
      continue;
    }

    const oldestFirst = [...ofType].sort(
      (a, b) => listIndex(items, b.id) - listIndex(items, a.id),
    );

    oldestFirst.forEach((item, index) => {
      visibility.set(item.id, index < cap ? "published" : "held");
    });
  }

  for (const item of items) {
    if (!visibility.has(item.id)) {
      visibility.set(item.id, "published");
    }
  }

  return visibility;
}

export function sortTestimonialsNewestFirst(
  subset: TestimonialItem[],
  orderRef: TestimonialItem[],
): TestimonialItem[] {
  return [...subset].sort(
    (a, b) => listIndex(orderRef, a.id) - listIndex(orderRef, b.id),
  );
}

/** Public profile: published only, newest first. */
export function filterTestimonialsForPublicDisplay(
  limits: PlanLimits,
  items: TestimonialItem[],
): TestimonialItem[] {
  const visibility = resolveTestimonialPublicVisibility(limits, items);
  const published = items.filter((item) => visibility.get(item.id) === "published");
  return sortTestimonialsNewestFirst(published, items);
}

export function countHeldTestimonials(limits: PlanLimits, items: TestimonialItem[]): number {
  const visibility = resolveTestimonialPublicVisibility(limits, items);
  return items.filter(
    (item) => item.source !== "advisor" && visibility.get(item.id) === "held",
  ).length;
}

export function heldTestimonialsByType(
  limits: PlanLimits,
  items: TestimonialItem[],
): Partial<Record<TestimonialType, number>> {
  const visibility = resolveTestimonialPublicVisibility(limits, items);
  const counts: Partial<Record<TestimonialType, number>> = {};
  for (const item of items) {
    if (item.source === "advisor") continue;
    if (visibility.get(item.id) !== "held") continue;
    counts[item.type] = (counts[item.type] ?? 0) + 1;
  }
  return counts;
}

export function resolveRecommendationPublicVisibility(
  limits: PlanLimits,
  items: AdvisorRecommendation[],
): Map<string, PublicVisibility> {
  const visibility = new Map<string, PublicVisibility>();
  const verified = items
    .filter((row) => row.verified)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const cap = limits.recommendations;

  verified.forEach((row, index) => {
    visibility.set(row.id, cap === null || index < cap ? "published" : "held");
  });

  return visibility;
}

export function countPublishedRecommendations(
  limits: PlanLimits,
  items: AdvisorRecommendation[],
): number {
  const visibility = resolveRecommendationPublicVisibility(limits, items);
  return items.filter((row) => row.verified && visibility.get(row.id) === "published").length;
}

export function countHeldRecommendations(
  limits: PlanLimits,
  items: AdvisorRecommendation[],
): number {
  const visibility = resolveRecommendationPublicVisibility(limits, items);
  return items.filter((row) => row.verified && visibility.get(row.id) === "held").length;
}

export function upgradePlanForHeldContent(planId: MembershipPlanId): MembershipPlanId | null {
  return nextUpgradePlan(planId);
}

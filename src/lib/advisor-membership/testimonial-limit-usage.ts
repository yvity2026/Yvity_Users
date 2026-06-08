import type { TestimonialType } from "@/lib/sections/types";
import type { PlanLimits } from "./plan-limits";
import { planLimitUsage, type PlanLimitUsage } from "./plan-limit-usage";

export type TestimonialTypeLimitRow = {
  type: TestimonialType;
  usage: PlanLimitUsage;
};

const TESTIMONIAL_TYPES: TestimonialType[] = ["text", "audio", "video"];

/** Capped testimonial types that are at or near the plan limit. */
export function listActiveTestimonialLimitRows(
  limits: PlanLimits,
  counts: Record<TestimonialType, number>,
): TestimonialTypeLimitRow[] {
  const rows: TestimonialTypeLimitRow[] = [];

  for (const type of TESTIMONIAL_TYPES) {
    const cap = limits.testimonials[type];
    if (cap === null) continue;
    const usage = planLimitUsage(counts[type], cap);
    if (usage.atLimit || usage.nearLimit) {
      rows.push({ type, usage });
    }
  }

  return rows;
}

export function canAcceptAnyTestimonialType(
  limits: PlanLimits,
  counts: Record<TestimonialType, number>,
): boolean {
  return TESTIMONIAL_TYPES.some((type) => {
    const cap = limits.testimonials[type];
    return cap === null || counts[type] < cap;
  });
}

export function firstAvailableTestimonialType(
  limits: PlanLimits,
  counts: Record<TestimonialType, number>,
): TestimonialType | null {
  for (const type of TESTIMONIAL_TYPES) {
    const cap = limits.testimonials[type];
    if (cap === null || counts[type] < cap) return type;
  }
  return null;
}

import { MEMBERSHIP_PLAN_MARKETING } from "./plan-catalog";
import type { MembershipFeature, MembershipFeatureId, MembershipPlanDefinition } from "./types";

/** @deprecated Legacy feature ids — enforcement wiring uses plan-catalog limits next. */
export const MEMBERSHIP_FEATURES: MembershipFeature[] = [
  { id: "public_profile", label: "Public Profile" },
  { id: "services", label: "Services" },
  { id: "career_journey", label: "Career Journey" },
  { id: "education", label: "Educational Journey" },
  { id: "testimonials", label: "Testimonials" },
  { id: "gallery", label: "Gallery" },
  { id: "achievements", label: "Achievements" },
  { id: "leads", label: "Leads Management" },
  { id: "insights", label: "Insights" },
  { id: "verified_badge", label: "YVITY Verified Badge" },
];

const legacyFeatures: Record<MembershipPlanDefinition["id"], MembershipFeatureId[]> = {
  free: ["public_profile", "services", "career_journey"],
  silver: [
    "public_profile",
    "services",
    "career_journey",
    "education",
    "testimonials",
    "gallery",
    "achievements",
    "leads",
    "verified_badge",
  ],
  gold: [
    "public_profile",
    "services",
    "career_journey",
    "education",
    "testimonials",
    "gallery",
    "achievements",
    "leads",
    "insights",
    "verified_badge",
  ],
};

export const MEMBERSHIP_PLANS: MembershipPlanDefinition[] = MEMBERSHIP_PLAN_MARKETING.map(
  (card) => ({
    id: card.id,
    name: card.name,
    priceLabel: card.priceLabel,
    priceAnnualInr: card.priceAnnualInr,
    tagline: card.tagline,
    highlight: card.highlight,
    features: legacyFeatures[card.id],
  }),
);

export function planHasFeature(
  planId: MembershipPlanDefinition["id"],
  featureId: MembershipFeatureId,
): boolean {
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
  return plan?.features.includes(featureId) ?? false;
}

export function featuresForPlan(planId: MembershipPlanDefinition["id"]): MembershipFeature[] {
  const labels = MEMBERSHIP_PLAN_MARKETING.find((p) => p.id === planId)?.included ?? [];
  return labels.map((label, index) => ({
    id: `marketing_${index}` as MembershipFeatureId,
    label,
  }));
}

export function upgradePlanId(
  current: MembershipPlanDefinition["id"],
): MembershipPlanDefinition["id"] | null {
  if (current === "free") return "silver";
  if (current === "silver") return "gold";
  return null;
}

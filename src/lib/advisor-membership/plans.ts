import type { MembershipFeature, MembershipFeatureId, MembershipPlanDefinition } from "./types";

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

const freeFeatures: MembershipFeatureId[] = ["public_profile", "services", "career_journey"];

const silverFeatures: MembershipFeatureId[] = [
  ...freeFeatures,
  "education",
  "testimonials",
  "gallery",
  "achievements",
  "leads",
];

const goldFeatures: MembershipFeatureId[] = [...silverFeatures, "insights", "verified_badge"];

export const MEMBERSHIP_PLANS: MembershipPlanDefinition[] = [
  {
    id: "free",
    name: "FREE",
    priceLabel: "Free",
    priceAnnualInr: 0,
    tagline: "Start your digital presence",
    features: freeFeatures,
  },
  {
    id: "silver",
    name: "SILVER",
    priceLabel: "₹1,499/year",
    priceAnnualInr: 1499,
    tagline: "Grow with leads & social proof",
    features: silverFeatures,
    highlight: "Most popular for active advisors",
  },
  {
    id: "gold",
    name: "GOLD",
    priceLabel: "₹2,999/year",
    priceAnnualInr: 2999,
    tagline: "Full credibility & growth toolkit",
    features: goldFeatures,
    highlight: "Verified badge & insights included",
  },
];

export function planHasFeature(
  planId: MembershipPlanDefinition["id"],
  featureId: MembershipFeatureId,
): boolean {
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
  return plan?.features.includes(featureId) ?? false;
}

export function featuresForPlan(planId: MembershipPlanDefinition["id"]): MembershipFeature[] {
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
  if (!plan) return [];
  return MEMBERSHIP_FEATURES.filter((f) => plan.features.includes(f.id));
}

export function upgradePlanId(
  current: MembershipPlanDefinition["id"],
): MembershipPlanDefinition["id"] | null {
  if (current === "free") return "silver";
  if (current === "silver") return "gold";
  return null;
}

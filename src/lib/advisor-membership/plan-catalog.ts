import type { MembershipPlanId } from "./types";

export type PlanMarketingCard = {
  id: MembershipPlanId;
  name: string;
  priceAnnualInr: number;
  priceLabel: string;
  tagline: string;
  highlight?: string;
  included: string[];
  excluded: string[];
};

/** Single source of truth for plan marketing copy (landing + membership UI). */
export const MEMBERSHIP_PLAN_MARKETING: PlanMarketingCard[] = [
  {
    id: "free",
    name: "FREE PLAN",
    priceAnnualInr: 0,
    priceLabel: "₹0",
    tagline: "Perfect for trying YVITY",
    included: [
      "Public Profile",
      "Identity Verified Registration",
      "Add Services",
      "Unlimited Text Testimonials",
      "2 Audio Testimonials",
      "1 Video Testimonial",
      "5 Gallery Photos",
      "1 Recommendation",
      "View First 5 Leads",
      "1 Profile Theme",
    ],
    excluded: [
      "Service Verification",
      "YVITY Verified Badge",
      "Search Appearance",
      "Profile Analytics",
      "Featured Advisor Eligibility",
    ],
  },
  {
    id: "silver",
    name: "SILVER PLAN",
    priceAnnualInr: 1499,
    priceLabel: "₹1,499/year",
    tagline: "For Verified Professionals",
    highlight: "Most popular for active advisors",
    included: [
      "Public Profile",
      "Identity Verification",
      "Service Verification",
      "YVITY Verified Badge",
      "Unlimited Text Testimonials",
      "Unlimited Audio Testimonials",
      "5 Video Testimonials",
      "25 Gallery Photos",
      "30 Second Intro Video",
      "15 Recommendations",
      "View First 25 Leads",
      "2 Profile Themes",
      "Priority Profile Review",
    ],
    excluded: ["Search Appearance", "Profile Analytics", "Featured Advisor Eligibility"],
  },
  {
    id: "gold",
    name: "GOLD PLAN",
    priceAnnualInr: 2999,
    priceLabel: "₹2,999/year",
    tagline: "For Maximum Visibility & Growth",
    highlight: "Maximum visibility",
    included: [
      "Public Profile",
      "Identity Verification",
      "Service Verification",
      "YVITY Verified Badge",
      "Unlimited Text Testimonials",
      "Unlimited Audio Testimonials",
      "Unlimited Video Testimonials",
      "Unlimited Gallery Photos",
      "2 Minute Intro Video (Hero Placement)",
      "Unlimited Recommendations",
      "Unlimited Lead Visibility",
      "Search Appearance",
      "Profile Analytics",
      "Featured Advisor Eligibility",
      "Unlimited Profile Themes",
      "Highest Priority Profile Review",
    ],
    excluded: [],
  },
];

export function getPlanMarketing(planId: MembershipPlanId): PlanMarketingCard {
  return MEMBERSHIP_PLAN_MARKETING.find((p) => p.id === planId) ?? MEMBERSHIP_PLAN_MARKETING[0]!;
}

export function marketingFeatureRows(
  planId: MembershipPlanId,
): { label: string; included: boolean }[] {
  const plan = getPlanMarketing(planId);
  return [
    ...plan.included.map((label) => ({ label, included: true })),
    ...plan.excluded.map((label) => ({ label, included: false })),
  ];
}

export function includedBenefitLabels(planId: MembershipPlanId): string[] {
  return getPlanMarketing(planId).included;
}

/** Rows for the desktop plan comparison table (union of all plan feature labels). */
export function allPlanComparisonLabels(): string[] {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const plan of MEMBERSHIP_PLAN_MARKETING) {
    for (const label of [...plan.included, ...plan.excluded]) {
      if (!seen.has(label)) {
        seen.add(label);
        rows.push(label);
      }
    }
  }
  return rows;
}

export function planMarketingIncludes(planId: MembershipPlanId, label: string): boolean {
  const plan = getPlanMarketing(planId);
  return plan.included.includes(label);
}

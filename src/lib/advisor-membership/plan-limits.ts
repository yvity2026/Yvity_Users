import { getEffectivePlan } from "@/lib/advisor/planFeatures";
import type { MembershipPlanId } from "./types";

export type PlanLimits = {
  testimonials: { text: number | null; audio: number | null; video: number | null };
  galleryPhotos: number | null;
  introVideoEnabled: boolean;
  introVideoMaxSeconds: number;
  /** Gold — prominent intro video in the profile hero (Silver uses trust strip only). */
  introVideoHeroPlacement: boolean;
  recommendations: number | null;
  leadsVisible: number | null;
  profileThemes: number | null;
  serviceVerification: boolean;
  yvityVerifiedBadge: boolean;
  searchAppearance: boolean;
  profileAnalytics: boolean;
  featuredAdvisorEligibility: boolean;
};

export const PLAN_LIMITS: Record<MembershipPlanId, PlanLimits> = {
  free: {
    testimonials: { text: null, audio: 2, video: 1 },
    galleryPhotos: 5,
    introVideoEnabled: false,
    introVideoMaxSeconds: 0,
    introVideoHeroPlacement: false,
    recommendations: 1,
    leadsVisible: 5,
    profileThemes: 1,
    serviceVerification: false,
    yvityVerifiedBadge: false,
    searchAppearance: false,
    profileAnalytics: false,
    featuredAdvisorEligibility: false,
  },
  silver: {
    testimonials: { text: null, audio: null, video: 5 },
    galleryPhotos: 25,
    introVideoEnabled: true,
    introVideoMaxSeconds: 30,
    introVideoHeroPlacement: false,
    recommendations: 15,
    leadsVisible: 25,
    profileThemes: 2,
    serviceVerification: true,
    yvityVerifiedBadge: true,
    searchAppearance: false,
    profileAnalytics: false,
    featuredAdvisorEligibility: false,
  },
  gold: {
    testimonials: { text: null, audio: null, video: null },
    galleryPhotos: null,
    introVideoEnabled: true,
    introVideoMaxSeconds: 120,
    introVideoHeroPlacement: true,
    recommendations: null,
    leadsVisible: null,
    profileThemes: null,
    serviceVerification: true,
    yvityVerifiedBadge: true,
    searchAppearance: true,
    profileAnalytics: true,
    featuredAdvisorEligibility: true,
  },
};

export function getPlanLimits(planId: MembershipPlanId): PlanLimits {
  return PLAN_LIMITS[planId];
}

export function resolvePlanLimits(
  subscriptionPlan: unknown,
  accountStatus: unknown = "active",
): PlanLimits {
  const planId = getEffectivePlan(subscriptionPlan, accountStatus) as MembershipPlanId;
  return getPlanLimits(planId);
}

export function formatLimit(value: number | null): string {
  if (value === null) return "Unlimited";
  return String(value);
}

export function nextUpgradePlan(planId: MembershipPlanId): MembershipPlanId | null {
  if (planId === "free") return "silver";
  if (planId === "silver") return "gold";
  return null;
}

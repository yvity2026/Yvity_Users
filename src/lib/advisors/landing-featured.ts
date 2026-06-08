import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";

export const LANDING_FEATURED_LIMIT = 6;
export const HERO_FEATURED_LIMIT = 3;

export function pickHeroAdvisors(advisors: PublicAdvisorCard[] = []) {
  return advisors.filter((advisor) => advisor.isHero).slice(0, HERO_FEATURED_LIMIT);
}

export function pickLandingFeaturedAdvisors(
  advisors: PublicAdvisorCard[] = [],
  limit = LANDING_FEATURED_LIMIT,
) {
  return advisors.filter((advisor) => advisor.isLanding).slice(0, limit);
}

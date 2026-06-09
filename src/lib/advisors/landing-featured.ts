import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import { compareAdvisors } from "@/lib/advisors/publicAdvisorFilters";

export const LANDING_FEATURED_LIMIT = 6;
export const HERO_FEATURED_LIMIT = 3;

function topPublicAdvisors(
  advisors: PublicAdvisorCard[] = [],
  limit: number,
): PublicAdvisorCard[] {
  return [...advisors].sort(compareAdvisors).slice(0, limit);
}

/** Hero card — flagged advisors first, otherwise highest-ranked live profile. */
export function pickHeroAdvisors(advisors: PublicAdvisorCard[] = []) {
  const flagged = advisors.filter((advisor) => advisor.isHero).slice(0, HERO_FEATURED_LIMIT);
  if (flagged.length > 0) return flagged;
  return topPublicAdvisors(advisors, HERO_FEATURED_LIMIT);
}

/** Find Advisors section — flagged first, otherwise top public profiles. */
export function pickLandingFeaturedAdvisors(
  advisors: PublicAdvisorCard[] = [],
  limit = LANDING_FEATURED_LIMIT,
) {
  const flagged = advisors.filter((advisor) => advisor.isLanding).slice(0, limit);
  if (flagged.length > 0) return flagged;
  return topPublicAdvisors(advisors, limit);
}

import {
  compareAdvisors,
  filterAdvisors,
} from "@/lib/advisors/publicAdvisorFilters";

export function filterHomeAdvisors(advisors, filters = {}) {
  return filterAdvisors(advisors, {
    name: filters.query || filters.name,
    city: filters.city,
    service: filters.service,
    company: filters.company,
  });
}

export function sortAdvisorsByRating(advisors) {
  return [...advisors].sort(
    (a, b) => Number(b.avgRating || 0) - Number(a.avgRating || 0),
  );
}

import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";

export function getFeaturedAdvisors(advisors, limit = 8) {
  const eligible = advisors.filter(
    (a) => resolvePlanLimits(a.subscription_plan, a.account_status).featuredAdvisorEligibility,
  );
  const flagged = eligible.filter((a) => a.isHero || a.isLanding);
  const pool = flagged.length >= 3 ? flagged : eligible;
  return [...pool].sort(compareAdvisors).slice(0, limit);
}

export function getRecommendedAdvisors(
  advisors,
  { userCity = "", activeService = "", recentService = "" } = {},
  limit = 8,
) {
  const city = String(userCity || "").trim().toLowerCase();
  const serviceHint = String(recentService || activeService || "")
    .trim()
    .toLowerCase();

  return [...advisors]
    .sort((a, b) => {
      const score = (advisor) => {
        let points = Number(advisor.score || 0) / 100;

        if (city && String(advisor.location || "").toLowerCase().includes(city)) {
          points += 3;
        }

        if (advisor.showIdentityVerified) {
          points += 1.5;
        }

        if (
          serviceHint &&
          (advisor.serviceTypes ?? []).some(
            (type) => String(type).toLowerCase() === serviceHint,
          )
        ) {
          points += 2.5;
        }

        points += Number(advisor.avgRating || 0) / 5;

        return points;
      };

      return score(b) - score(a);
    })
    .slice(0, limit);
}

export function getTopRatedAdvisors(advisors, limit = 6) {
  return sortAdvisorsByRating(advisors).slice(0, limit);
}

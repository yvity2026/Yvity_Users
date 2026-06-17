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
  // Prefer Gold members; fall back to Silver; fall back to all active advisors
  const goldEligible = advisors.filter(
    (a) => resolvePlanLimits(a.subscription_plan, a.account_status).featuredAdvisorEligibility,
  );

  let pool;
  let isTopRatedFallback = false;

  if (goldEligible.length > 0) {
    const flagged = goldEligible.filter((a) => a.isHero || a.isLanding);
    pool = flagged.length >= 3 ? flagged : goldEligible;
  } else {
    const silverEligible = advisors.filter(
      (a) => String(a.subscription_plan || "").toLowerCase() === "silver" &&
             String(a.account_status || "").toLowerCase() === "active",
    );
    if (silverEligible.length > 0) {
      pool = silverEligible;
      isTopRatedFallback = true;
    } else {
      pool = advisors.filter(
        (a) => String(a.account_status || "").toLowerCase() === "active",
      );
      isTopRatedFallback = true;
    }
  }

  const results = [...pool].sort(compareAdvisors).slice(0, limit);
  // Attach fallback flag so UI can show "Top Rated" label instead of "Featured"
  results._isTopRatedFallback = isTopRatedFallback;
  return results;
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

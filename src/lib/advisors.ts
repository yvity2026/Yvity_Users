import "server-only";

import { fetchSupabasePublicAdvisors } from "@/lib/advisors/fetch-supabase-advisors";
import { loadLocalPublicAdvisors } from "@/lib/advisors/load-local-public-advisors";
import { getMockPublicAdvisors, type PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import {
  compareAdvisors,
  filterAdvisors,
} from "@/lib/advisors/publicAdvisorFilters";
import { getSessionUser } from "@/lib/server/session";

export type AdvisorSearchFilters = {
  city?: string | null;
  state?: string | null;
  service?: string | null;
  company?: string | null;
  name?: string | null;
};

/** Prefer richer local JSON metrics when the same advisor exists in `.data`. */
async function mergeLocalAdvisorCardMetrics(
  advisors: PublicAdvisorCard[],
): Promise<PublicAdvisorCard[]> {
  const local = await loadLocalPublicAdvisors();
  if (!local.length) return advisors;

  const localById = new Map(local.map((advisor) => [advisor.id, advisor]));

  return advisors.map((card) => {
    const localCard = localById.get(card.id);
    if (!localCard) return card;

    return {
      ...card,
      title: localCard.title || card.title,
      location: localCard.location || card.location,
      avatarUrl: localCard.avatarUrl ?? card.avatarUrl,
      profileUrl: localCard.profileUrl || card.profileUrl,
      profileSlug: localCard.profileSlug || card.profileSlug,
      score: localCard.score > 0 ? localCard.score : card.score,
      exp: localCard.exp || card.exp,
      clients: localCard.clients || card.clients,
      clientsLabel: localCard.clientsLabel || card.clientsLabel,
      recs: localCard.recs || card.recs,
      reviews: localCard.reviews || card.reviews,
      avgRating: localCard.avgRating || card.avgRating,
      serviceTypes: localCard.serviceTypes.length
        ? localCard.serviceTypes
        : card.serviceTypes,
      achievementTags: localCard.achievementTags.length
        ? localCard.achievementTags
        : card.achievementTags,
      showIdentityVerified:
        localCard.showIdentityVerified || card.showIdentityVerified,
      showVerifiedBadge: localCard.showVerifiedBadge || card.showVerifiedBadge,
    };
  });
}

/** Public advisors — Supabase when configured, otherwise demo mocks. */
export async function getPublicAdvisors(): Promise<PublicAdvisorCard[]> {
  const session = await getSessionUser();
  let advisors: PublicAdvisorCard[] = [];

  try {
    const fromSupabase = await fetchSupabasePublicAdvisors(session?.id ?? null);
    if (fromSupabase !== null) {
      advisors = await mergeLocalAdvisorCardMetrics(fromSupabase);
      if (advisors.length > 0) return advisors;
    }
  } catch (error) {
    console.warn("[advisors] Supabase fetch failed, using local data:", error);
  }

  const local = await loadLocalPublicAdvisors(session?.id ?? null);
  if (local.length > 0) return local;

  const mocks = getMockPublicAdvisors();
  if (session?.id) {
    return mocks.filter((advisor) => advisor.id !== session.id);
  }

  return mocks;
}

/** Filter and rank public advisors for landing + dashboard search.
 *  All active advisors (Free, Silver, Gold) appear in search results. */
export async function searchPublicAdvisors(filters: AdvisorSearchFilters = {}) {
  const advisors = await getPublicAdvisors();

  return filterAdvisors(advisors, {
    city: filters.city ?? "",
    state: filters.state ?? "",
    service: filters.service ?? "",
    company: filters.company ?? "",
    name: filters.name ?? "",
  }).sort(compareAdvisors);
}

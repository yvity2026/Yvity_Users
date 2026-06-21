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

/** Public advisors — Supabase when configured, otherwise demo mocks.
 *  excludeSelf: exclude the logged-in advisor from results (default true).
 *  Set false for the landing page hero/find-advisors which must show all
 *  featured advisors regardless of who is viewing. */
export async function getPublicAdvisors(
  options: { excludeSelf?: boolean } = {},
): Promise<PublicAdvisorCard[]> {
  const { excludeSelf = true } = options;
  const session = await getSessionUser();
  const excludeId = excludeSelf ? (session?.id ?? null) : null;
  let advisors: PublicAdvisorCard[] = [];

  try {
    const fromSupabase = await fetchSupabasePublicAdvisors(excludeId);
    if (fromSupabase !== null) {
      advisors = await mergeLocalAdvisorCardMetrics(fromSupabase);
      console.log(`[advisors] Supabase returned ${advisors.length} advisor(s)`);
      if (advisors.length > 0) return advisors;
    } else {
      console.warn("[advisors] Supabase client not configured — no admin client available");
    }
  } catch (error) {
    console.error("[advisors] Supabase fetch failed:", error instanceof Error ? error.message : error);
  }

  const local = await loadLocalPublicAdvisors(excludeId);
  if (local.length > 0) return local;

  const mocks = getMockPublicAdvisors();
  if (excludeSelf && session?.id) {
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

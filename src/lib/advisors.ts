import "server-only";

import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";
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

/** Public advisors — Supabase when configured, otherwise demo mocks. */
export async function getPublicAdvisors(): Promise<PublicAdvisorCard[]> {
  const session = await getSessionUser();

  try {
    const fromSupabase = await fetchSupabasePublicAdvisors(session?.id ?? null);
    if (fromSupabase?.length) return fromSupabase;
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

/** Filter and rank public advisors for landing + dashboard search. */
export async function searchPublicAdvisors(filters: AdvisorSearchFilters = {}) {
  const advisors = await getPublicAdvisors();

  return filterAdvisors(advisors, {
    city: filters.city ?? "",
    state: filters.state ?? "",
    service: filters.service ?? "",
    company: filters.company ?? "",
    name: filters.name ?? "",
  })
    .filter((advisor: PublicAdvisorCard) =>
      resolvePlanLimits(advisor.subscription_plan, advisor.account_status).searchAppearance,
    )
    .sort(compareAdvisors);
}

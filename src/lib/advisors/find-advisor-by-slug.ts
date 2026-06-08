import "server-only";

import { slugMatches } from "@/lib/advisor/public-profile-slug";
import { getPublicAdvisors } from "@/lib/advisors";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";

export async function findAdvisorByPublicSlug(
  pathSlug: string,
): Promise<PublicAdvisorCard | null> {
  const slug = String(pathSlug || "").trim();
  if (!slug) return null;

  const advisors = await getPublicAdvisors();
  return (
    advisors.find((advisor) => {
      const fromUrl = advisor.profileUrl?.replace(/^\//, "").split("?")[0] ?? "";
      return slugMatches(fromUrl, slug) || slugMatches(advisor.name, slug);
    }) ?? null
  );
}

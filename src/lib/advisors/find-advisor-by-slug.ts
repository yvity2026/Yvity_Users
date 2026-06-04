import "server-only";

import {
  formatProfileSlugForPublicUrl,
  getAdvisorProfileSlug,
  normalizeAdvisorProfileSlug,
} from "@/lib/advisor/profileSlug";
import { getPublicAdvisors } from "@/lib/advisors";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";

function slugFromProfileUrl(profileUrl: string) {
  const match = profileUrl.match(/\/Advisor\/([^/?#]+)/i);
  return match?.[1] ?? "";
}

function matchesPublicSlug(advisor: PublicAdvisorCard, pathSlug: string) {
  const normalizedPath = normalizeAdvisorProfileSlug(pathSlug);
  const displayPath = formatProfileSlugForPublicUrl(pathSlug);
  const fromUrl = slugFromProfileUrl(advisor.profileUrl || "");
  const fromName = getAdvisorProfileSlug(advisor.name);

  const candidates = [
    normalizeAdvisorProfileSlug(fromUrl),
    normalizeAdvisorProfileSlug(fromName),
    formatProfileSlugForPublicUrl(fromUrl),
    formatProfileSlugForPublicUrl(fromName),
  ].filter(Boolean);

  return (
    candidates.includes(normalizedPath) ||
    candidates.includes(displayPath) ||
    fromUrl === pathSlug ||
    formatProfileSlugForPublicUrl(fromName) === pathSlug
  );
}

export async function findAdvisorByPublicSlug(
  pathSlug: string,
): Promise<PublicAdvisorCard | null> {
  const slug = String(pathSlug || "").trim();
  if (!slug) return null;

  const advisors = await getPublicAdvisors();
  return advisors.find((advisor) => matchesPublicSlug(advisor, slug)) ?? null;
}

/**
 * Normalizes API / DB advisor records for AdvisorCardGold (single public card).
 */
import { extractAchievementTags } from "@/lib/sections/achievement-tiers";
import { resolvePublicAdvisorProfileUrl } from "@/lib/public-profile-url";

export function toAdvisorCardGoldProps(advisor = {}) {
  const score = Number(advisor.score ?? 0);
  const achievementTags = Array.isArray(advisor.achievementTags)
    ? advisor.achievementTags.filter(Boolean)
    : Array.isArray(advisor.achievements)
      ? extractAchievementTags(advisor.achievements)
      : Array.isArray(advisor.tags)
        ? advisor.tags.filter(
            (tag) =>
              typeof tag === "string" &&
              (/^mdrt\b/i.test(tag) || /^(cot|tot|founding advisor|founding member)$/i.test(tag)),
          )
        : [];

  return {
    id: advisor.id ?? null,
    name: advisor.name ?? "Advisor",
    title: advisor.title ?? advisor.designation ?? "Insurance Advisor",
    location: advisor.location ?? "Location not available",
    score: Math.min(100, Math.max(0, Number.isFinite(score) ? score : 0)),
    exp: advisor.exp ?? "0",
    avgRating: advisor.avgRating ?? "0",
    clients: String(advisor.clients ?? "0"),
    clientsLabel: advisor.clientsLabel ?? "Clients",
    recs: String(advisor.recs ?? "0"),
    profileUrl: resolvePublicAdvisorProfileUrl(advisor),
    avatarUrl: advisor.avatarUrl ?? null,
    showIdentityVerified: Boolean(
      advisor.showIdentityVerified ?? advisor.showVerifiedBadge,
    ),
    serviceTypes: Array.isArray(advisor.serviceTypes)
      ? advisor.serviceTypes.filter(Boolean)
      : [],
    achievementTags,
  };
}

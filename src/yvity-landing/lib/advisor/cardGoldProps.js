/**
 * Normalizes API / DB advisor records for AdvisorCardGold (single public card).
 */
export function toAdvisorCardGoldProps(advisor = {}) {
  const score = Number(advisor.score ?? 0);

  return {
    id: advisor.id ?? null,
    name: advisor.name ?? "Advisor",
    title: advisor.title ?? advisor.designation ?? "Insurance Advisor",
    location: advisor.location ?? "Location not available",
    score: Math.min(100, Math.max(0, Number.isFinite(score) ? score : 0)),
    exp: advisor.exp ?? "0",
    avgRating: advisor.avgRating ?? "0",
    clients: String(advisor.clients ?? "0"),
    recs: String(advisor.recs ?? "0"),
    profileUrl: advisor.profileUrl ?? "/profile",
    avatarUrl: advisor.avatarUrl ?? null,
    showIdentityVerified: Boolean(
      advisor.showIdentityVerified ?? advisor.showVerifiedBadge,
    ),
    serviceTypes: Array.isArray(advisor.serviceTypes)
      ? advisor.serviceTypes.filter(Boolean)
      : [],
  };
}

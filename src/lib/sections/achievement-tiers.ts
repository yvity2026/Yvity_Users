import type { AchievementItem } from "./types";

export type AchievementTier = "mdrt" | "cot" | "tot";

function achievementText(item: Pick<AchievementItem, "title" | "subtitle">): string {
  return `${item.title} ${item.subtitle ?? ""}`.trim();
}

export function achievementHasTier(
  item: Pick<AchievementItem, "title" | "subtitle">,
  tier: AchievementTier,
): boolean {
  const text = achievementText(item);
  if (tier === "mdrt") return /\bmdrt\b/i.test(text);
  if (tier === "cot") return /\bcot\b/i.test(text);
  if (tier === "tot") return /\btot\b/i.test(text);
  return false;
}

export function hasAchievementTier(
  achievements: Pick<AchievementItem, "title" | "subtitle">[],
  tier: AchievementTier,
): boolean {
  return achievements.some((item) => achievementHasTier(item, tier));
}

export function hasMdrtAchievement(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[],
): boolean {
  return hasAchievementTier(achievements, "mdrt");
}

export function getMdrtLatestYear(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[],
): number | null {
  const mdrtItems = achievements.filter((item) => achievementHasTier(item, "mdrt"));
  if (!mdrtItems.length) return null;

  const years = mdrtItems.flatMap((item) =>
    (item.years ?? [])
      .map((year) => Number(year))
      .filter((year) => Number.isFinite(year) && year > 0),
  );

  return years.length ? Math.max(...years) : null;
}

/** Banner tile on the achievements page — e.g. "MDRT 2024" or "—". */
export function formatMdrtStatusLabel(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[],
): string {
  if (!hasMdrtAchievement(achievements)) return "—";
  const year = getMdrtLatestYear(achievements);
  return year ? `MDRT ${year}` : "MDRT";
}

/** Profile hero badge — "MDRT Member" when an MDRT achievement exists. */
export function formatMdrtMemberLabel(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[],
): string {
  return hasMdrtAchievement(achievements) ? "MDRT Member" : "Trusted Advisor";
}

const TIER_TAG_LABELS: Record<AchievementTier, string> = {
  mdrt: "MDRT",
  cot: "COT",
  tot: "TOT",
};

/**
 * Public-facing achievement badges derived from saved achievements
 * (advisor cards, directory listings, profile highlights).
 */
export function extractAchievementTags(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[],
): string[] {
  const tags: string[] = [];

  for (const tier of ["mdrt", "cot", "tot"] as AchievementTier[]) {
    if (!hasAchievementTier(achievements, tier)) continue;
    if (tier === "mdrt") {
      const year = getMdrtLatestYear(achievements);
      tags.push(year ? `MDRT ${year}` : "MDRT");
    } else {
      tags.push(TIER_TAG_LABELS[tier]);
    }
  }

  for (const item of achievements) {
    const text = achievementText(item);
    if (/founding member/i.test(text)) {
      if (!tags.includes("Founding Member")) tags.push("Founding Member");
    } else if (/founding advisor/i.test(text)) {
      if (!tags.includes("Founding Advisor")) tags.push("Founding Advisor");
    }
  }

  return tags.slice(0, 3);
}

/** Map lightweight DB / API rows into achievement tags. */
export function extractAchievementTagsFromRecords(
  records: Array<{ title?: string | null; organisation?: string | null; subtitle?: string | null }>,
): string[] {
  return extractAchievementTags(
    records.map((record) => ({
      title: String(record.title ?? ""),
      subtitle: String(record.subtitle ?? record.organisation ?? ""),
      years: [],
    })),
  );
}

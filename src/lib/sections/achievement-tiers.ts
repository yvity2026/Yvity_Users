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

/** Total number of times MDRT was achieved (sum of years across all MDRT items). */
export function getMdrtCount(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[],
): number {
  return achievements
    .filter((item) => achievementHasTier(item, "mdrt"))
    .reduce((sum, item) => sum + Math.max(1, (item.years ?? []).length), 0);
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

/** Banner tile on the achievements page — e.g. "MDRT 2024", "MDRT x 2", or "—". */
export function formatMdrtStatusLabel(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[],
): string {
  if (!hasMdrtAchievement(achievements)) return "—";
  const count = getMdrtCount(achievements);
  if (count > 1) return `MDRT x ${count}`;
  const year = getMdrtLatestYear(achievements);
  return year ? `MDRT ${year}` : "MDRT";
}

/** Profile hero badge — "MDRT Member", "MDRT x 2", or "Trusted Advisor". */
export function formatMdrtMemberLabel(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[],
): string {
  if (!hasMdrtAchievement(achievements)) return "Trusted Advisor";
  const count = getMdrtCount(achievements);
  return count > 1 ? `MDRT x ${count}` : "MDRT Member";
}

const TIER_TAG_LABELS: Record<AchievementTier, string> = {
  mdrt: "MDRT",
  cot: "COT",
  tot: "TOT",
};

/**
 * Public-facing achievement badges derived from saved achievements
 * (advisor cards, directory listings, profile highlights).
 * Accepts optional `iconStyle` per item — if any item has iconStyle "mdrt"
 * (the MDRT/COT/TOT icon family) but the title text doesn't match a specific
 * tier, it defaults to MDRT (the most common tier in that family).
 */
export function extractAchievementTags(
  achievements: (Pick<AchievementItem, "title" | "subtitle" | "years"> & { iconStyle?: string })[],
): string[] {
  const tags: string[] = [];

  const hasMdrtIconStyle = achievements.some((a) => a.iconStyle === "mdrt");

  for (const tier of ["mdrt", "cot", "tot"] as AchievementTier[]) {
    const hasViaTierText = hasAchievementTier(achievements, tier);

    if (!hasViaTierText) {
      // Fall back to iconStyle "mdrt" for MDRT detection when title is ambiguous
      if (
        tier === "mdrt" &&
        hasMdrtIconStyle &&
        !hasAchievementTier(achievements, "cot") &&
        !hasAchievementTier(achievements, "tot")
      ) {
        tags.push("MDRT");
      }
      continue;
    }

    if (tier === "mdrt") {
      const count = getMdrtCount(achievements);
      if (count > 1) {
        tags.push(`MDRT x ${count}`);
      } else {
        const year = getMdrtLatestYear(achievements);
        tags.push(year ? `MDRT ${year}` : "MDRT");
      }
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

const TIER_SCORE_VALUES: Record<AchievementTier, number> = {
  mdrt: 2,
  cot: 6,
  tot: 10,
};

/**
 * Computes YVITY Score achievement pts (max 10).
 * Each achievement always adds its full tier value: MDRT=2, COT=6, TOT=10.
 * Multiple years of the same tier each count separately.
 * Total is capped at 10.
 *
 * Examples: MDRT=2, MDRT+COT=8, 5×MDRT=10, TOT=10, COT+COT=12→10.
 */
export function computeAchievementPts(
  achievements: Pick<AchievementItem, "title" | "subtitle" | "years">[],
): number {
  let pts = 0;

  for (const item of achievements) {
    let value = 0;
    if (achievementHasTier(item, "tot")) value = TIER_SCORE_VALUES.tot;
    else if (achievementHasTier(item, "cot")) value = TIER_SCORE_VALUES.cot;
    else if (achievementHasTier(item, "mdrt")) value = TIER_SCORE_VALUES.mdrt;
    else continue;

    const count = Math.max(1, (item.years ?? []).length);
    pts += value * count;
  }

  return Math.min(10, pts);
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

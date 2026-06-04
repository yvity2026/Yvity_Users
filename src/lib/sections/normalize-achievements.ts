import { normalizeOptionalVerification } from "@/lib/verification/defaults";
import { defaultAchievements } from "./defaults";
import type { AchievementItem } from "./types";

function isAchievementItem(value: unknown): value is AchievementItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    "achievedCount" in value &&
    Array.isArray((value as AchievementItem).years)
  );
}

/**
 * Normalises persisted achievements. Achievements that pre-date the optional
 * verification feature simply omit the `verification` field; entries that
 * carry one are validated via {@link normalizeOptionalVerification}.
 */
export function normalizeAchievements(data: unknown): AchievementItem[] {
  if (!Array.isArray(data) || data.length === 0) return defaultAchievements;
  if (!isAchievementItem(data[0])) return defaultAchievements;
  return (data as AchievementItem[]).map((item) => {
    const verification = normalizeOptionalVerification(
      (item as { verification?: unknown }).verification,
    );
    if (!verification) {
      const { verification: _drop, ...rest } = item as AchievementItem & {
        verification?: unknown;
      };
      void _drop;
      return rest;
    }
    return { ...item, verification };
  });
}

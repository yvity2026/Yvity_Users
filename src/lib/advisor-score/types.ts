/**
 * YVITY Score — types describing the advisor's detailed score breakdown.
 *
 * The score is composed of three top-level categories (Identity, Visibility,
 * Trust). Each category has a number of "rules"; each rule has a name, an
 * earned/max value, an optional explanation panel and (for some rules) an
 * inner breakdown of sub-items (e.g. testimonial points by media type).
 *
 * Everything in this module is dashboard-only — the public profile only
 * exposes the final composite score via the existing hook.
 */

export type ScoreCategoryId = "identity" | "visibility" | "trust";

/** Status of a rule used to colour its progress bar. */
export type ScoreRuleStatus = "complete" | "in-progress" | "empty";

/** Visual tone used by sub-items / explanation banners. */
export type ScoreTone = "info" | "warning" | "success" | "negative";

export type ScoreSubItem = {
  id: string;
  /** Short label, e.g. "Selfie Verification". */
  label: string;
  /** Score earned for this sub-rule. */
  earned: number;
  /** Maximum points the sub-rule can contribute. */
  max: number;
  /** Whether the sub-rule already has all its points. */
  complete: boolean;
};

export type ScoreExplanation = {
  /** Bullet list shown inside the explanation banner. */
  bullets: string[];
  /** Optional caption below the bullets (italic / muted). */
  caption?: string;
  /** Right-column metrics, e.g. {label:"Max", value:"5 pts"}. */
  metrics?: { label: string; value: string; tone?: ScoreTone }[];
  /** Banner tone — controls colours. */
  tone?: ScoreTone;
};

export type ScoreAchievementTier = {
  id: string;
  label: string;
  fullName: string;
  /** Points per year (MDRT) or flat points (COT/TOT). */
  pointsLabel: string;
  status: "active" | "not-uploaded";
  /** Emoji or short icon hint for the small badge. */
  iconHint?: string;
  accent: "emerald" | "amber" | "violet";
};

export type ScoreAchievementBlock = {
  /** "Latest year achievement considered" caption. */
  caption: string;
  /** e.g. "MDRT 2024" — the active achievement label. */
  currentLabel?: string;
  tiers: ScoreAchievementTier[];
};

export type ScoreRule = {
  id: string;
  label: string;
  /** Lucide icon name or emoji — keeps the data layer free of React deps. */
  iconHint?: string;
  earned: number;
  max: number;
  status: ScoreRuleStatus;
  /** Optional sub-items (e.g. Identity's selfie / mobile / IRDAI rows). */
  subItems?: ScoreSubItem[];
  /** Optional bullet-style explanation panel. */
  explanation?: ScoreExplanation;
  /** Optional achievement-tier block (used by Trust → Achievements). */
  achievements?: ScoreAchievementBlock;
};

export type ScoreCategory = {
  id: ScoreCategoryId;
  label: string;
  earned: number;
  max: number;
  rules: ScoreRule[];
};

export type ScoreNegativeRule = {
  label: string;
  description: string;
  decay: string;
};

export type ScoreImprovement = {
  id: string;
  label: string;
  /** Points unlocked by completing this action. */
  points: number;
  /** CTA label, e.g. "Add now". */
  cta: string;
  /** Where the user is sent — we'll wire this in the dashboard. */
  target:
    | {
        kind: "profile-section";
        section: "profile" | "services" | "achievements" | "testimonials" | "gallery";
      }
    | { kind: "share" }
    | { kind: "external"; href: string };
};

export type YvityScoreModel = {
  total: number;
  /** Score before decay penalties. */
  rawTotal?: number;
  /** Points removed by inactivity decay (when active). */
  decayPenalty?: number;
  decayActive?: boolean;
  decayGraceDaysRemaining?: number | null;
  max: number;
  /** Tagline displayed under the headline number. */
  tagline: string;
  categories: ScoreCategory[];
  /** Negative-rule banner shown inside Visibility. */
  negativeRules: ScoreNegativeRule[];
  /** Sorted improvements (highest points first). */
  improvements: ScoreImprovement[];
  /** Score the advisor reaches if they complete every improvement. */
  potentialTotal: number;
};

/**
 * Canonical list of "Why do you recommend this advisor?" tags shown as
 * selectable chips in the Recommend Advisor flow. The list is exported as
 * a `const` tuple so the API can validate submitted tags against the
 * exact same allowlist the UI offers.
 *
 * Add new tags at the END of the array — existing stored recommendations
 * reference these by string value.
 */
export const RECOMMENDATION_TAGS = [
  "Professional",
  "Knowledgeable",
  "Helpful",
  "Responsive",
  "Trustworthy",
  "Claim Support",
  "Friendly",
  "Financial Guidance",
  "Quick Service",
  "Reliable",
] as const;

export type RecommendationTag = (typeof RECOMMENDATION_TAGS)[number];

/** Type-guard against the canonical tag allowlist. */
export function isRecommendationTag(value: unknown): value is RecommendationTag {
  return typeof value === "string" && (RECOMMENDATION_TAGS as readonly string[]).includes(value);
}

/**
 * Persisted shape of a single advisor recommendation.
 *
 * Only `verified === true` recommendations should ever be surfaced
 * publicly. Pending / unverified rows can be cleaned up by an admin.
 */
export type AdvisorRecommendation = {
  id: string;
  fullName: string;
  /** Raw mobile string as the visitor typed it (kept for display). */
  mobile: string;
  /**
   * Last-10-digit normalisation of `mobile`. Used as the duplicate key
   * so `+91 98765 43210`, `9876543210` and `091-98765-43210` all map to
   * the same submitter.
   */
  mobileNormalised: string;
  /** Selected recommendation tags (subset of `RECOMMENDATION_TAGS`). */
  tags: RecommendationTag[];
  /** Optional free-text comment ("Why would you recommend…"). */
  comment?: string;
  /**
   * True when the visitor completed mobile-OTP verification before
   * submission. Only verified rows should be displayed publicly.
   */
  verified: boolean;
  createdAt: string;
  /**
   * @deprecated Earlier submissions stored a `message` field instead of
   * `comment`. Retained on the type for backwards-compatible reads from
   * the persisted JSON file; new writes use `comment`.
   */
  message?: string;
};

/**
 * Reduces any mobile string to a stable comparable form — last 10
 * digits. This is the canonical "same submitter" key for duplicate
 * detection.
 */
export function normaliseMobile(mobile: string): string {
  return mobile.replace(/\D/g, "").slice(-10);
}

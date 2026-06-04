/**
 * Canonical badge copy used across the public profile and dashboard.
 *
 * IMPORTANT: this is the brand-approved phrasing — "Verified by YVITY".
 * Never use "YVITY Verified", "YVITY Verified Advisor", etc. as the
 * visible badge label. (Descriptive prose like "...earn a YVITY Verified
 * Badge" inside a sentence is a different concern and can stay inline.)
 *
 * Import from here instead of repeating the string literal so that:
 *  - We have one place to change the phrasing if brand ever updates it.
 *  - Greps for `VERIFIED_BY_YVITY_LABEL` find every public surface.
 *  - Translations / i18n later can replace this single export.
 */
export const VERIFIED_BY_YVITY_LABEL = "Verified by YVITY";

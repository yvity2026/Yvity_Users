/**
 * Helpers for deriving the human-readable "X+ Years Experience" line on a
 * service card from the advisor-entered `serviceStartDate`.
 *
 * Computing this at render-time (instead of writing a static string back to
 * the service record) keeps the displayed value fresh — a service started in
 * January 2020 will read "5+ Years Experience" today and "6+ Years
 * Experience" next January without anyone touching the data.
 */

/**
 * Parse a strict `YYYY-MM-DD` ISO date string into a `Date` object.
 * Returns `null` if the string is missing, malformed, or denotes a future or
 * impossible date (which would otherwise display as "-1+ Years" etc.).
 */
function parseStartDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  // `YYYY-MM-DD` strictly — month/day zero-padded.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  // Construct in local time so a user picking "1 Jan 2020" doesn't drift
  // across timezones for the comparison below.
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  // Reject future dates — an advisor cannot have started a service later
  // than today.
  if (d.getTime() > Date.now()) return null;
  return d;
}

/**
 * Floor difference in full years between `start` and "now". Mirrors how age
 * is usually quoted ("turned 5 last March" → 5, not 4.83).
 */
export function computeYearsSinceStartDate(value: string | undefined | null): number | null {
  const start = parseStartDate(value);
  if (!start) return null;
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const monthDiff = now.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) {
    years -= 1;
  }
  return Math.max(years, 0);
}

/**
 * Build the experience label shown on the public service card.
 *
 *   • `>= 1 year`  → e.g. `"7+ Years Experience"`
 *   • `< 1 year`   → `"Less than 1 year experience"`
 *   • invalid/null → `null` (caller should fall back to legacy `experience`)
 */
export function formatExperienceFromStart(value: string | undefined | null): string | null {
  const years = computeYearsSinceStartDate(value);
  if (years === null) return null;
  if (years === 0) return "Less than 1 year experience";
  return `${years}+ Years Experience`;
}

/**
 * Resolve the experience line to render on a card.
 *
 * Prefers a value derived from `serviceStartDate` (always up-to-date) and
 * falls back to the legacy free-text `experience` string for older records
 * that pre-date the date picker.
 */
export function resolveServiceExperience(item: {
  experience?: string;
  serviceStartDate?: string;
}): string {
  return formatExperienceFromStart(item.serviceStartDate) ?? item.experience ?? "";
}

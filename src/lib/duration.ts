// Parse "YYYY-MM" -> Date (1st of month)
function parseYM(ym: string): Date | null {
  if (!ym) return null;
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return null;
  return new Date(y, m - 1, 1);
}

export function formatYM(ym: string): string {
  const d = parseYM(ym);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatRange(start: string, end: string): string {
  const s = formatYM(start);
  const e = end ? formatYM(end) : "Present";
  if (!s) return "";
  return `${s} – ${e}`;
}

/** Inclusive month difference, returns "X Years Y Months", "1+ Year", etc. */
export function durationLabel(start: string, end: string): string {
  const s = parseYM(start);
  const e = end ? parseYM(end) : new Date();
  if (!s || !e) return "";
  let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 0) return "";
  months += 1; // inclusive
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${months} Month${months === 1 ? "" : "s"}`;
  if (rem === 0) return `${years} Year${years === 1 ? "" : "s"}`;
  if (!end && years >= 1) return `${years}+ Year${years === 1 ? "" : "s"}`;
  return `${years}y ${rem}m`;
}

export function yearRangeLabel(start: string, end: string): string {
  const s = parseYM(start);
  if (!s) return "";
  const startY = s.getFullYear();
  if (!end) return `${startY} – Present`;
  const e = parseYM(end);
  if (!e) return `${startY}`;
  return `${startY} – ${e.getFullYear()}`;
}

/**
 * Advisor handle — the unique identifier that becomes their subdomain.
 * e.g. "krishnamohannoti" → krishnamohannoti.yvity.com
 *
 * Rules (mirrors subdomain DNS constraints):
 *  - 3–30 characters
 *  - Lowercase letters, numbers, hyphens only
 *  - No leading/trailing hyphens
 *  - No consecutive hyphens
 *  - Not a reserved word
 */

import { RESERVED_PUBLIC_PROFILE_SLUGS } from "@/lib/advisor/public-profile-slug";

/** Additional words blocked at the handle level (beyond slug reserved list). */
const HANDLE_BLOCKLIST = new Set([
  "www", "mail", "smtp", "ftp", "cdn", "static", "assets",
  "support", "help", "contact", "careers", "jobs", "blog",
  "news", "media", "press", "legal", "privacy", "terms",
  "yvity", "yvityadmin", "admin", "superadmin", "root",
  "null", "undefined", "test", "demo", "dev", "staging",
]);

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 30;

export type HandleValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateHandle(raw: string): HandleValidationResult {
  const h = raw.trim().toLowerCase();

  if (h.length < HANDLE_MIN)
    return { ok: false, reason: `Handle must be at least ${HANDLE_MIN} characters.` };

  if (h.length > HANDLE_MAX)
    return { ok: false, reason: `Handle must be ${HANDLE_MAX} characters or fewer.` };

  if (!/^[a-z0-9-]+$/.test(h))
    return { ok: false, reason: "Only letters, numbers and hyphens are allowed." };

  if (h.startsWith("-") || h.endsWith("-"))
    return { ok: false, reason: "Handle cannot start or end with a hyphen." };

  if (/--/.test(h))
    return { ok: false, reason: "Handle cannot contain consecutive hyphens." };

  if (RESERVED_PUBLIC_PROFILE_SLUGS.has(h) || HANDLE_BLOCKLIST.has(h))
    return { ok: false, reason: "This handle is reserved and cannot be used." };

  return { ok: true };
}

/** Normalise raw input to a valid handle candidate (best-effort, may still fail validation). */
export function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, HANDLE_MAX);
}

/** Derive a base handle from a full name (no separators — reads well as a subdomain). */
export function handleFromName(fullName: string): string {
  return normalizeHandle(
    fullName.trim().toLowerCase().replace(/\s+/g, ""),
  );
}

/** Suggest alternatives when a handle is taken. */
export function suggestHandles(base: string, taken: Set<string>): string[] {
  const suggestions: string[] = [];

  for (let n = 2; n <= 9 && suggestions.length < 3; n++) {
    const candidate = `${base}${n}`;
    if (!taken.has(candidate) && validateHandle(candidate).ok) {
      suggestions.push(candidate);
    }
  }

  // Also suggest base + "advisor" / "ifa" suffix
  for (const suffix of ["advisor", "ifa", "ins"] ) {
    if (suggestions.length >= 4) break;
    const candidate = `${base}-${suffix}`.slice(0, HANDLE_MAX);
    if (!taken.has(candidate) && validateHandle(candidate).ok) {
      suggestions.push(candidate);
    }
  }

  return suggestions;
}

/** Build the full subdomain URL for a handle. */
export function buildHandleUrl(handle: string, baseUrl: string): string {
  // In production: krishnamohannoti.yvity.com
  // In dev: localhost:3002/{handle} (subdomains don't work on localhost)
  try {
    const url = new URL(baseUrl);
    const isProd = !url.hostname.includes("localhost") && !url.hostname.includes("127.0.0.1");
    if (isProd) {
      return `${url.protocol}//${handle}.${url.hostname}`;
    }
  } catch {
    // fall through
  }
  return `${baseUrl}/${handle}`;
}

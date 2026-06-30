import { normalizeAdvisorProfileSlug, slugifyAdvisorName } from "@/lib/advisor/profileSlug";
import { buildHandleUrl } from "@/lib/advisor/handle";

/** App routes that must not be treated as advisor profile slugs. */
export const RESERVED_PUBLIC_PROFILE_SLUGS = new Set([
  "profile",
  "login",
  "register",
  "dashboard",
  "admin",
  "advisor",
  "api",
  "services",
  "gallery",
  "testimonials",
  "achievements",
  "my-career",
  "edit",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function isReservedPublicProfileSlug(slug: string): boolean {
  const normalized = normalizeAdvisorProfileSlug(slug);
  return !normalized || RESERVED_PUBLIC_PROFILE_SLUGS.has(normalized);
}

/** Top-level `/{advisor-slug}` public profile home (not `/services`, etc.). */
export function isPublicAdvisorSlugPath(pathname: string): boolean {
  const clean = pathname.split("?")[0].replace(/\/$/, "") || "/";
  if (clean === "/") return false;
  const segments = clean.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  const segment = segments[0];
  if (segment.includes(".")) return false;
  return !isReservedPublicProfileSlug(segment);
}

/** Routes that render the visitor-facing advisor profile (not dashboard). */
export const PUBLIC_PROFILE_SURFACE_PATHS = new Set([
  "/profile",
  "/services",
  "/my-career",
  "/achievements",
  "/testimonials",
  "/gallery",
]);

const PROFILE_SECTION_SLUGS = new Set([
  "my-career",
  "services",
  "achievements",
  "testimonials",
  "gallery",
]);

export function isPublicProfileSurfacePath(pathname: string): boolean {
  const clean = pathname.split("?")[0].replace(/\/$/, "") || "/";
  if (isPublicAdvisorSlugPath(clean)) return true;
  if (PUBLIC_PROFILE_SURFACE_PATHS.has(clean)) return true;
  // /{slug}/{section} — e.g. /krishna-mohan-noti/my-career
  const parts = clean.split("/").filter(Boolean);
  if (parts.length >= 2 && PROFILE_SECTION_SLUGS.has(parts[1]) && !isReservedPublicProfileSlug(parts[0])) {
    return true;
  }
  return false;
}

/** Canonical URL segment: lowercase kebab-case (`krishna-mohan-noti`). */
export function toPublicProfileSlugSegment(slug: string): string {
  return normalizeAdvisorProfileSlug(slug);
}

export function buildPublicProfilePath(slug: string): string {
  const segment = toPublicProfileSlugSegment(slug);
  return segment ? `/${segment}` : "/profile";
}

/**
 * Full URL for an advisor's public profile.
 * Production: https://handle.yvity.com
 * Dev: baseUrl/handle (subdomains don't work on localhost)
 */
export function buildPublicProfileUrl(slug: string, baseUrl: string): string {
  const segment = toPublicProfileSlugSegment(slug);
  if (!segment) return baseUrl;
  return buildHandleUrl(segment, baseUrl);
}

/**
 * Base slug from advisor name; appends `-2`, `-3`, … or a short id suffix when taken.
 */
export function proposeProfileSlug(
  fullName: string,
  userId: string,
  taken: Set<string>,
): string {
  const base = slugifyAdvisorName(fullName) || "advisor";
  if (!taken.has(base)) return base;

  for (let n = 2; n < 100; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }

  return `${base}-${userId.slice(0, 6)}`;
}

export function slugMatches(stored: string | null | undefined, pathSlug: string): boolean {
  const a = toPublicProfileSlugSegment(stored ?? "");
  const b = toPublicProfileSlugSegment(pathSlug);
  if (!a || !b) return false;
  if (a === b) return true;
  // Legacy slugs stored as `name-167ec15f` still match `name` prefix.
  return a.startsWith(`${b}-`) || b.startsWith(`${a}-`);
}

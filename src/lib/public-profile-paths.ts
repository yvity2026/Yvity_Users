import { isReservedPublicProfileSlug } from "@/lib/advisor/public-profile-slug";

/** Routes that belong to the public advisor profile (navbar + home). */
const PUBLIC_PROFILE_EXACT = new Set([
  "/profile",
  "/my-career",
  "/services",
  "/achievements",
  "/testimonials",
  "/gallery",
]);

const PUBLIC_PROFILE_PREFIXES = ["/testimonials/"] as const;

const EXCLUDED_PREFIXES = ["/advisor", "/login", "/edit", "/dashboard", "/admin", "/api"] as const;

/** Sections nested under `/{slug}/` */
const PROFILE_SECTIONS = new Set([
  "my-career",
  "services",
  "achievements",
  "testimonials",
  "gallery",
]);

export function isAdvisorSlugPublicProfilePath(pathname: string): boolean {
  const segment = pathname.replace(/^\/|\/$/g, "").split("/")[0] ?? "";
  if (!segment || pathname.includes("/", 1)) return false;
  return !isReservedPublicProfileSlug(segment);
}

export function isPublicProfilePath(pathname: string): boolean {
  if (EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return false;
  }
  if (PUBLIC_PROFILE_EXACT.has(pathname)) return true;
  if (PUBLIC_PROFILE_PREFIXES.some((p) => pathname.startsWith(p))) return true;

  // /{slug}/{section} — e.g. /krishna-mohan-noti/my-career
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 2 && PROFILE_SECTIONS.has(parts[1])) {
    return !isReservedPublicProfileSlug(parts[0]);
  }
  // Also match /{slug}/testimonials/{id} deep links
  if (parts.length >= 2 && parts[1] === "testimonials" && !isReservedPublicProfileSlug(parts[0])) {
    return true;
  }

  return isAdvisorSlugPublicProfilePath(pathname);
}

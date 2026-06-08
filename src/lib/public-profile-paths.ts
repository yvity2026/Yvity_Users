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
  return isAdvisorSlugPublicProfilePath(pathname);
}

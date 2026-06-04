/** Marketing landing routes (separate from public advisor profile). */

export const LANDING_PATH = "/";

const AUTH_OVERLAY_PATHS = new Set(["/", "/login", "/register"]);

export function isLandingPath(pathname: string): boolean {
  return pathname === LANDING_PATH;
}

/** Hide global SiteChrome on landing, auth overlay, and dashboard routes. */
export function isAuthOverlayPath(pathname: string): boolean {
  return (
    AUTH_OVERLAY_PATHS.has(pathname) ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  );
}

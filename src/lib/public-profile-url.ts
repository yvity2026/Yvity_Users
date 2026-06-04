/**
 * URL helpers for the advisor's public profile — single source of truth.
 *
 * Every "Share Profile" / "View Public Profile" / "Preview profile" entry
 * point across the app routes through these helpers so the link:
 *
 *   1. Always lands on the **public profile home** (`/profile`) — the
 *      canonical visitor page (marketing landing is `/`).
 *
 *   2. Always carries `?preview=public` so the embedded chrome shows
 *      the visitor view (Login CTA) instead of the advisor's post-login
 *      chrome (Dashboard + Logout) — even when the advisor is still
 *      authenticated via cookie in the same browser. Honoured by
 *      `useIsVisitorPreview()` inside `SiteChrome` and `Navbar`.
 */

/**
 * Canonical relative path of the public profile. We always open the
 * homepage because that's the page a visitor lands on before login.
 */
const PUBLIC_PROFILE_PATH = "/profile";

/**
 * Append `preview=public` to a path so the embedded site renders its
 * **visitor** chrome even when the viewer is authenticated.
 *
 * Preserves any existing query string and is idempotent (calling twice
 * yields the same URL).
 */
export function withVisitorPreview(path: string): string {
  if (!path) return `${PUBLIC_PROFILE_PATH}?preview=public`;

  const [base, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set("preview", "public");
  return `${base}?${params.toString()}`;
}

/**
 * Canonical relative path for "Share Profile" / "View Public Profile" /
 * "Preview profile" actions: the public homepage with the visitor flag.
 */
export function getPublicProfileSharePath(): string {
  return withVisitorPreview(PUBLIC_PROFILE_PATH);
}

/**
 * Absolute URL variant — useful for native Share API and clipboard copies.
 * Safe to call only on the client (inside event handlers / effects).
 * Falls back to the relative path during SSR.
 */
export function getPublicProfileShareUrl(): string {
  const path = getPublicProfileSharePath();
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

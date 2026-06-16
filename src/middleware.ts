import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Subdomain routing middleware.
 *
 * Production:  krishnamohannoti.yvity.com  →  internally rewrites to /krishnamohannoti
 * Development: subdomains don't work on localhost — passes through unchanged.
 *              Use /{handle} paths directly in dev.
 *
 * The rewrite is transparent: the browser URL stays krishnamohannoti.yvity.com
 * but Next.js serves the [slug]/page.tsx route.
 */

const ROOT_DOMAINS = ["yvity.com", "www.yvity.com"];

/** Subdomains that are real app surfaces, not advisor handles. */
const SYSTEM_SUBDOMAINS = new Set([
  "www", "admin", "api", "cdn", "static", "mail", "smtp",
  "staging", "dev", "preview", "app",
]);

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") ?? "";

  // Strip port for comparison
  const host = hostname.split(":")[0];

  // Only apply subdomain logic on the production root domain
  const rootDomain = ROOT_DOMAINS.find(
    (d) => host === d || host.endsWith(`.${d}`),
  );

  if (!rootDomain) {
    // localhost / other domains — pass through unchanged
    return NextResponse.next();
  }

  // Extract the subdomain prefix
  const subdomain = host.slice(0, host.length - rootDomain.length - 1); // remove ".yvity.com"

  // Root domain (no subdomain) or system subdomain — pass through
  if (!subdomain || SYSTEM_SUBDOMAINS.has(subdomain)) {
    return NextResponse.next();
  }

  // Advisor handle subdomain — rewrite to /{handle}{path}
  // e.g. krishnamohannoti.yvity.com/services → /krishnamohannoti/services
  const currentPath = url.pathname;

  // Avoid double-rewriting
  if (currentPath.startsWith(`/${subdomain}`)) {
    return NextResponse.next();
  }

  url.pathname = `/${subdomain}${currentPath === "/" ? "" : currentPath}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, robots.txt, sitemap.xml (static files)
     * - /api routes (handled directly, no rewrite needed)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/).*)",
  ],
};

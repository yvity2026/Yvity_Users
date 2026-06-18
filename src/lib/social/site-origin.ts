/** Canonical site origin for OG tags, canonical URLs, and absolute asset paths. */
export function getSiteOrigin(): string {
  // Explicit override — highest priority (set in Vercel env vars as https://yvity.com)
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && !fromEnv.includes("localhost")) return fromEnv.replace(/\/$/, "");

  // Vercel production custom domain (e.g. "yvity.com") — stable across deployments
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) return `https://${vercelProd.replace(/\/$/, "")}`;

  // Vercel deployment URL — used in preview/staging environments
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Local dev fallback
  return fromEnv ?? "http://localhost:3002";
}

export function toAbsoluteUrl(origin: string, pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

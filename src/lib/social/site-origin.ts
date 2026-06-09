/** Canonical site origin for OG tags, canonical URLs, and absolute asset paths. */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function toAbsoluteUrl(origin: string, pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

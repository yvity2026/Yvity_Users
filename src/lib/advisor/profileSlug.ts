export function slugifyAdvisorName(name: string) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getAdvisorProfileSlug(name: string) {
  return slugifyAdvisorName(name);
}

export function normalizeAdvisorProfileSlug(slug: string) {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatProfileSlugForPublicUrl(slug: string) {
  const normalized = normalizeAdvisorProfileSlug(slug);
  if (!normalized) return "";

  return normalized
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}

export function resolveAdvisorProfileSlug(profileSlug: string | null | undefined, name: string) {
  return normalizeAdvisorProfileSlug(profileSlug || "") || getAdvisorProfileSlug(name);
}

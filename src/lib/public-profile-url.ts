import { buildPublicProfilePath, toPublicProfileSlugSegment } from "@/lib/advisor/public-profile-slug";

export function canAdvisorSharePublicProfile(
  advisor?: { account_status?: string; approved_at?: string | null } | null,
): boolean {
  return advisor?.account_status === "active" && Boolean(advisor?.approved_at?.trim());
}

/**
 * Append `preview=public` so embedded chrome shows visitor UI while the
 * advisor is still logged in.
 */
export function withVisitorPreview(path: string): string {
  if (!path) return "/profile?preview=public";

  const [base, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set("preview", "public");
  return `${base}?${params.toString()}`;
}

export function buildAdvisorPublicProfilePath(profileSlug?: string | null): string {
  const segment = toPublicProfileSlugSegment(profileSlug ?? "");
  return segment ? buildPublicProfilePath(segment) : "/profile";
}

/** Dashboard iframe / preview tab — always allowed before approval. */
export function getPublicProfilePreviewPath(profileSlug?: string | null): string {
  return withVisitorPreview(buildAdvisorPublicProfilePath(profileSlug));
}

/** Live shareable URL — only valid once admin has approved the profile. */
export function getPublicProfileLivePath(profileSlug?: string | null): string {
  return buildAdvisorPublicProfilePath(profileSlug);
}

/**
 * @deprecated Use getPublicProfilePreviewPath(slug) or getPublicProfileLivePath(slug).
 */
export function getPublicProfileSharePath(profileSlug?: string | null): string {
  return getPublicProfilePreviewPath(profileSlug);
}

export function getPublicProfileShareUrl(profileSlug?: string | null, live = false): string {
  const path = live
    ? getPublicProfileLivePath(profileSlug)
    : getPublicProfilePreviewPath(profileSlug);
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

export function getPublicProfilePreviewUrl(profileSlug?: string | null): string {
  const path = getPublicProfilePreviewPath(profileSlug);
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

export function getPublicProfileLiveUrl(profileSlug?: string | null): string {
  return getPublicProfileShareUrl(profileSlug, true);
}

type AdvisorProfileLinkSource = {
  profileUrl?: string | null;
  profile_slug?: string | null;
  profileSlug?: string | null;
  slug?: string | null;
};

/**
 * Canonical live public profile path for directory cards and CTAs —
 * same URL advisors share from the workspace (`/{profile-slug}`).
 */
export function resolvePublicAdvisorProfileUrl(
  advisor?: AdvisorProfileLinkSource | null,
): string {
  const direct = advisor?.profileUrl?.trim();
  if (direct && direct !== "/profile") {
    if (direct.startsWith("http://") || direct.startsWith("https://")) {
      try {
        return new URL(direct).pathname || "/profile";
      } catch {
        return direct.split("?")[0];
      }
    }
    return direct.split("?")[0];
  }

  const slug =
    advisor?.profile_slug?.trim() ||
    advisor?.profileSlug?.trim() ||
    advisor?.slug?.trim() ||
    "";

  return getPublicProfileLivePath(slug);
}

"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthUserContext";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { useResolvedPublicAdvisorPayload } from "@/hooks/use-resolved-public-advisor-payload";
import {
  buildPublicProfilePath,
  isReservedPublicProfileSlug,
  isPublicProfileSurfacePath,
} from "@/lib/advisor/public-profile-slug";

function getSessionSlug(): string {
  try {
    return sessionStorage.getItem("yvity-public-view-slug")?.trim() || "";
  } catch {
    return "";
  }
}

/**
 * Extract the advisor slug from the URL pathname synchronously.
 * On /jithin-kumar or /jithin-kumar/my-career the first segment IS the slug.
 * This is the most reliable source — no async, no race conditions.
 */
function getSlugFromPathname(pathname: string): string {
  if (!isPublicProfileSurfacePath(pathname)) return "";
  const parts = pathname.split("?")[0].replace(/\/$/, "").split("/").filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0];
  // Skip standalone section names like /my-career, /services etc.
  if (isReservedPublicProfileSlug(first)) return "";
  return first;
}

/** Home link for public profile navbar — slug URL when available.
 *  Works on section pages (/my-career etc.) via URL parsing (synchronous). */
export function usePublicProfileNavHome(): string {
  const publicView = usePublicProfileView();
  const { advisor } = useAuth();
  const resolved = useResolvedPublicAdvisorPayload();
  const pathname = usePathname();

  return useMemo(() => {
    // URL slug is synchronous and always correct — no race conditions.
    // The navbar is outside [slug]/layout.tsx so publicView is null there;
    // parsing the URL is the only reliable way to identify the viewed advisor.
    const urlSlug = getSlugFromPathname(pathname);

    const slug =
      publicView?.profile.profile_slug ??
      resolved?.profile.profile_slug ??
      (urlSlug || advisor?.profile_slug || getSessionSlug() || "");

    if (slug?.trim()) return buildPublicProfilePath(slug);
    return "/profile";
  }, [
    publicView?.profile.profile_slug,
    resolved?.profile.profile_slug,
    advisor?.profile_slug,
    pathname,
  ]);
}

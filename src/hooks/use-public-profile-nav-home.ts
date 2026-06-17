"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { useResolvedPublicAdvisorPayload } from "@/hooks/use-resolved-public-advisor-payload";
import { buildPublicProfilePath } from "@/lib/advisor/public-profile-slug";

function getSessionSlug(): string {
  try {
    return sessionStorage.getItem("yvity-public-view-slug")?.trim() || "";
  } catch {
    return "";
  }
}

/** Home link for public profile navbar — slug URL when available.
 *  Works on section pages (/my-career etc.) via sessionStorage + resolved payload. */
export function usePublicProfileNavHome(): string {
  const publicView = usePublicProfileView();
  const { advisor } = useAuth();
  const resolved = useResolvedPublicAdvisorPayload();

  return useMemo(() => {
    const slug =
      publicView?.profile.profile_slug ??
      resolved?.profile.profile_slug ??
      advisor?.profile_slug ??
      getSessionSlug();
    if (slug?.trim()) return buildPublicProfilePath(slug);
    return "/profile";
  }, [
    publicView?.profile.profile_slug,
    resolved?.profile.profile_slug,
    advisor?.profile_slug,
  ]);
}

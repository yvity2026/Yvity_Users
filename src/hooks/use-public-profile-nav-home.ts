"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { buildPublicProfilePath } from "@/lib/advisor/public-profile-slug";

/** Home link for public profile navbar — slug URL when available. */
export function usePublicProfileNavHome(): string {
  const publicView = usePublicProfileView();
  const { advisor } = useAuth();

  return useMemo(() => {
    const slug = publicView?.profile.profile_slug ?? advisor?.profile_slug;
    if (slug?.trim()) return buildPublicProfilePath(slug);
    return "/profile";
  }, [publicView?.profile.profile_slug, advisor?.profile_slug]);
}

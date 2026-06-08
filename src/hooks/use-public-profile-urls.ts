"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthUserContext";
import {
  canAdvisorSharePublicProfile,
  getPublicProfileLivePath,
  getPublicProfileLiveUrl,
  getPublicProfilePreviewPath,
  getPublicProfilePreviewUrl,
} from "@/lib/public-profile-url";

export function usePublicProfileUrls() {
  const { advisor } = useAuth();
  const slug = advisor?.profile_slug ?? null;
  const canShare = canAdvisorSharePublicProfile(advisor);

  return useMemo(
    () => ({
      slug,
      canShare,
      previewPath: getPublicProfilePreviewPath(slug),
      livePath: getPublicProfileLivePath(slug),
      previewUrl:
        typeof window !== "undefined"
          ? getPublicProfilePreviewUrl(slug)
          : getPublicProfilePreviewPath(slug),
      liveUrl:
        typeof window !== "undefined"
          ? getPublicProfileLiveUrl(slug)
          : getPublicProfileLivePath(slug),
    }),
    [slug, canShare],
  );
}

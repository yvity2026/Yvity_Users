"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { isPublicProfilePath } from "@/lib/public-profile-paths";
import type { PublicViewAdvisorPayload } from "@/lib/server/public-view-context";

/**
 * Resolves the advisor payload for public profile pages.
 * Slug home uses server-provided context; section routes fetch from the API
 * using the public-view cookie / session.
 */
export function useResolvedPublicAdvisorPayload(): PublicViewAdvisorPayload | null {
  const pathname = usePathname();
  const publicView = usePublicProfileView();
  const [fetched, setFetched] = useState<PublicViewAdvisorPayload | null>(null);

  useEffect(() => {
    if (publicView) {
      setFetched(null);
      return;
    }

    if (!isPublicProfilePath(pathname)) {
      setFetched(null);
      return;
    }

    let cancelled = false;

    void fetch("/api/public/advisor-display", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : { payload: null }))
      .then((json: { payload?: PublicViewAdvisorPayload | null }) => {
        if (!cancelled) setFetched(json.payload ?? null);
      })
      .catch(() => {
        if (!cancelled) setFetched(null);
      });

    return () => {
      cancelled = true;
    };
  }, [publicView, pathname]);

  useEffect(() => {
    if (publicView) return;

    const refetch = () => {
      if (!isPublicProfilePath(pathname)) return;
      void fetch("/api/public/advisor-display", { cache: "no-store", credentials: "same-origin" })
        .then((res) => (res.ok ? res.json() : { payload: null }))
        .then((json: { payload?: PublicViewAdvisorPayload | null }) => {
          setFetched(json.payload ?? null);
        })
        .catch(() => setFetched(null));
    };

    window.addEventListener("profile-data-updated", refetch);
    return () => window.removeEventListener("profile-data-updated", refetch);
  }, [publicView, pathname]);

  return publicView ?? fetched;
}

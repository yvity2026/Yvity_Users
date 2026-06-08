"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  isPublicAdvisorSlugPath,
  isPublicProfileSurfacePath,
} from "@/lib/advisor/public-profile-slug";

function isPublicAdvisorBrowsePath(pathname: string): boolean {
  return isPublicAdvisorSlugPath(pathname) || isPublicProfileSurfacePath(pathname);
}

/** Clears the public-view cookie when navigating away from advisor profile routes (same tab). */
export function PublicProfileViewCookieSync() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;

    if (!previousPath) return;

    const leftPublicProfile =
      isPublicAdvisorBrowsePath(previousPath) && !isPublicAdvisorBrowsePath(pathname);

    if (leftPublicProfile) {
      void fetch("/api/public-view", { method: "DELETE" });
    }
  }, [pathname]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { PUBLIC_VIEW_USER_STORAGE_KEY } from "@/context/public-profile-view-context";
import {
  isPublicAdvisorSlugPath,
  isPublicProfileSurfacePath,
} from "@/lib/advisor/public-profile-slug";

function isPublicAdvisorBrowsePath(pathname: string): boolean {
  return isPublicAdvisorSlugPath(pathname) || isPublicProfileSurfacePath(pathname);
}

function refreshPublicSectionStores() {
  for (const evt of [
    "services-data-updated",
    "achievements-data-updated",
    "testimonials-data-updated",
    "gallery-data-updated",
    "career-data-updated",
  ]) {
    window.dispatchEvent(new CustomEvent(evt));
  }
}

/** Keeps public-view cookie in sync across slug home and section routes (`/my-career`, etc.). */
export function PublicProfileViewCookieSync() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);
  const bootstrappedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPublicProfileSurfacePath(pathname) || isPublicAdvisorSlugPath(pathname)) {
      return;
    }

    let storedUserId: string | null = null;
    try {
      storedUserId = sessionStorage.getItem(PUBLIC_VIEW_USER_STORAGE_KEY)?.trim() || null;
    } catch {
      storedUserId = null;
    }

    if (!storedUserId || bootstrappedUserRef.current === storedUserId) return;

    bootstrappedUserRef.current = storedUserId;
    void fetch("/api/public-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: storedUserId }),
    }).then((res) => {
      if (res.ok) {
        refreshPublicSectionStores();
        window.dispatchEvent(new CustomEvent("profile-data-updated"));
      }
    });
  }, [pathname]);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    previousPathRef.current = pathname;

    if (!previousPath) return;

    const leftPublicProfile =
      isPublicAdvisorBrowsePath(previousPath) && !isPublicAdvisorBrowsePath(pathname);

    if (leftPublicProfile) {
      bootstrappedUserRef.current = null;
      try {
        sessionStorage.removeItem(PUBLIC_VIEW_USER_STORAGE_KEY);
      } catch {
        // ignored
      }
      void fetch("/api/public-view", { method: "DELETE" });
    }
  }, [pathname]);

  return null;
}

"use client";

import { usePathname } from "next/navigation";
import { isPublicProfileSurfacePath } from "@/lib/advisor/public-profile-slug";
import { useIsVisitorPreview } from "@/lib/use-visitor-preview";

/**
 * Public profile pages should always show the visitor navbar (Home, Services, …
 * + Login) — never the signed-in Dashboard / Logout strip — even when the
 * advisor is previewing their own live profile while logged in.
 */
export function useShowPublicVisitorNav(): boolean {
  const pathname = usePathname();
  const isVisitorPreview = useIsVisitorPreview();
  return isVisitorPreview || isPublicProfileSurfacePath(pathname);
}

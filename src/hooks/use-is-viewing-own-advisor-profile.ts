"use client";

import { useAuth } from "@/context/AuthUserContext";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { useIsVisitorPreview } from "@/lib/use-visitor-preview";

/**
 * True inside the advisor workspace or iframe preview (`?preview=public`).
 * Client actions stay visible on the live public profile URL — even when the
 * advisor opens their own link — so the page matches what visitors see.
 */
export function useIsAdvisorWorkspacePreview(): boolean {
  const isVisitorPreview = useIsVisitorPreview();
  const { user } = useAuth();
  const publicView = usePublicProfileView();

  if (isVisitorPreview) return true;
  if (user?.id && !publicView) return true;
  return false;
}

/** @deprecated Use useIsAdvisorWorkspacePreview — kept for existing imports. */
export function useIsViewingOwnAdvisorProfile(): boolean {
  return useIsAdvisorWorkspacePreview();
}

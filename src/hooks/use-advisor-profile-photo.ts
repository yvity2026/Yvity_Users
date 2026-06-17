"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";
import { useResolvedPublicAdvisorPayload } from "@/hooks/use-resolved-public-advisor-payload";

/** Canonical advisor profile photo — registration selfie, or OTP-updated photo. */
export function useAdvisorProfilePhoto(): string {
  const { user } = useAuth();
  const publicView = usePublicProfileView();
  const publicAdvisor = useResolvedPublicAdvisorPayload();

  return useMemo(() => {
    // Determine whose profile we're showing.
    // On slug page: publicView.userId is the advisor's userId.
    // On section pages (/my-career etc.): publicView is null, but publicAdvisor
    // is loaded async via cookie. Use publicAdvisor.userId when available.
    const advisorUserId = publicView?.userId ?? publicAdvisor?.userId ?? null;

    // Owner context: the logged-in user IS the advisor (or no advisor context yet).
    // When advisorUserId is known, compare strictly. When unknown, don't assume owner —
    // avoids returning the customer's own photo on advisor section pages.
    const isOwnerContext = advisorUserId
      ? advisorUserId === user?.id
      : !publicAdvisor; // no advisor loaded yet → if also no publicView, assume own profile

    // Owner session photo updates immediately after profile-photo OTP upload.
    if (isOwnerContext) {
      const fromSession = resolveProfilePhotoUrl(user?.selfie_url);
      if (fromSession) return fromSession;
    }

    // Advisor's stored photo (from server payload or async API fetch).
    const fromPayload = resolveProfilePhotoUrl(publicAdvisor?.selfie_url);
    if (fromPayload) return fromPayload;

    return "";
  }, [publicAdvisor?.selfie_url, publicAdvisor?.userId, publicView, user?.id, user?.selfie_url]);
}

/** Whether the identity-verified badge should show on public profile avatars. */
export function useShowAdvisorVerifiedBadge(): boolean {
  const { advisor } = useAuth();
  const publicView = usePublicProfileView();

  return publicView
    ? isAdvisorProfileApproved(publicView.profile)
    : isAdvisorProfileApproved(advisor);
}

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
    const isOwnerContext = !publicView || publicView.userId === user?.id;

    // Owner session updates immediately after profile-photo OTP upload.
    if (isOwnerContext) {
      const fromSession = resolveProfilePhotoUrl(user?.selfie_url);
      if (fromSession) return fromSession;
    }

    const fromPayload = resolveProfilePhotoUrl(publicAdvisor?.selfie_url);
    if (fromPayload) return fromPayload;

    return "";
  }, [publicAdvisor?.selfie_url, publicView, user?.id, user?.selfie_url]);
}

/** Whether the identity-verified badge should show on public profile avatars. */
export function useShowAdvisorVerifiedBadge(): boolean {
  const { advisor } = useAuth();
  const publicView = usePublicProfileView();

  return publicView
    ? isAdvisorProfileApproved(publicView.profile)
    : isAdvisorProfileApproved(advisor);
}

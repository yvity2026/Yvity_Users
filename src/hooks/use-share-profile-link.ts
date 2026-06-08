"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthUserContext";
import { recordProfileShare } from "@/lib/profile-shares/record-share";
import {
  canAdvisorSharePublicProfile,
  getPublicProfileLiveUrl,
} from "@/lib/public-profile-url";

type ShareProfileLinkOptions = {
  /** Advisor whose profile is being shared — defaults to the signed-in user. */
  advisorUserId?: string | null;
  /** Slug of the profile being shared — defaults to the signed-in advisor slug. */
  profileSlug?: string | null;
  /** Allow share on a live public profile page (e.g. visitor sharing an advisor). */
  livePublicProfile?: boolean;
};

/**
 * Share the live public profile URL — only after admin approval.
 * Logged-in shares are recorded for YVITY Score (self vs client).
 */
export function useShareProfileLink(options?: ShareProfileLinkOptions) {
  const [copied, setCopied] = useState(false);
  const { advisor, user } = useAuth();
  const slug = options?.profileSlug ?? advisor?.profile_slug ?? null;
  const canShare = options?.livePublicProfile
    ? Boolean(slug?.trim())
    : canAdvisorSharePublicProfile(advisor);
  const advisorUserId = options?.advisorUserId ?? user?.id ?? null;

  const share = useCallback(async () => {
    if (!canShare || !slug) {
      toast.message("Profile not live yet", {
        description:
          "You can preview your profile in the dashboard, but sharing unlocks after YVITY admin approves your profile.",
        duration: 6000,
      });
      return { mode: "blocked" as const };
    }

    const url = getPublicProfileLiveUrl(slug);
    const name = user?.name?.trim() || "Advisor";
    const text = options?.livePublicProfile
      ? `Check out this verified YVITY advisor profile`
      : `View my verified YVITY profile — ${name}`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: name, text, url });
        if (user?.id) void recordProfileShare(advisorUserId);
        return { mode: "native" as const };
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      if (user?.id) void recordProfileShare(advisorUserId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
      toast.success("Profile link copied");
      return { mode: "clipboard" as const };
    } catch {
      return { mode: "cancelled" as const };
    }
  }, [canShare, slug, user?.name, user?.id, advisorUserId, options?.livePublicProfile]);

  return { share, copied, canShare } as const;
}

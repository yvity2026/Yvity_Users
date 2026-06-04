"use client";

import { useCallback, useState } from "react";
import { advisorProfile } from "@/lib/advisor-profile";
import { getPublicProfileShareUrl } from "@/lib/public-profile-url";

/**
 * Shared "Share my public profile" behaviour.
 *
 * - Uses the Web Share API when available (native share sheet on mobile).
 * - Falls back to the clipboard, flipping `copied` for 2.5 s so the
 *   caller can show a "Link copied!" confirmation.
 * - Always points to the canonical share URL (`?preview=public`) so the
 *   recipient sees the visitor chrome — even when the advisor copies it
 *   from their own logged-in browser.
 */
export function useShareProfileLink() {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const url = getPublicProfileShareUrl();
    const text = `View my verified YVITY profile — ${advisorProfile.name}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: advisorProfile.name, text, url });
        return { mode: "native" as const };
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
      return { mode: "clipboard" as const };
    } catch {
      // User cancelled the share sheet or clipboard write failed — quietly noop.
      return { mode: "cancelled" as const };
    }
  }, []);

  return { share, copied } as const;
}

"use client";

import { usePathname } from "next/navigation";
import { PublicProfileFooter } from "@/components/home/public-profile-footer";
import { ReachOutToAdvisorSection } from "@/components/home/reach-out-to-advisor-section";
import { isPublicProfilePath } from "@/lib/public-profile-paths";
import { cn } from "@/lib/utils";

/** Reach Out + footer on all public advisor profile routes. */
export function PublicProfileFooterLayout() {
  const pathname = usePathname();

  if (!isPublicProfilePath(pathname)) return null;

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 sm:px-6",
        // Tight top padding — the previous page already ends with a CTA card,
        // so we only need a small breathing room before the Reach Out card.
        "pt-3 sm:pt-4",
        // Bottom padding doubles as floating-nav clearance on mobile (the
        // public site's bottom nav bubble is ~80px tall). On `md+` there is
        // no floating nav so a smaller spacer is plenty.
        "pb-24 md:pb-12",
        "space-y-4 sm:space-y-6",
      )}
    >
      <ReachOutToAdvisorSection />
      <PublicProfileFooter />
    </div>
  );
}

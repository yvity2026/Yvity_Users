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
        // Small gap after the last home CTA — no extra air on desktop.
        "pt-2 sm:pt-3 lg:pt-2",
        // Mobile: clearance for the floating bottom nav (~80px).
        "pb-24 lg:pb-6",
        "space-y-3 sm:space-y-4",
      )}
    >
      <ReachOutToAdvisorSection />
      <PublicProfileFooter />
    </div>
  );
}

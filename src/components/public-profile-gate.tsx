"use client";

import { usePathname } from "next/navigation";
import { EyeOff } from "lucide-react";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { isPublicAdvisorSlugPath } from "@/lib/advisor/public-profile-slug";

const BYPASS_PREFIXES = ["/advisor", "/login", "/register", "/edit", "/dashboard"];

/** Blocks public profile routes when the advisor has deactivated their profile. */
export function PublicProfileGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicView = usePublicProfileView();
  const { settings, loading } = useAdvisorSettings();

  const bypass = BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const browsingPublicSlug = isPublicAdvisorSlugPath(pathname);

  if (bypass || loading || publicView || browsingPublicSlug || settings.publicProfile.profileActive) {
    return children;
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="glass-strong max-w-md w-full rounded-3xl border border-white/12 p-8 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground mb-4">
          <EyeOff className="size-7" />
        </span>
        <h1 className="text-xl font-bold tracking-tight">Profile unavailable</h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          This advisor profile is temporarily unavailable. Please check back later or contact the
          advisor directly.
        </p>
      </div>
    </main>
  );
}

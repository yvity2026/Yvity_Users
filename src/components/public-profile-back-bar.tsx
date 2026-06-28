"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Sticky back button shown on all public profile pages on mobile/PWA only.
 * Sits just below the fixed top navbar (60px on mobile, 64px on sm).
 * Uses router.back() when history exists; falls back to "/" for direct/share links.
 */
export function PublicProfileBackBar() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div
      className={[
        "md:hidden",
        "sticky top-[3.75rem] sm:top-16",
        "z-40 w-full",
        "border-b border-white/10",
        "bg-background/85 backdrop-blur-md",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors active:scale-95 hover:text-foreground"
      >
        <ChevronLeft className="size-4 shrink-0" strokeWidth={2.5} />
        <span>Back</span>
      </button>
    </div>
  );
}

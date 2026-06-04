"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sticky workspace header that sits above every section of the Advisor
 * Workspace. Surfaces the advisor's name (so the platform feels like a
 * personalised business console) and a breadcrumb that updates with the
 * active section.
 *
 * - Desktop (`md+`): sits at the top of the content area and stays pinned
 *   while the content below scrolls.
 * - Mobile: pinned below the small logo bar (`top-16`) so the user always
 *   sees both YVITY branding and their workspace identity.
 */
export type AdvisorWorkspaceHeaderProps = {
  /** Full name of the advisor (e.g. "Krishna Mohan Noti"). */
  advisorName: string;
  /** Hierarchical breadcrumb. Last element is rendered as the active page. */
  breadcrumb: string[];
  /** Optional override for the workspace tagline. */
  tagline?: string;
};

const DEFAULT_TAGLINE = "Manage your profile, services, leads and advisor growth.";

export function AdvisorWorkspaceHeader({
  advisorName,
  breadcrumb,
  tagline = DEFAULT_TAGLINE,
}: AdvisorWorkspaceHeaderProps) {
  const ownerName = workspaceOwnerName(advisorName);

  return (
    <div
      className={cn(
        // Sticky positioning. On mobile the logo top bar (h-16 = 64px) sits
        // above the content area, so we offset the header by that amount;
        // on desktop the sidebar renders the logo and the header pins to
        // the very top of the main content area.
        "sticky z-20 max-md:top-16 md:top-0",
        "border-b yvity-workspace-chrome",
      )}
    >
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-3.5 md:py-5">
        {/* Workspace title — advisor name + Workspace. The personalised
            "<Name> Workspace" string already conveys the surface; the
            previous "Advisor workspace" eyebrow above it was redundant. */}
        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-tight">
          <span className="text-foreground">{ownerName}</span>
          <span className="ml-1.5 font-light text-foreground/70">Workspace</span>
        </h1>

        {/* Static tagline */}
        <p className="mt-0.5 text-[11px] md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">
          {tagline}
        </p>

        {/* Breadcrumb — updates per section */}
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mt-2 md:mt-2.5 flex items-center gap-1 flex-wrap">
            {breadcrumb.map((label, i) => {
              const last = i === breadcrumb.length - 1;
              return (
                <span key={`${i}-${label}`} className="inline-flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight
                      className="size-3 md:size-3.5 text-muted-foreground/55"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "text-[11px] md:text-xs leading-none",
                      last ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </span>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

/**
 * Pick the first one or two words of the advisor's full name as the
 * personalised owner label — matches the brand examples ("Krishna Mohan
 * Workspace" rather than "Krishna Mohan Noti Workspace"). Returns
 * `"Advisor"` as a safe fallback when the name is missing.
 */
function workspaceOwnerName(fullName: string | undefined | null): string {
  if (!fullName) return "Advisor";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Advisor";
  return parts.slice(0, 2).join(" ");
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { YvityLogo } from "@/components/brand/yvity-logo";
import {
  ADVISOR_PROFILE_NAV,
  ADVISOR_TOP_NAV,
  type AdvisorProfileSection,
  type AdvisorTopSection,
} from "@/lib/advisor-nav";
import { cn } from "@/lib/utils";

/**
 * Premium SaaS-style left sidebar for the Advisor Workspace.
 *
 * - Hidden below `md` — phones use the floating bottom nav instead.
 * - Permanent on `md+` with a fluid width (narrower on tablet, wider on
 *   desktop) so the sidebar adapts to the available screen real-estate
 *   without a manual toggle.
 * - Profile Management is rendered as an expandable group containing the
 *   six sub-sections (My Career, Services, Achievements, Testimonials,
 *   Gallery, YVITY Score). The group auto-expands whenever Profile is
 *   the active top section so the active sub-item is always visible.
 */
export type AdvisorSidebarProps = {
  topSection: AdvisorTopSection;
  profileSection: AdvisorProfileSection;
  onTopChange: (section: AdvisorTopSection) => void;
  onProfileChange: (section: AdvisorProfileSection) => void;
  onLogout: () => void;
  /** When embedded in YVITY My Space, logo links back to dashboard hub. */
  embedMode?: boolean;
};

/**
 * Tailwind padding utility classes the dashboard uses to offset the main
 * content area from the fixed sidebar. Kept in sync with the widths below.
 */
export const SIDEBAR_CONTENT_OFFSET = "md:pl-56 lg:pl-64";

export function AdvisorSidebar({
  topSection,
  profileSection,
  onTopChange,
  onProfileChange,
  onLogout,
  embedMode = false,
}: AdvisorSidebarProps) {
  const [profileOpen, setProfileOpen] = useState(topSection === "profile");

  // Auto-expand the Profile group whenever the active top section is
  // Profile Management. Users can still collapse it manually after that.
  useEffect(() => {
    if (topSection === "profile") setProfileOpen(true);
  }, [topSection]);

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col",
        "fixed inset-y-0 left-0 z-30",
        "md:w-56 lg:w-64",
        "border-r yvity-workspace-chrome",
      )}
      aria-label="Advisor navigation"
    >
      {/* ─── Header — logo ─── */}
      <div className="flex items-center gap-2.5 h-16 px-4 border-b yvity-workspace-chrome shrink-0">
        <Link
          href={embedMode ? "/dashboard" : "/advisor"}
          className="flex items-center gap-2.5 shrink-0 group/logo"
          aria-label="YVITY home"
        >
          <YvityLogo
            size={36}
            showTagline
            imageClassName="rounded-full bg-[#f8f6f1] p-1 shadow-sm"
            wordmarkClassName="text-sm tracking-[0.16em]"
            taglineClassName="text-[9px] uppercase tracking-[0.18em] text-muted-foreground"
          />
        </Link>
      </div>

      {/* ─── Main nav ─── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2.5">
        <ul className="space-y-0.5">
          {ADVISOR_TOP_NAV.map((item) => {
            // Profile Management has its own group renderer (with a chevron
            // and nested submenu). All other items use the plain row.
            if (item.id === "profile") {
              return (
                <li key={item.id}>
                  <SidebarParentRow
                    icon={item.icon}
                    label={item.label}
                    active={topSection === "profile"}
                    open={profileOpen}
                    onToggle={() => {
                      // Tap behaviour: toggle the submenu AND make sure
                      // the parent is selected as the active top section.
                      setProfileOpen((v) => !v);
                      onTopChange("profile");
                    }}
                  />

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                      profileOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <ul className="mt-0.5 ml-3 pl-3 border-l border-white/10 space-y-0.5">
                        {ADVISOR_PROFILE_NAV.map((sub) => (
                          <li key={sub.id}>
                            <SidebarSubRow
                              icon={sub.icon}
                              label={sub.label}
                              active={topSection === "profile" && profileSection === sub.id}
                              onClick={() => onProfileChange(sub.id)}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <SidebarRow
                  icon={item.icon}
                  label={item.label}
                  active={topSection === item.id}
                  onClick={() => onTopChange(item.id)}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ─── Footer — Logout ───
          The "Preview profile" entry was removed: the workspace already
          surfaces the public profile via the dedicated `Public Profile`
          sidebar item (with desktop/mobile preview chrome and a Share
          CTA bar), so a duplicate "Preview profile" footer link added
          noise without offering anything new. */}
      <div className="shrink-0 border-t border-white/8 py-3 px-3">
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium w-full",
            // Theme-aware destructive token instead of the hardcoded
            // oklch literal — flips correctly on warm-ivory / clean-white.
            "text-muted-foreground hover:text-destructive",
            "hover:bg-destructive/10",
            "transition-all duration-200 ease-out",
          )}
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

// ─── Internal building blocks ────────────────────────────────────────

function SidebarRow({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/row relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-left",
        "transition-all duration-200 ease-out motion-reduce:transition-none",
        "active:scale-[0.985]",
        active
          ? cn(
              "bg-gradient-to-br from-primary/15 via-primary/8 to-transparent",
              "text-foreground ring-1 ring-primary/30",
              "shadow-[0_4px_18px_-8px_oklch(0.78_0.13_200/0.45)]",
            )
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full",
          "transition-all duration-300 ease-out",
          active ? "bg-gradient-to-b from-primary to-accent opacity-100" : "opacity-0",
        )}
      />
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors duration-200",
          active ? "text-primary" : "text-muted-foreground group-hover/row:text-foreground/85",
        )}
        strokeWidth={active ? 2.1 : 1.8}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

function SidebarParentRow({
  icon: Icon,
  label,
  active,
  open,
  onToggle,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      // No `aria-current` on the parent — the leaf sub-row carries it
      // instead, so a single nav item is announced as the "current page".
      className={cn(
        "group/row relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-left",
        "transition-all duration-200 ease-out motion-reduce:transition-none",
        "active:scale-[0.985]",
        active
          ? cn(
              "bg-gradient-to-br from-primary/15 via-primary/8 to-transparent",
              "text-foreground ring-1 ring-primary/30",
              "shadow-[0_4px_18px_-8px_oklch(0.78_0.13_200/0.45)]",
            )
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full",
          "transition-all duration-300 ease-out",
          active ? "bg-gradient-to-b from-primary to-accent opacity-100" : "opacity-0",
        )}
      />
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors duration-200",
          active ? "text-primary" : "text-muted-foreground group-hover/row:text-foreground/85",
        )}
        strokeWidth={active ? 2.1 : 1.8}
      />
      <span className="truncate flex-1">{label}</span>
      <ChevronDown
        className={cn(
          "size-3.5 shrink-0 text-muted-foreground transition-transform duration-300",
          open && "rotate-180",
        )}
        aria-hidden
      />
    </button>
  );
}

function SidebarSubRow({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/sub flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-left",
        "transition-all duration-200 ease-out motion-reduce:transition-none",
        "active:scale-[0.985]",
        active
          ? cn(
              "bg-primary/10 text-foreground ring-1 ring-primary/25",
              "shadow-[0_2px_10px_-4px_oklch(0.78_0.13_200/0.35)]",
            )
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]",
      )}
    >
      <Icon
        className={cn(
          "size-3.5 shrink-0 transition-colors duration-200",
          active ? "text-primary" : "text-muted-foreground/80 group-hover/sub:text-foreground/85",
        )}
        strokeWidth={active ? 2.15 : 1.8}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

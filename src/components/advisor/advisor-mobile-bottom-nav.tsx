"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Crown,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type AdvisorTopSection } from "@/lib/advisor-nav";
import { cn } from "@/lib/utils";

/**
 * Items shown in the floating pill. "menu" is a meta-tab that opens the
 * bottom sheet; the rest map directly to {@link AdvisorTopSection}.
 */
type PrimaryItemId = AdvisorTopSection | "menu";

type PrimaryItem = {
  id: PrimaryItemId;
  label: string;
  icon: LucideIcon;
};

const PRIMARY_ITEMS: PrimaryItem[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Users },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "menu", label: "Menu", icon: MenuIcon },
];

/** Sections grouped behind the Menu sheet — keeps the pill focused on the
 * four most-used actions. */
const MENU_SECTIONS: {
  id: AdvisorTopSection;
  label: string;
  icon: LucideIcon;
  description: string;
}[] = [
  {
    id: "public-profile",
    label: "Public Profile",
    icon: Globe,
    description: "Preview your live profile page and share it with prospects.",
  },
  {
    id: "insights",
    label: "Insights",
    icon: BarChart3,
    description: "Profile views, engagement and conversions.",
  },
  {
    id: "membership",
    label: "Membership",
    icon: Crown,
    description: "Your YVITY plan, benefits and verification.",
  },
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    description: "Account, notifications and preferences.",
  },
];

/** Top sections that surface from inside the Menu sheet — used to keep the
 * Menu tab visually active when one of them is selected. */
const MENU_SECTION_IDS = new Set<AdvisorTopSection>(MENU_SECTIONS.map((s) => s.id));

/**
 * Premium floating bottom navigation for the Advisor Workspace on mobile.
 *
 * - Floating pill-shaped container with glassmorphism, elegant border and
 *   soft drop shadow — sits above page content and respects iOS safe-area.
 * - Four primary tabs: Dashboard · Leads · Profile · Menu.
 * - Menu (☰) opens a bottom sheet with Insights, Membership, Settings and
 *   Logout — using large touch targets and smooth slide-up animation.
 * - Tapping the active primary tab scrolls the section to the top
 *   (native app pattern). Hidden on `md+`.
 */
export function AdvisorMobileBottomNav({
  topSection,
  onChange,
  onLogout,
}: {
  topSection: AdvisorTopSection;
  onChange: (section: AdvisorTopSection) => void;
  onLogout?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  const menuActive = useMemo(() => MENU_SECTION_IDS.has(topSection), [topSection]);

  const handlePrimary = (id: PrimaryItemId) => {
    if (id === "menu") {
      setMenuOpen(true);
      return;
    }
    // Special case: the Profile tab opens a sub-section picker sheet
    // owned by the parent. Re-fire `onChange("profile")` even when
    // Profile is already active so the parent can re-open the sheet
    // and let the user switch between My Career / Services / etc.
    if (id === "profile") {
      onChange(id);
      return;
    }
    if (id === topSection) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onChange(id);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleMenuSelect = (id: AdvisorTopSection) => {
    closeMenu();
    if (id === topSection) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onChange(id);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <>
      <nav
        className={cn(
          "md:hidden fixed z-40",
          // Horizontal: respect notch safe-area in landscape; otherwise a
          // small 12px gutter from the viewport edge.
          "left-[max(0.75rem,env(safe-area-inset-left))]",
          "right-[max(0.75rem,env(safe-area-inset-right))]",
          // Vertical: float above the iOS home-indicator with a touch of breathing room.
          "bottom-[calc(env(safe-area-inset-bottom)+0.625rem)]",
          // Width: clamp so the pill never gets uncomfortably wide on
          // landscape phones / foldables — `mx-auto` re-centres it within
          // the left/right inset region once max-width kicks in.
          "mx-auto w-auto max-w-md",
        )}
        aria-label="Advisor sections"
      >
        <div
          className={cn(
            // Pill chrome
            "relative w-full rounded-full p-1.5",
            "yvity-workspace-chrome yvity-nav-mobile-bar border",
            "ring-1 ring-inset ring-white/[0.04]",
          )}
        >
          {/* Soft top sheen for a glassy feel */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />

          <ul className="grid grid-cols-4 gap-0.5 sm:gap-1">
            {PRIMARY_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                item.id === "menu" ? menuActive && !menuOpen : !menuOpen && topSection === item.id;
              const isMenuButton = item.id === "menu";
              return (
                // `min-w-0` lets the grid cell shrink below its intrinsic
                // content width so labels truncate instead of forcing the
                // pill wider than the viewport on narrow phones.
                <li key={item.id} className="flex min-w-0">
                  <button
                    type="button"
                    onClick={() => handlePrimary(item.id)}
                    className={cn(
                      "group relative flex w-full min-w-0 flex-col items-center justify-center gap-0.5",
                      "px-1 py-2 rounded-full",
                      "transition-all duration-300 ease-out motion-reduce:transition-none",
                      "active:scale-[0.94]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45",
                    )}
                    aria-current={active && !isMenuButton ? "page" : undefined}
                    aria-expanded={isMenuButton ? menuOpen : undefined}
                    aria-haspopup={isMenuButton ? "menu" : undefined}
                    // No `aria-label` — the visible text label is the
                    // accessible name. A redundant aria-label would cause
                    // double announcements on screen readers.
                  >
                    {/* Active pill background — animates in with a glow */}
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute inset-1 rounded-full",
                        "transition-all duration-300 ease-out motion-reduce:transition-none",
                        active
                          ? cn(
                              "bg-gradient-to-b from-primary/22 via-primary/10 to-transparent",
                              "ring-1 ring-primary/35",
                              "shadow-[0_6px_22px_-8px_oklch(0.78_0.13_200/0.65)]",
                              "opacity-100 scale-100",
                            )
                          : "opacity-0 scale-95",
                      )}
                    />

                    {/* Icon container */}
                    <span
                      aria-hidden
                      className={cn(
                        "relative z-10 inline-flex items-center justify-center",
                        "transition-transform duration-300 ease-out motion-reduce:transition-none",
                        active ? "-translate-y-0.5" : "translate-y-0",
                      )}
                    >
                      <Icon
                        className={cn(
                          "transition-all duration-300 ease-out motion-reduce:transition-none",
                          active
                            ? "size-[20px] text-primary scale-110"
                            : "size-[18px] text-muted-foreground group-hover:text-foreground/85",
                        )}
                        strokeWidth={active ? 2.25 : 1.85}
                      />
                    </span>

                    <span
                      className={cn(
                        "relative z-10 block w-full min-w-0 truncate text-center leading-none mt-0.5",
                        "text-[10px] tracking-tight",
                        "transition-colors duration-200",
                        active
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground/85 font-medium",
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Active glow dot under the icon — slightly larger
                        (6px) so it reads as an intentional indicator
                        instead of a render artefact. */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full",
                        "transition-all duration-300 ease-out motion-reduce:transition-none",
                        active
                          ? "bg-primary opacity-100 shadow-[0_0_10px_oklch(0.78_0.13_200/0.9)]"
                          : "opacity-0",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <MenuSheet
        open={menuOpen}
        topSection={topSection}
        onClose={closeMenu}
        onSelect={handleMenuSelect}
        onLogout={onLogout}
      />
    </>
  );
}

function MenuSheet({
  open,
  topSection,
  onClose,
  onSelect,
  onLogout,
}: {
  open: boolean;
  topSection: AdvisorTopSection;
  onClose: () => void;
  onSelect: (id: AdvisorTopSection) => void;
  onLogout?: () => void;
}) {
  return (
    <div
      className={cn(
        "md:hidden fixed inset-0 z-50",
        "transition-opacity duration-300 ease-out motion-reduce:transition-none",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-0 yvity-nav-shell",
          "transition-opacity duration-300 ease-out",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="More sections"
        className={cn(
          "absolute inset-x-0 bottom-0",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div
          className={cn(
            "relative mx-auto w-full max-w-md",
            "rounded-t-[28px] overflow-hidden",
            "border-t border-x yvity-workspace-chrome yvity-nav-mobile-bar",
          )}
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3" aria-hidden>
            <span className="h-1.5 w-10 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-1">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Advisor menu
              </p>
              <h2 className="text-base font-semibold tracking-tight mt-0.5">More sections</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full",
                "border border-white/12 bg-white/[0.04] text-foreground/85",
                "transition-all duration-200 ease-out",
                "hover:bg-white/[0.08] active:scale-[0.94]",
              )}
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-3 pt-2 pb-3 space-y-1.5">
            {MENU_SECTIONS.map((item, i) => {
              const Icon = item.icon;
              const active = topSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  style={{ animationDelay: open ? `${Math.min(i * 50, 200)}ms` : undefined }}
                  className={cn(
                    "group relative flex w-full items-center gap-3 px-3 py-3.5 rounded-2xl text-left",
                    "border border-transparent",
                    "transition-all duration-300 ease-out motion-reduce:transition-none",
                    "active:scale-[0.985]",
                    open && "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both",
                    active
                      ? cn(
                          "bg-gradient-to-br from-primary/15 via-primary/5 to-transparent",
                          "border-primary/30",
                          "shadow-[0_6px_22px_-10px_oklch(0.78_0.13_200/0.55)]",
                        )
                      : "hover:bg-white/[0.04]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
                      "transition-all duration-300 ease-out motion-reduce:transition-none",
                      active
                        ? "bg-primary/15 ring-1 ring-primary/35 text-primary"
                        : "bg-white/[0.04] ring-1 ring-white/10 text-foreground/80 group-hover:text-foreground",
                    )}
                  >
                    <Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.85} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm font-semibold tracking-tight truncate",
                        active ? "text-foreground" : "text-foreground/90",
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {item.description}
                    </span>
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      className="size-2 rounded-full bg-primary shadow-[0_0_10px_oklch(0.78_0.13_200/0.9)]"
                    />
                  )}
                </button>
              );
            })}

            {onLogout && (
              <>
                <div className="my-2 h-px bg-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  style={{ animationDelay: open ? "200ms" : undefined }}
                  className={cn(
                    "group flex w-full items-center gap-3 px-3 py-3.5 rounded-2xl text-left",
                    "border border-transparent",
                    "transition-all duration-300 ease-out motion-reduce:transition-none",
                    "active:scale-[0.985]",
                    // Theme-aware destructive tint (warm-ivory and clean-white
                    // get a darker, higher-contrast variant via globals.css).
                    "hover:bg-destructive/10 hover:border-destructive/30",
                    open && "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
                      "bg-destructive/10 ring-1 ring-destructive/30 text-destructive",
                      "transition-all duration-300 ease-out",
                      "group-hover:bg-destructive/20",
                    )}
                  >
                    <LogOut className="size-[18px]" strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold tracking-tight text-destructive">
                      Logout
                    </span>
                    <span className="block text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      Sign out of the Advisor Workspace.
                    </span>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

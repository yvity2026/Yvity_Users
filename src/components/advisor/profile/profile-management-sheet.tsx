"use client";

import { useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { ADVISOR_PROFILE_NAV, type AdvisorProfileSection } from "@/lib/advisor-nav";
import { cn } from "@/lib/utils";

/**
 * Section-tone palette — shared with the Profile Management accordion so
 * the picker cards look like exactly the same family of cards on mobile,
 * just in a compact drawer layout.
 */
type ToneStyle = {
  icon: string;
  iconBg: string;
  iconRing: string;
  badge: string;
};

const SECTION_TONES: Record<AdvisorProfileSection, ToneStyle> = {
  profile: {
    icon: "text-[oklch(0.82_0.13_205)]",
    iconBg: "bg-[oklch(0.82_0.13_205/0.14)]",
    iconRing: "ring-[oklch(0.82_0.13_205/0.4)]",
    badge: "bg-[oklch(0.82_0.13_205/0.14)] text-[oklch(0.82_0.13_205)]",
  },
  services: {
    icon: "text-[oklch(0.85_0.16_78)]",
    iconBg: "bg-[oklch(0.85_0.16_78/0.16)]",
    iconRing: "ring-[oklch(0.85_0.16_78/0.4)]",
    badge: "bg-[oklch(0.85_0.16_78/0.14)] text-[oklch(0.85_0.16_78)]",
  },
  achievements: {
    icon: "text-[oklch(0.83_0.15_92)]",
    iconBg: "bg-[oklch(0.83_0.15_92/0.16)]",
    iconRing: "ring-[oklch(0.83_0.15_92/0.4)]",
    badge: "bg-[oklch(0.83_0.15_92/0.14)] text-[oklch(0.83_0.15_92)]",
  },
  testimonials: {
    icon: "text-[oklch(0.78_0.15_295)]",
    iconBg: "bg-[oklch(0.78_0.15_295/0.14)]",
    iconRing: "ring-[oklch(0.78_0.15_295/0.4)]",
    badge: "bg-[oklch(0.78_0.15_295/0.14)] text-[oklch(0.78_0.15_295)]",
  },
  gallery: {
    icon: "text-[oklch(0.82_0.14_350)]",
    iconBg: "bg-[oklch(0.82_0.14_350/0.14)]",
    iconRing: "ring-[oklch(0.82_0.14_350/0.4)]",
    badge: "bg-[oklch(0.82_0.14_350/0.14)] text-[oklch(0.82_0.14_350)]",
  },
  score: {
    icon: "text-[oklch(0.82_0.16_162)]",
    iconBg: "bg-[oklch(0.82_0.16_162/0.14)]",
    iconRing: "ring-[oklch(0.82_0.16_162/0.4)]",
    badge: "bg-[oklch(0.82_0.16_162/0.14)] text-[oklch(0.82_0.16_162)]",
  },
};

const SECTION_SUBTITLES: Record<AdvisorProfileSection, string> = {
  profile: "Experience, education & certifications",
  services: "Manage your service offerings",
  achievements: "Awards & milestones",
  testimonials: "Client reviews & feedback",
  gallery: "Photos & media",
  score: "Profile strength & growth tips",
};

export type ProfileManagementSheetProps = {
  open: boolean;
  activeSection: AdvisorProfileSection;
  onClose: () => void;
  onSelect: (section: AdvisorProfileSection) => void;
};

/**
 * Bottom-sheet drawer that lets mobile users pick one of the six Profile
 * Management sub-sections.
 *
 * Visually mirrors the Profile Management cards used on the public profile
 * accordion (same icon tones / subtitles) so the picker feels familiar.
 * Tapping a card closes the sheet and notifies the parent which section to
 * load in the main content area.
 *
 * Hidden on `md+` — desktop uses the persistent sidebar instead.
 */
export function ProfileManagementSheet({
  open,
  activeSection,
  onClose,
  onSelect,
}: ProfileManagementSheetProps) {
  const close = useCallback(() => onClose(), [onClose]);

  // Lock body scroll + handle ESC while the sheet is visible. Mirrors the
  // pattern already used by the bottom-nav Menu sheet.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div
      className={cn(
        "md:hidden fixed inset-0 z-[55]",
        "transition-opacity duration-300 ease-out motion-reduce:transition-none",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close profile menu"
        onClick={close}
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-0 bg-background/55 backdrop-blur-md",
          "transition-opacity duration-300 ease-out",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Profile Management sections"
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
            "border-t border-x border-white/12",
            "bg-background/90 backdrop-blur-2xl",
            "supports-[backdrop-filter]:bg-background/75",
            "shadow-[0_-22px_60px_-12px_oklch(0_0_0/0.55)]",
            "max-h-[85dvh] flex flex-col",
          )}
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 shrink-0" aria-hidden>
            <span className="h-1.5 w-10 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-1 shrink-0">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Profile management
              </p>
              <h2 className="text-base font-semibold tracking-tight mt-0.5">Choose a section</h2>
            </div>
            <button
              type="button"
              onClick={close}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full",
                "border border-white/12 bg-white/[0.04] text-foreground/85",
                "transition-all duration-200 ease-out",
                "hover:bg-white/[0.08] active:scale-[0.94]",
              )}
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-3 pt-2 pb-3 space-y-1.5 overflow-y-auto">
            {ADVISOR_PROFILE_NAV.map((item, i) => {
              const Icon = item.icon;
              const tone = SECTION_TONES[item.id];
              const subtitle = SECTION_SUBTITLES[item.id];
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  style={{ animationDelay: open ? `${Math.min(i * 45, 240)}ms` : undefined }}
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
                      "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1",
                      tone.iconBg,
                      tone.iconRing,
                      "transition-transform duration-300 ease-out motion-reduce:transition-none",
                      "group-active:scale-95",
                    )}
                  >
                    <Icon
                      className={cn("size-[18px]", tone.icon)}
                      strokeWidth={active ? 2.2 : 1.9}
                    />
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
                      {subtitle}
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
          </div>
        </div>
      </div>
    </div>
  );
}

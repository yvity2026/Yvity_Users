"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { StatCard, type StatCardProps } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";

/**
 * Dashboard section primitive used across Overview, Insights and Membership.
 *
 * On mobile (`max-md`) it renders as a Career-style accordion card: the title
 * row becomes the tap target, the chevron rotates, and the content collapses
 * with a smooth grid-rows transition. On `md+` the original flat title +
 * content layout is preserved unchanged.
 *
 * Children are rendered ONCE — no duplication — so any stateful child
 * components keep a single instance across breakpoints.
 */
export function DashboardSection({
  title,
  subtitle,
  action,
  children,
  className,
  defaultOpen = false,
  noMobileCollapse = false,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Start expanded on mobile (default `false`). Ignored on desktop. */
  defaultOpen?: boolean;
  /** Opt out of the mobile accordion behaviour (rare). */
  noMobileCollapse?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (noMobileCollapse) {
    return (
      <section className={cn("space-y-3", className)}>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "space-y-3",
        "max-md:space-y-0 max-md:glass-strong max-md:rounded-2xl max-md:border max-md:border-white/10 max-md:overflow-hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "md:hidden flex w-full items-start justify-between gap-3 px-4 py-4 text-left",
          "transition-all duration-200 ease-out motion-reduce:transition-none",
          "hover:bg-white/[0.03] active:bg-white/[0.06] active:scale-[0.995]",
        )}
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold tracking-tight">{title}</span>
          {subtitle && (
            <span className="mt-0.5 block text-xs text-muted-foreground">{subtitle}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 mt-0.5 text-[oklch(0.82_0.13_205)] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <div className="hidden md:flex md:items-end md:justify-between md:gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          "md:!grid-rows-[1fr]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="max-md:px-4 max-md:pb-4">{children}</div>
          {action && <div className="md:hidden px-4 pb-4 pt-1 flex justify-end">{action}</div>}
        </div>
      </div>
    </section>
  );
}

/**
 * Backwards-compatible alias for `StatCard`.
 *
 * The canonical compact statistics tile lives in
 * `src/components/ui/stat-card.tsx`. Existing dashboard / insights call
 * sites import `DashboardStatCard` — we keep the name as a re-export
 * wrapper so those imports keep working and automatically pick up any
 * future tweaks to the shared `StatCard` design.
 *
 * Prefer importing `StatCard` directly in new code.
 */
export function DashboardStatCard(props: StatCardProps) {
  return <StatCard {...props} />;
}

/**
 * Standard ring sizes used across the workspace — keeps gradient stroke
 * widths visually consistent regardless of where the ring renders.
 * Prefer one of these constants instead of arbitrary pixel sizes.
 */
export const PROGRESS_RING_SIZES = {
  sm: 48,
  md: 64,
  lg: 72,
  xl: 88,
} as const;
export type ProgressRingSize = keyof typeof PROGRESS_RING_SIZES;

export function ProgressRing({
  percent,
  size = "md",
  className,
}: {
  percent: number;
  size?: ProgressRingSize | number;
  className?: string;
}) {
  const pixelSize = typeof size === "number" ? size : PROGRESS_RING_SIZES[size];
  // Scale stroke with the ring so the gradient stays balanced —
  // 5px on a 48px ring is heavy; 5px on an 88px ring looks anaemic.
  const stroke = Math.max(4, Math.round(pixelSize * 0.075));
  const r = (pixelSize - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      className={cn("-rotate-90 shrink-0", className)}
      aria-hidden
    >
      <circle
        cx={pixelSize / 2}
        cy={pixelSize / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeWidth={stroke}
      />
      <circle
        cx={pixelSize / 2}
        cy={pixelSize / 2}
        r={r}
        fill="none"
        stroke="url(#yvity-ring)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <defs>
        <linearGradient id="yvity-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.82 0.13 205)" />
          <stop offset="100%" stopColor="oklch(0.82 0.16 162)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DashboardLinkButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold text-[oklch(0.82_0.13_205)] hover:text-foreground transition",
        className,
      )}
    >
      {children}
      <ChevronRight className="size-3.5" />
    </button>
  );
}

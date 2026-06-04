"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  YVITY StatCard — canonical compact statistics tile.             ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Layout (icon-left, 3-row stack on the right)                    ║
 * ║                                                                  ║
 * ║      ┌──────────────────────────────────────────────┐            ║
 * ║      │           ┌─────────────────────────┐        │            ║
 * ║      │           │              ↗ +27%     │  ← Row 1 (growth)  ║
 * ║      │  [icon]   │  12,345                 │  ← Row 2 (value)   ║
 * ║      │           │  PROFILE VIEWS          │  ← Row 3 (label)   ║
 * ║      │           └─────────────────────────┘        │            ║
 * ║      └──────────────────────────────────────────────┘            ║
 * ║                                                                  ║
 * ║  Col 1 — accent-tinted icon chip, vertically centered, spans    ║
 * ║          all 3 rows.                                             ║
 * ║  Col 2 — Row 1: growth pill (top-right, optional).              ║
 * ║          Row 2: primary metric value (middle).                  ║
 * ║          Row 3: metric label (bottom, wraps to 2 lines).        ║
 * ║                                                                  ║
 * ║  The value and label each get the full right-column width —     ║
 * ║  even in a 5-up `grid-cols-5` insights grid or a cramped 2-up   ║
 * ║  mobile grid, large numbers like "12,345" and long labels like  ║
 * ║  "SEARCH APPEARANCES" render without truncation.                ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Visual treatment                                                ║
 * ║                                                                  ║
 * ║  - `glass-strong rounded-2xl border border-white/10`             ║
 * ║  - Top sheen line + soft accent corner glow                      ║
 * ║  - Hover-lift (`-translate-y-0.5`, primary-tinted shadow)        ║
 * ║  - Staggered entrance via `index` (max delay 420ms)              ║
 * ║  - Honours `prefers-reduced-motion`                              ║
 * ║                                                                  ║
 * ║  This is the SAME premium language used by the home service     ║
 * ║  cards (`service-detail-card.tsx`) — keeps the platform's       ║
 * ║  metric tiles and feature cards visually cohesive.              ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Use this component for EVERY metric/statistic tile in the      ║
 * ║  app: Community Trust, Dashboard, Insights, Membership KPIs,    ║
 * ║  etc. Do not roll your own.                                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export type StatCardAccent = "cyan" | "emerald" | "amber" | "violet" | "rose";
export type StatCardTrend = "up" | "down" | "neutral";

const ACCENT_GRADIENT: Record<StatCardAccent, string> = {
  cyan: "from-[oklch(0.82_0.13_205)] to-primary",
  emerald: "from-[oklch(0.82_0.16_162)] to-[oklch(0.65_0.13_185)]",
  amber: "from-[oklch(0.85_0.16_78)] to-[oklch(0.7_0.18_45)]",
  violet: "from-[oklch(0.78_0.15_295)] to-[oklch(0.55_0.13_260)]",
  rose: "from-[oklch(0.72_0.18_15)] to-[oklch(0.55_0.15_15)]",
};

const ACCENT_GLOW: Record<StatCardAccent, string> = {
  cyan: "bg-[oklch(0.82_0.13_205/0.2)]",
  emerald: "bg-[oklch(0.82_0.16_162/0.2)]",
  amber: "bg-[oklch(0.85_0.16_78/0.2)]",
  violet: "bg-[oklch(0.78_0.15_295/0.2)]",
  rose: "bg-[oklch(0.72_0.18_15/0.2)]",
};

const ACCENT_RING: Record<StatCardAccent, string> = {
  cyan: "ring-[oklch(0.82_0.13_205/0.35)]",
  emerald: "ring-[oklch(0.82_0.16_162/0.35)]",
  amber: "ring-[oklch(0.85_0.16_78/0.35)]",
  violet: "ring-[oklch(0.78_0.15_295/0.35)]",
  rose: "ring-[oklch(0.72_0.18_15/0.35)]",
};

const TREND_TONE: Record<StatCardTrend, string> = {
  up: "text-[oklch(0.82_0.16_162)]", // emerald
  down: "text-[oklch(0.72_0.18_15)]", // rose
  neutral: "text-muted-foreground",
};

// Soft pill background behind the growth indicator. Matches the trend tone
// so the pill reads as "alive" without overpowering the value below it.
const TREND_PILL_BG: Record<StatCardTrend, string> = {
  up: "bg-[oklch(0.82_0.16_162/0.12)] ring-[oklch(0.82_0.16_162/0.25)]",
  down: "bg-[oklch(0.72_0.18_15/0.12)] ring-[oklch(0.72_0.18_15/0.25)]",
  neutral: "bg-white/[0.06] ring-white/10",
};

function detectTrend(delta?: string): StatCardTrend {
  if (!delta) return "neutral";
  const trimmed = delta.trim();
  if (
    trimmed.startsWith("+") ||
    trimmed.startsWith("↑") ||
    trimmed.startsWith("▲") ||
    /^up\b/i.test(trimmed)
  ) {
    return "up";
  }
  if (
    trimmed.startsWith("-") ||
    trimmed.startsWith("−") ||
    trimmed.startsWith("↓") ||
    trimmed.startsWith("▼") ||
    /^down\b/i.test(trimmed)
  ) {
    return "down";
  }
  return "neutral";
}

export type StatCardProps = {
  /** Metric label (e.g., "Profile Views"). Rendered uppercase. */
  label: string;
  /** Primary metric value. Strings (`"10,000"`) preserve formatting. */
  value: string | number;
  /** Lucide icon to render in the accent chip. */
  icon: LucideIcon;
  /** Color family for the icon chip + accent glow. */
  accent?: StatCardAccent;
  /**
   * Growth indicator text (e.g., `"+27%"`, `"-3.2%"`).
   * Direction (up/down/neutral) is auto-detected from the leading sign.
   */
  delta?: string;
  /** Override the auto-detected trend direction. */
  trend?: StatCardTrend;
  /**
   * Index in the grid — drives the staggered entrance delay.
   * Defaults to 0 (no stagger). Pass the index from your `.map()`.
   */
  index?: number;
  /** Skeleton state — renders the value as a dash with a soft pulse. */
  loading?: boolean;
  /** Render as a `<Link>` instead of an `<article>`. */
  href?: string;
  /** Render as a `<button>` (clickable card). */
  onClick?: () => void;
  /** Spans 2 columns on `md+` — kept for hero KPIs like the YVITY Score tile. */
  large?: boolean;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "cyan",
  delta,
  trend,
  index = 0,
  loading = false,
  href,
  onClick,
  large = false,
  className,
}: StatCardProps) {
  const effectiveTrend: StatCardTrend = trend ?? detectTrend(delta);
  const TrendIcon = effectiveTrend === "down" ? TrendingDown : TrendingUp;
  const showTrendIcon = effectiveTrend !== "neutral";

  const containerClass = cn(
    "group relative h-full overflow-hidden",
    "glass-strong rounded-2xl border border-white/10",
    // Slightly tighter horizontal padding on mobile so 4-digit values + the
    // delta chip both fit comfortably; restored to p-4 on larger screens.
    "p-3 sm:p-3.5 md:p-4",
    "transition-all duration-300 ease-out motion-reduce:transition-none",
    "hover:-translate-y-0.5 hover:border-white/20 hover:shadow-xl hover:shadow-primary/10",
    "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none",
    large && "md:col-span-2",
    (href || onClick) && "cursor-pointer active:scale-[0.99]",
    className,
  );

  const style: React.CSSProperties = {
    animationDelay: `${Math.min(index * 70, 420)}ms`,
  };

  const body = (
    <>
      {/* Soft accent corner glow */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-8 -right-8 size-24 rounded-full blur-2xl opacity-60",
          "transition-opacity duration-300 group-hover:opacity-90",
          ACCENT_GLOW[accent],
        )}
      />

      {/* Top sheen line for premium glass feel */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      {/* 2-column × 3-row grid:
           Col 1 — icon chip, spans all 3 rows, vertically centered.
           Col 2 — Row 1: growth pill (top-right)
                   Row 2: primary value (middle)
                   Row 3: label (bottom)

           The value and label get the FULL right-column width (icon
           is in its own column) so 5–6 digit numbers and multi-word
           labels never collide with the growth indicator. */}
      <div
        className={cn(
          "relative grid h-full items-center gap-x-3 sm:gap-x-3.5",
          "grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_auto_auto]",
        )}
      >
        {/* Icon chip — col 1, spans all 3 rows */}
        <span
          className={cn(
            "row-span-3 self-center inline-flex shrink-0 items-center justify-center rounded-xl",
            "bg-gradient-to-br text-white shadow-md ring-1",
            large ? "size-12" : "size-10 sm:size-11",
            ACCENT_GRADIENT[accent],
            ACCENT_RING[accent],
          )}
        >
          <Icon className={large ? "size-5" : "size-[1.125rem] sm:size-5"} strokeWidth={2.25} />
        </span>

        {/* Growth pill — col 2, row 1 (top right). When absent we render
            an invisible spacer so rows align across cards that lack a
            delta. */}
        {delta ? (
          <span
            className={cn(
              "col-start-2 row-start-1 justify-self-end self-start",
              "inline-flex shrink-0 items-center gap-0.5",
              "rounded-full px-1.5 py-0.5 ring-1",
              "text-[10px] font-semibold tabular-nums leading-none",
              TREND_TONE[effectiveTrend],
              TREND_PILL_BG[effectiveTrend],
            )}
            aria-label={`Change ${delta}`}
          >
            {showTrendIcon && <TrendIcon className="size-3 shrink-0" aria-hidden />}
            <span>{delta}</span>
          </span>
        ) : (
          <span aria-hidden className="col-start-2 row-start-1 h-4" />
        )}

        {/* Primary value — col 2, row 2 (middle) */}
        <p
          className={cn(
            "col-start-2 row-start-2 min-w-0 mt-1",
            "font-bold tabular-nums tracking-tight text-foreground leading-none",
            large ? "text-3xl md:text-4xl" : "text-[1.5rem] sm:text-[1.75rem] md:text-[1.875rem]",
            loading && "animate-pulse opacity-70",
          )}
          title={loading ? undefined : String(value)}
        >
          {loading ? "—" : value}
        </p>

        {/* Label — col 2, row 3 (bottom). Wraps to 2 lines max so words
            like "APPEARANCES" never get cut. */}
        <p
          className={cn(
            "col-start-2 row-start-3 min-w-0 mt-1.5",
            "text-[10.5px] sm:text-[11px] font-medium uppercase tracking-wide text-muted-foreground",
            "line-clamp-2 leading-[1.35]",
          )}
          title={label}
        >
          {label}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={containerClass} style={style}>
        {body}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(containerClass, "w-full text-left")}
        style={style}
      >
        {body}
      </button>
    );
  }

  return (
    <article className={containerClass} style={style}>
      {body}
    </article>
  );
}

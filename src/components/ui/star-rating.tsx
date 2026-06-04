"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Canonical YVITY star rating.
 *
 * Renders five gold stars where:
 *   • Integer rating → that many filled stars, the rest dim.
 *   • Fractional rating (e.g. 4.5) → uses a clipped half-star at the
 *     boundary so the visual matches the numeric value.
 *
 * Single source of truth — replaces the multiple hand-rolled
 * `Array.from({ length: 5 })` star strips in the hero and CTA card.
 */
export function StarRating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  className,
}: {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  /** Render the numeric rating to the right of the stars. */
  showValue?: boolean;
  className?: string;
}) {
  const sizeClass =
    size === "lg" ? "size-4 sm:size-5" : size === "sm" ? "size-3" : "size-3.5 sm:size-4";
  const filledColor = "fill-[oklch(0.85_0.16_78)] text-[oklch(0.85_0.16_78)]";
  const emptyColor = "text-white/20";

  const clamped = Math.max(0, Math.min(max, value));

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      aria-label={`${clamped} out of ${max} stars`}
    >
      <span className="inline-flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const fillRatio = Math.max(0, Math.min(1, clamped - i));
          if (fillRatio >= 1) {
            return <Star key={i} className={cn(sizeClass, filledColor)} aria-hidden />;
          }
          if (fillRatio <= 0) {
            return <Star key={i} className={cn(sizeClass, emptyColor)} aria-hidden />;
          }
          // Partial — overlay a clipped filled star on top of the empty one.
          return (
            <span key={i} className={cn("relative inline-flex", sizeClass)} aria-hidden>
              <Star className={cn("absolute inset-0", sizeClass, emptyColor)} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillRatio * 100}%` }}
              >
                <Star className={cn(sizeClass, filledColor)} />
              </span>
            </span>
          );
        })}
      </span>
      {showValue && (
        <span className="font-semibold text-foreground tabular-nums text-xs sm:text-sm ml-0.5">
          {clamped.toFixed(clamped % 1 === 0 ? 0 : 1)}
        </span>
      )}
    </span>
  );
}

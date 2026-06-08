"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Interactive 1–5 star picker for testimonial and review forms. */
export function StarRatingInput({
  value,
  onChange,
  max = 5,
  size = "lg",
  className,
}: {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  size?: "md" | "lg";
  className?: string;
}) {
  const sizeClass = size === "lg" ? "size-8 sm:size-9" : "size-6 sm:size-7";
  const filledColor = "fill-[oklch(0.85_0.16_78)] text-[oklch(0.85_0.16_78)]";
  const emptyColor =
    "fill-[oklch(0.85_0.16_78/0.18)] text-[oklch(0.85_0.16_78)] hover:fill-[oklch(0.85_0.16_78/0.32)]";

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            onClick={() => onChange(starValue)}
            className={cn(
              "rounded-md p-0.5 transition hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.82_0.13_205/0.6)]",
            )}
          >
            <Star
              className={cn(sizeClass, filled ? filledColor : emptyColor)}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

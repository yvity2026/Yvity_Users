"use client";

import { Children, isValidElement, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shows a preview slice of the children on mobile (first `mobilePreview`
 * items) with a "Show all · N" / "Show less" toggle below. On `md` and up
 * every child is rendered, so desktop layouts are untouched.
 *
 * Implementation notes:
 *  - Children are rendered ONCE (no duplication) — items beyond the preview
 *    threshold are hidden on mobile via `max-md:hidden` on a `display:
 *    contents` wrapper, which keeps the parent grid layout intact.
 *  - The toggle row is mobile-only (`md:hidden`).
 *
 * Use case: keep the public-profile services / achievements / testimonials /
 * gallery grids short on phones to reduce scrolling, in the same spirit as
 * the Career sections accordion.
 */
export function MobilePreviewExpand({
  children,
  mobilePreview,
  totalLabel,
  toggleClassName,
  /**
   * When true (default), the toggle button spans the whole row using
   * `col-span-full`. Set to false when the parent is not a grid.
   */
  toggleSpansColumns = true,
}: {
  children: ReactNode;
  mobilePreview: number;
  totalLabel: (count: number) => string;
  toggleClassName?: string;
  toggleSpansColumns?: boolean;
}) {
  const list = Children.toArray(children).filter(isValidElement);
  const total = list.length;
  const [expanded, setExpanded] = useState(false);
  const hidden = total - mobilePreview;

  return (
    <>
      {list.map((child, i) => {
        const hiddenOnMobile = i >= mobilePreview && !expanded;
        return (
          <div
            key={(child as { key?: string }).key ?? i}
            className={cn("contents", hiddenOnMobile && "max-md:hidden")}
          >
            {child}
          </div>
        );
      })}

      {hidden > 0 && (
        <div
          className={cn(
            "md:hidden flex justify-center",
            toggleSpansColumns && "col-span-full",
            toggleClassName,
          )}
        >
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-white/15",
              "glass px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition",
              "active:scale-[0.98]",
            )}
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" />
                Show all · {totalLabel(total)}
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}

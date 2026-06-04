"use client";

import type { LucideIcon } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard empty-state card. Use across leads list, achievements,
 * testimonials, gallery, latest-highlights so every "nothing here yet"
 * surface looks the same.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-strong rounded-2xl sm:rounded-3xl border border-dashed border-white/15 text-center",
        size === "sm" ? "p-6" : "p-8 sm:p-12",
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "mx-auto text-muted-foreground",
            size === "sm" ? "size-8 mb-2" : "size-10 mb-3",
          )}
          aria-hidden
        />
      )}
      <p className={cn("font-semibold", size === "sm" ? "text-sm" : "text-base")}>{title}</p>
      {description && (
        <p
          className={cn(
            "text-muted-foreground mx-auto max-w-xs leading-relaxed",
            size === "sm" ? "text-xs mt-1.5" : "text-sm mt-2",
          )}
        >
          {description}
        </p>
      )}
      {action && <div className={cn(size === "sm" ? "mt-4" : "mt-6")}>{action}</div>}
    </div>
  );
}

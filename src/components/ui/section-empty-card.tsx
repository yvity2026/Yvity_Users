"use client";

import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Rich empty state for My Space sections — dashed glass card with optional CTA.
 */
export function SectionEmptyCard({
  icon: Icon,
  title,
  description,
  action,
  hint,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-white/20",
        "bg-gradient-to-br from-white/[0.04] via-transparent to-primary/[0.06]",
        "px-6 py-10 sm:px-10 sm:py-12 text-center",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,oklch(0.82_0.13_205/0.12),transparent_70%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/50 to-accent/35 ring-1 ring-white/15 shadow-lg shadow-primary/10">
          <Icon className="size-7 text-foreground" aria-hidden />
        </span>
        <p className="mt-5 text-lg font-bold tracking-tight text-foreground">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        {hint ? (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.82_0.13_205)]">
            <Sparkles className="size-3" aria-hidden />
            {hint}
          </p>
        ) : null}
        {action ? <div className="mt-6 w-full flex flex-col items-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}

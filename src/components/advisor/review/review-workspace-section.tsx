"use client";

import type { LucideIcon } from "lucide-react";
import { Check, Circle, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ReviewSectionStatus = "complete" | "empty" | "locked" | "in_progress";

const STATUS_LABEL: Record<ReviewSectionStatus, string> = {
  complete: "Done",
  empty: "To fill",
  locked: "Under review",
  in_progress: "In progress",
};

const STATUS_CLASS: Record<ReviewSectionStatus, string> = {
  complete: "bg-[oklch(0.82_0.16_162/0.15)] text-[oklch(0.82_0.16_162)] border-[oklch(0.82_0.16_162/0.35)]",
  empty: "bg-white/5 text-muted-foreground border-white/15",
  locked: "bg-amber-400/15 text-amber-100 border-amber-400/35",
  in_progress: "bg-[oklch(0.82_0.13_205/0.15)] text-[oklch(0.82_0.13_205)] border-[oklch(0.82_0.13_205/0.35)]",
};

export function ReviewWorkspaceSection({
  id,
  title,
  subtitle,
  icon: Icon,
  status,
  complete,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  status: ReviewSectionStatus;
  complete?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
    >
      <header className="flex flex-wrap items-start gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-4">
        <span
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10",
            complete
              ? "bg-[oklch(0.82_0.16_162/0.12)] text-[oklch(0.82_0.16_162)]"
              : status === "locked"
                ? "bg-amber-400/15 text-amber-200"
                : "bg-gradient-to-br from-primary/40 to-accent/25 text-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold tracking-tight sm:text-lg">{title}</h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                STATUS_CLASS[status],
              )}
            >
              {status === "locked" ? <Lock className="size-3" aria-hidden /> : null}
              {STATUS_LABEL[status]}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {subtitle}
          </p>
        </div>
        {complete ? (
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[oklch(0.82_0.16_162/0.2)] text-[oklch(0.82_0.16_162)]">
            <Check className="size-4" strokeWidth={3} aria-hidden />
          </span>
        ) : (
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-white/20 text-muted-foreground">
            <Circle className="size-3.5" aria-hidden />
          </span>
        )}
      </header>
      <div className="px-3 py-4 sm:px-4 sm:py-5 md:px-5">{children}</div>
    </section>
  );
}

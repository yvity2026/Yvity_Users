"use client";

import { Check, Circle } from "lucide-react";
import { ProgressRing } from "@/components/advisor/dashboard/dashboard-ui";
import type { ProfileHealthItem } from "@/lib/advisor-dashboard/types";

export function AdvisorReviewBanner({
  completion,
  incomplete,
  onJumpTo,
}: {
  completion: number;
  incomplete: ProfileHealthItem[];
  onJumpTo?: (healthId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/90">
            While we verify your services
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            Complete your public profile
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Your insurance services are with our team (usually{" "}
            <span className="font-semibold text-foreground">24–48 hours</span>). Use this time to
            fill the sections below — each area shows exactly how it will look on your live profile
            once approved.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 self-start sm:self-center">
          <ProgressRing percent={completion} size={88} />
          <div>
            <p className="text-2xl font-bold tabular-nums">{completion}%</p>
            <p className="text-xs text-muted-foreground">Profile ready</p>
          </div>
        </div>
      </div>

      {incomplete.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {incomplete.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onJumpTo?.(item.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-[oklch(0.82_0.13_205/0.4)] hover:bg-white/[0.06]"
              >
                <Circle className="size-3 text-muted-foreground" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[oklch(0.82_0.16_162/0.12)] px-3 py-1.5 text-xs font-semibold text-[oklch(0.82_0.16_162)]">
          <Check className="size-3.5" strokeWidth={3} />
          Great work — you are ready for launch after approval
        </p>
      )}
    </div>
  );
}

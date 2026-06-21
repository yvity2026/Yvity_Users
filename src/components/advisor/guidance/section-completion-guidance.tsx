"use client";

import type { LucideIcon } from "lucide-react";
import { Circle } from "lucide-react";
import type { ReactNode } from "react";
import {
  SECTION_GUIDANCE,
  SERVICES_UNDER_REVIEW_GUIDANCE,
  type ProfileHealthId,
  type SectionGuidanceCopy,
} from "@/lib/advisor-dashboard/section-guidance";
import { useProfileHealth } from "@/hooks/use-profile-health";
import { cn } from "@/lib/utils";

export function SectionCompletionGuidance({
  healthId,
  icon: Icon,
  className,
  action,
  /** Override default copy (e.g. services locked during admin review). */
  copy,
  /** When true, show even if the checklist item is complete (e.g. under-review notice). */
  forceShow,
}: {
  healthId?: ProfileHealthId;
  icon?: LucideIcon;
  className?: string;
  action?: ReactNode;
  copy?: SectionGuidanceCopy;
  forceShow?: boolean;
}) {
  const { loading, isComplete } = useProfileHealth();

  if (loading) return null;

  const guidance = copy ?? (healthId ? SECTION_GUIDANCE[healthId] : undefined);
  if (!guidance) return null;

  const complete = healthId ? isComplete(healthId) : false;
  if (!forceShow && complete) return null;

  return (
    <div
      className={cn(
        "mb-5 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] via-transparent to-transparent px-4 py-4 sm:px-5 sm:py-4",
        className,
      )}
      role="status"
    >
      <div className="flex gap-3">
        {Icon ? (
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-500 ring-1 ring-amber-400/40">
            <Icon className="size-5" aria-hidden />
          </span>
        ) : (
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/20 text-muted-foreground">
            <Circle className="size-4" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight text-foreground">{guidance.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {guidance.description}
          </p>
          {guidance.goal ? (
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-amber-600/80 dark:text-amber-300/80">
              Goal · {guidance.goal}
            </p>
          ) : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function ServicesReviewGuidance({ className }: { className?: string }) {
  const { loading, isComplete } = useProfileHealth();
  if (loading || isComplete("services")) return null;
  return (
    <SectionCompletionGuidance
      className={className}
      copy={SERVICES_UNDER_REVIEW_GUIDANCE}
      forceShow
    />
  );
}

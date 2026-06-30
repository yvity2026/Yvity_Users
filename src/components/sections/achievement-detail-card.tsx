"use client";

import { BadgeCheck, Calendar, Clock, Trophy } from "lucide-react";
import type { AchievementItem } from "@/lib/sections/types";
import {
  achievementCategoryAccents,
  achievementCategoryLabels,
  achievementIconMap,
} from "@/lib/sections/achievements-config";
import { MdrtIcon } from "@/components/ui/mdrt-icon";
import { isYvityVerified } from "@/lib/verification/defaults";
import { VERIFIED_BY_YVITY_LABEL } from "@/lib/verification/copy";
import { cn } from "@/lib/utils";

function achievedLabel(count: number) {
  return count === 1 ? "1 Time" : `${count} Times`;
}

export function AchievementDetailCard({
  item,
  editable,
  onEdit,
  index = 0,
}: {
  item: AchievementItem;
  editable?: boolean;
  onEdit?: () => void;
  /**
   * Zero-based position used for the staggered entrance animation. Capped so
   * long lists never feel sluggish.
   */
  index?: number;
}) {
  const accent = achievementCategoryAccents[item.category];
  const isMdrtIcon = item.iconStyle === "mdrt";
  const Icon = isMdrtIcon ? null : achievementIconMap[item.iconStyle as Exclude<typeof item.iconStyle, "mdrt">];
  const yearsLine = item.years.join(" • ");

  const inner = (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 glass-strong",
        "h-full",
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        "hover:border-white/20 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none",
        editable && "cursor-pointer active:scale-[0.99]",
      )}
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      {/* Shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden rounded-[inherit]">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.06] to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="text-center">
          <span
            className={cn(
              "mx-auto inline-flex size-14 sm:size-16 items-center justify-center rounded-2xl glass mb-4",
              "transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none",
              accent.ring,
            )}
          >
            {isMdrtIcon ? (
              <MdrtIcon size={32} />
            ) : Icon ? (
              <Icon className={cn("size-7 sm:size-8", accent.text)} />
            ) : null}
          </span>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {item.title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{item.subtitle}</p>
          <span
            className={cn(
              "mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
              accent.chip,
              accent.border,
            )}
          >
            {achievementCategoryLabels[item.category]}
          </span>
        </div>

        <div className="my-4 border-t border-white/10" />

        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-muted-foreground">
            <Trophy className={cn("size-4 shrink-0", accent.text)} />
            Achieved:{" "}
            <span className={cn("font-bold", accent.text)}>
              {achievedLabel(item.achievedCount)}
            </span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Calendar className={cn("size-4 shrink-0", accent.text)} />
            <span className="text-foreground/90">{yearsLine}</span>
          </p>
        </div>

        <p className="mt-4 flex-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </p>

        {(() => {
          // Verification is OPTIONAL for achievements. Show the badge only
          // when an admin has explicitly approved the supporting documents.
          // Pending uploads surface a small "Under review" hint inside the
          // dashboard (editable=true) so advisors can see progress without
          // exposing it on the public profile.
          const verified = isYvityVerified(item.verification);
          if (verified) {
            return (
              <div className="mt-5 rounded-xl border border-[oklch(0.82_0.16_162/0.4)] bg-[oklch(0.82_0.16_162/0.1)] px-3 py-2.5 text-center">
                <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.88_0.14_162)]">
                  <BadgeCheck className="size-3.5" /> {VERIFIED_BY_YVITY_LABEL}
                </span>
              </div>
            );
          }
          if (editable && item.verification?.status === "pending") {
            return (
              <div className="mt-5 rounded-xl border border-[oklch(0.85_0.16_78/0.4)] bg-[oklch(0.85_0.16_78/0.08)] px-3 py-2.5 text-center">
                <span className="inline-flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.92_0.14_78)]">
                  <Clock className="size-3.5" /> Verification under review
                </span>
              </div>
            );
          }
          return null;
        })()}

        {editable && (
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.16em] font-semibold text-[oklch(0.82_0.13_205)]">
            Click to edit
          </p>
        )}
      </div>
    </article>
  );

  if (editable && onEdit) {
    return (
      <button type="button" onClick={onEdit} className="w-full text-left h-full">
        {inner}
      </button>
    );
  }

  return inner;
}

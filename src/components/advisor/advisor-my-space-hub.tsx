"use client";

import { ChevronRight } from "lucide-react";
import { MY_SPACE_SECTION_CARDS, type MySpaceSectionKey } from "@/lib/my-space-sections";
import { cn } from "@/lib/utils";

type AdvisorMySpaceHubProps = {
  onOpenSection: (key: MySpaceSectionKey) => void;
};

export function AdvisorMySpaceHub({ onOpenSection }: AdvisorMySpaceHubProps) {
  let lastGroup: string | undefined;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Advisor workspace
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
          Choose a section to open
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap any card below. You can return here anytime with Back to My Space.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {MY_SPACE_SECTION_CARDS.map((card) => {
          const showGroup = card.group && card.group !== lastGroup;
          if (card.group) lastGroup = card.group;

          return (
            <li
              key={card.key}
              className={cn(showGroup && "md:col-span-2 lg:col-span-3")}
            >
              {showGroup ? (
                <p className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[oklch(0.82_0.13_205)]">
                  {card.group}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => onOpenSection(card.key)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-2xl border border-white/12 p-4 text-left",
                  "glass-strong transition hover:border-[oklch(0.82_0.13_205/0.4)] hover:bg-white/[0.04] active:scale-[0.99]",
                )}
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/50 to-accent/30 ring-1 ring-white/15">
                  <card.icon className="size-5 text-foreground" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug">{card.label}</span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground line-clamp-2">
                    {card.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

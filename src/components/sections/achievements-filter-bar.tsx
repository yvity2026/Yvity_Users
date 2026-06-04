"use client";

import type { AchievementCategory, AchievementItem } from "@/lib/sections/types";
import { achievementCategories } from "@/lib/sections/achievements-config";
import { cn } from "@/lib/utils";

export type AchievementFilter = AchievementCategory | "all";

export function AchievementsFilterBar({
  active,
  onChange,
  items,
}: {
  active: AchievementFilter;
  onChange: (filter: AchievementFilter) => void;
  items: AchievementItem[];
}) {
  const counts: Record<AchievementFilter, number> = {
    all: items.length,
    life: items.filter((i) => i.category === "life").length,
    health: items.filter((i) => i.category === "health").length,
    education: items.filter((i) => i.category === "education").length,
    other: items.filter((i) => i.category === "other").length,
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-6 sm:mb-8">
      {achievementCategories.map((cat) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        const count = counts[cat.id];

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs sm:text-sm font-medium transition",
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                : "glass border-white/12 text-muted-foreground hover:text-foreground hover:border-white/20",
            )}
          >
            <Icon className="size-3.5 sm:size-4 shrink-0" />
            <span>{cat.label}</span>
            <span
              className={cn(
                "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                isActive
                  ? "bg-white/20 text-primary-foreground"
                  : "bg-white/10 text-muted-foreground",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

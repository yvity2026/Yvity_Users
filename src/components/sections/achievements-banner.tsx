"use client";

import { Clock, Globe, Trophy } from "lucide-react";
import { achievementsBannerStats, achievementsPageCopy } from "@/lib/sections/achievements-config";
import { cn } from "@/lib/utils";

export function AchievementsBanner({
  totalAwards,
  mdrtLabel,
  experienceDisplay,
  className,
}: {
  totalAwards: number;
  mdrtLabel?: string;
  experienceDisplay?: string;
  className?: string;
}) {
  const experienceValue = experienceDisplay?.trim() || achievementsBannerStats.experienceValue;

  const stats = [
    {
      icon: Trophy,
      value: totalAwards > 0 ? String(totalAwards) : "—",
      label: "Total Awards",
    },
    {
      icon: Globe,
      value: mdrtLabel ?? achievementsBannerStats.mdrtLabel,
      label: achievementsBannerStats.mdrtSub,
    },
    {
      icon: Clock,
      value: experienceValue || "—",
      label: achievementsBannerStats.experienceLabel,
    },
  ] as const;

  return (
    <section
      className={cn(
        "yvity-on-dark relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12",
        "bg-gradient-to-br from-primary via-brand-soft to-[oklch(0.38_0.09_185)]",
        "shadow-xl shadow-black/30",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,oklch(0.82_0.16_162/0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,oklch(0.82_0.13_205/0.15),transparent_50%)]" />

      <div className="relative flex flex-col gap-6 p-5 sm:p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.82_0.13_205)]">
            {achievementsPageCopy.label}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {achievementsPageCopy.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-foreground/80 leading-relaxed">
            {achievementsPageCopy.description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:max-w-[min(100%,22rem)] lg:shrink-0">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-sm px-2 py-3.5 sm:py-4 text-center min-h-[88px]"
              >
                <Icon className="size-4 sm:size-5 text-[oklch(0.82_0.13_205)] mb-2" />
                <p className="text-sm sm:text-lg font-bold tracking-tight text-foreground leading-none">
                  {stat.value}
                </p>
                <p className="mt-1 text-[9px] sm:text-[10px] text-foreground/70 leading-tight">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

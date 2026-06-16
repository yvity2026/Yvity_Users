"use client";

import { Award, Building2, Clock } from "lucide-react";
import { SectionBannerAdvisorIdentity } from "@/components/sections/section-banner-advisor-identity";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { cn } from "@/lib/utils";

const statIcons = [Clock, Award, Building2] as const;

const PLACEHOLDER_STATS = [
  { value: "—", label: "Years experience" },
  { value: "—", label: "Rating" },
  { value: "—", label: "Organisations" },
] as const;

export function SectionProfileBanner({ className }: { className?: string }) {
  const display = useAdvisorDisplayProfile();
  const stats = display.stats.length > 0 ? display.stats : PLACEHOLDER_STATS;

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
        <SectionBannerAdvisorIdentity className="lg:shrink-0" />
        <div className="min-w-0 flex-1 text-center lg:text-left">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.82_0.13_205)]">
            {display.journeyLabel}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {display.journeyHeadline}
          </h2>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-foreground/80 leading-relaxed">
            {display.journeyDescription}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:max-w-[min(100%,28rem)] lg:shrink-0">
          {stats.map((stat, i) => {
            const Icon = statIcons[i] ?? Clock;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-sm px-2 py-3.5 sm:py-4 text-center min-w-0"
              >
                <Icon className="size-4 sm:size-5 text-[oklch(0.82_0.13_205)] mb-2 shrink-0" />
                <p className="w-full text-sm sm:text-base font-bold tracking-tight text-foreground truncate px-1">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs text-foreground/70 leading-tight">
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

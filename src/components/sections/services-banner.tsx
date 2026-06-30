"use client";

import { Briefcase, Clock, Users } from "lucide-react";
import { SectionBannerAdvisorIdentity } from "@/components/sections/section-banner-advisor-identity";
import { servicesPageCopy } from "@/lib/sections/services-config";
import { computeYearsSinceStartDate } from "@/lib/sections/service-experience";
import type { ServiceItem } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

function buildServicesBannerStats(items: ServiceItem[]) {
  // Max experience across all services (longest-serving one wins)
  let maxYears: number | null = null;
  for (const item of items) {
    const years = computeYearsSinceStartDate(item.serviceStartDate);
    if (years !== null && (maxYears === null || years > maxYears)) {
      maxYears = years;
    }
  }
  // Fall back to legacy experience string if no start dates
  if (maxYears === null) {
    for (const item of items) {
      const match = /(\d+)\+?\s*[Yy]ear/.exec(item.experience ?? "");
      if (match) {
        const n = Number(match[1]);
        if (maxYears === null || n > maxYears) maxYears = n;
      }
    }
  }

  const experienceValue = maxYears !== null ? `${maxYears}+` : "—";
  const experienceLabel = maxYears === 1 ? "Year experience" : "Years experience";

  const serviceCount = items.length;
  const totalClients = items.reduce((sum, i) => sum + (i.clients ?? 0), 0);

  return [
    { icon: Clock, value: experienceValue, label: experienceLabel },
    { icon: Briefcase, value: serviceCount > 0 ? String(serviceCount) : "—", label: serviceCount === 1 ? "Service" : "Services" },
    { icon: Users, value: totalClients > 0 ? `${totalClients}+` : "—", label: "Clients served" },
  ];
}

export function ServicesBanner({ items, className }: { items: ServiceItem[]; className?: string }) {
  if (items.length === 0) return null;
  const stats = buildServicesBannerStats(items);

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
            {servicesPageCopy.label}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {servicesPageCopy.title}
          </h2>
          <p className="mt-3 max-w-lg text-sm sm:text-base text-foreground/80 leading-relaxed">
            {servicesPageCopy.description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:max-w-[min(100%,22rem)] lg:shrink-0">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-sm px-2 py-3.5 sm:py-4 text-center min-h-[88px]"
            >
              <stat.icon className="size-4 sm:size-5 text-[oklch(0.82_0.13_205)] mb-2" />
              <p className="text-sm sm:text-lg font-bold tracking-tight text-foreground leading-none">
                {stat.value}
              </p>
              <p className="mt-1 text-[9px] sm:text-[10px] text-foreground/70 leading-tight">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

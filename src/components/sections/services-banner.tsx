"use client";

import type { ServiceCategory, ServiceItem } from "@/lib/sections/types";
import { categoryHeadingFor, serviceAccents, servicesPageCopy } from "@/lib/sections/services-config";
import { cn } from "@/lib/utils";

const PLACEHOLDER_SLOTS: { category: ServiceCategory; provider: string }[] = [
  { category: "life", provider: "Life insurance" },
  { category: "health", provider: "Health insurance" },
  { category: "general", provider: "General insurance" },
  { category: "mutual", provider: "Mutual funds" },
];

export function ServicesBanner({ items, className }: { items: ServiceItem[]; className?: string }) {
  const slots =
    items.length > 0
      ? items.map((item) => ({ key: item.id, item }))
      : PLACEHOLDER_SLOTS.map((slot) => ({
          key: slot.category,
          item: {
            id: slot.category,
            category: slot.category,
            title: "—",
            provider: slot.provider,
          } as ServiceItem,
        }));

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

      <div className="relative flex flex-col gap-6 p-5 sm:p-6 md:p-8 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="min-w-0 flex-1 lg:flex lg:flex-col lg:justify-center">
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

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:max-w-[min(100%,32rem)] lg:shrink-0 lg:self-center">
          {slots.map(({ key, item }) => {
            const accent = serviceAccents[item.category];
            const Icon = accent.icon;
            return (
              <div
                key={key}
                className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-white/12 bg-white/[0.06] backdrop-blur-sm px-3 py-4 text-center min-h-[100px]"
              >
                <span
                  className={cn(
                    "inline-flex size-9 sm:size-10 items-center justify-center rounded-xl glass mb-2.5",
                    accent.ring,
                  )}
                >
                  <Icon className={cn("size-4 sm:size-[1.125rem]", accent.text)} />
                </span>
                <p className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                  {categoryHeadingFor(item.category)}
                </p>
                <p className="mt-1 text-[10px] sm:text-xs text-[oklch(0.82_0.13_205)] leading-tight">
                  {item.provider}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

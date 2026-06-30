"use client";

import { Headphones, MessageSquare, Star, Video } from "lucide-react";
import { SectionBannerAdvisorIdentity } from "@/components/sections/section-banner-advisor-identity";
import { testimonialsPageCopy } from "@/lib/sections/testimonials-config";
import { averageTestimonialRating } from "@/lib/sections/normalize-testimonials";
import type { TestimonialItem } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export function TestimonialsBanner({
  items,
  className,
}: {
  items: TestimonialItem[];
  className?: string;
}) {
  const textCount = items.filter((i) => i.type === "text").length;
  const audioCount = items.filter((i) => i.type === "audio").length;
  const videoCount = items.filter((i) => i.type === "video").length;
  const avgRating = averageTestimonialRating(items);
  const hasAny = items.length > 0;

  const stats = [
    { icon: MessageSquare, value: String(textCount), label: "Text Reviews" },
    { icon: Headphones, value: String(audioCount), label: "Audio Reviews" },
    { icon: Video, value: String(videoCount), label: "Video Reviews" },
    { icon: Star, value: avgRating === "—" ? avgRating : `${avgRating}/5`, label: "Avg Rating" },
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

      <div className="relative flex flex-col gap-6 p-5 sm:p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <SectionBannerAdvisorIdentity className="lg:shrink-0" />
        <div className="min-w-0 flex-1 text-center lg:text-left">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[oklch(0.82_0.13_205)]">
            {testimonialsPageCopy.label}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {testimonialsPageCopy.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm sm:text-base text-foreground/80 leading-relaxed">
            {testimonialsPageCopy.description}
          </p>
        </div>

        {hasAny && <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4 lg:max-w-[min(100%,28rem)] lg:shrink-0">
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
        </div>}
      </div>
    </section>
  );
}

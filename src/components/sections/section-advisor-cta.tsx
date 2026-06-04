"use client";

import { BadgeCheck, Calendar, Phone, Shield } from "lucide-react";
import { AdvisorCtaButtons } from "@/components/contact/advisor-cta-buttons";
import { StarRating } from "@/components/ui/star-rating";
import { advisorProfile } from "@/lib/advisor-profile";
import { VERIFIED_BY_YVITY_LABEL } from "@/lib/verification/copy";
import { cn } from "@/lib/utils";

function AdvisorAvatar() {
  const initials = advisorProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "flex size-20 sm:size-24 md:size-28 items-center justify-center rounded-full",
          "bg-gradient-to-br from-primary to-accent text-xl sm:text-2xl font-bold text-primary-foreground",
          "ring-[3px] ring-[oklch(0.82_0.16_78/0.55)] shadow-lg shadow-primary/40",
        )}
      >
        {initials}
      </div>
      <span
        className={cn(
          "absolute bottom-0 right-0 translate-x-[15%] translate-y-[15%]",
          "inline-flex size-7 sm:size-8 items-center justify-center rounded-full",
          // Dark teal foreground gives the badge AA contrast on gold in
          // every theme — `text-primary` resolved to the same teal token
          // but was easy to break when the primary token changes.
          "bg-[oklch(0.82_0.16_78)] text-[oklch(0.18_0.035_235)] shadow-md",
          "ring-[3px] ring-[oklch(0.18_0.035_235)]",
        )}
        aria-hidden
      >
        <BadgeCheck className="size-4 sm:size-[1.125rem]" />
      </span>
    </div>
  );
}

export function SectionAdvisorCta({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "yvity-on-dark relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12",
        "bg-gradient-to-br from-primary via-[oklch(0.28_0.055_232)] to-brand-soft",
        "shadow-xl shadow-black/35",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_50%,oklch(0.82_0.13_205/0.18),transparent_60%)]" />

      <div className="relative flex flex-col lg:flex-row lg:min-h-[280px]">
        {/* Avatar — left, vertically centered */}
        <div className="flex items-center justify-center px-5 pt-6 pb-2 sm:px-6 lg:px-8 lg:py-8 lg:border-r lg:border-white/10 lg:shrink-0">
          <AdvisorAvatar />
        </div>

        {/* Main copy */}
        <div className="flex flex-1 flex-col justify-center px-5 pb-4 sm:px-6 md:px-8 lg:py-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.82_0.16_78/0.45)] bg-[oklch(0.82_0.16_78/0.12)] px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-[oklch(0.88_0.14_78)]">
              <BadgeCheck className="size-3.5" /> {VERIFIED_BY_YVITY_LABEL}
            </span>
            {advisorProfile.rating != null ? (
              <StarRating
                value={advisorProfile.rating}
                size="sm"
                showValue
                className="text-xs text-foreground/90"
              />
            ) : null}
          </div>

          <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {advisorProfile.name}
          </h2>
          <p className="mt-1 text-sm sm:text-base font-medium text-[oklch(0.82_0.13_205)]">
            {advisorProfile.title}
          </p>
          <p className="mt-3 text-sm text-foreground/75 leading-relaxed max-w-xl">
            {advisorProfile.ctaDescription}
          </p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {[
              { icon: Shield, label: advisorProfile.highlights[0].label },
              { icon: Calendar, label: advisorProfile.highlights[1].label },
              { icon: Phone, label: advisorProfile.highlights[2].label },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-[11px] sm:text-xs text-foreground/90"
              >
                <Icon className="size-3.5 text-[oklch(0.82_0.13_205)]" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions + clients — right panel, content vertically & horizontally centered */}
        <div className="flex flex-col justify-center items-center gap-4 border-t border-white/10 px-5 py-5 sm:px-6 md:px-8 lg:w-[min(100%,300px)] lg:border-t-0 lg:border-l lg:shrink-0 lg:py-8">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-none">
              {advisorProfile.clientsCount}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-foreground/70">Satisfied Clients</p>
          </div>

          <AdvisorCtaButtons className="max-w-[260px]" />

          <p className="w-full max-w-[260px] text-center text-[10px] sm:text-xs text-foreground/50">
            No pressure · 100% confidential
          </p>
        </div>
      </div>
    </section>
  );
}

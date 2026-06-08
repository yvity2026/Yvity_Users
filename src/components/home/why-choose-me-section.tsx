"use client";

import type { WhyChooseMeStrength } from "@/lib/home/why-choose-me-strengths";
import { getWhyChooseMeStrengths } from "@/lib/home/why-choose-me-strengths";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { useAchievementsData, useServicesData } from "@/lib/sections/stores";
import { cn } from "@/lib/utils";

/**
 * Single "Why Choose Me" point — rendered as a clean text row, not a
 * card. No glass background, no border-radius, no hover lift; just the
 * coloured icon chip beside the strength label, with a hairline divider
 * separating consecutive items.
 *
 * The icon chip (gradient + ring) is preserved exactly as before so the
 * brand palette still shows through.
 */
function StrengthRow({ strength, index }: { strength: WhyChooseMeStrength; index: number }) {
  const Icon = strength.icon;

  return (
    <li
      className={cn(
        // Hairline divider beneath every row, removed for the very last
        // item on mobile and the bottom two items in the 2-column desktop
        // layout so the list never ends with a trailing rule.
        "border-b border-white/8",
        "last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0",
        "py-3 sm:py-3.5",
        "animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both motion-reduce:animate-none",
      )}
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      <div className="flex items-center gap-3 sm:gap-3.5">
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
            "bg-gradient-to-br text-white shadow-md ring-1",
            strength.accent,
            strength.ring,
          )}
        >
          <Icon className="size-[1.125rem]" strokeWidth={2.25} aria-hidden />
        </span>
        <p className="min-w-0 text-sm sm:text-[0.9375rem] font-semibold leading-snug tracking-tight text-foreground">
          {strength.label}
        </p>
      </div>
    </li>
  );
}

export function WhyChooseMeSection() {
  const [achievements] = useAchievementsData();
  const [services] = useServicesData();
  const advisorProfile = useAdvisorDisplayProfile();
  const strengths = getWhyChooseMeStrengths(achievements, {
    experienceDisplay: advisorProfile.experienceDisplay,
    serviceCount: services.length,
  });

  return (
    <section className="w-full" aria-labelledby="why-choose-me-heading">
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Why trust me
      </p>
      <h2
        id="why-choose-me-heading"
        className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.08]"
      >
        <span className="text-gradient-brand">Why Choose Me</span>
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
        Licensed expertise, hands-on support, and guidance built around your goals — not generic
        sales pitches.
      </p>

      {/* Plain text list — one column on phones, two on `sm+`.
          Items are separated by hairline rules, no card chrome. */}
      <ul className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
        {strengths.map((strength, i) => (
          <StrengthRow key={strength.id} strength={strength} index={i} />
        ))}
      </ul>
    </section>
  );
}

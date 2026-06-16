"use client";

import type { WhyChooseMeStrength } from "@/lib/home/why-choose-me-strengths";
import {
  buildWhyChooseMeIntro,
  getWhyChooseMeStrengths,
} from "@/lib/home/why-choose-me-strengths";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { usePublicProfileStats } from "@/hooks/use-public-profile-stats";
import { useResolvedPublicAdvisorPayload } from "@/hooks/use-resolved-public-advisor-payload";
import { useAuth } from "@/context/AuthUserContext";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { resolveCareerExperienceDisplay } from "@/lib/advisor/profession-experience";
import { useCareerData } from "@/lib/career-store";
import {
  useAchievementsData,
  useServicesData,
  useTestimonialsData,
} from "@/lib/sections/stores";
import { cn } from "@/lib/utils";

const FALLBACK_STRENGTHS = [
  "Licensed and IRDA-certified insurance advisor",
  "Personalised cover recommendations for your life stage",
  "End-to-end support — from policy selection to claims",
  "Transparent, no-pressure guidance",
];

function StrengthRow({ strength, index }: { strength: WhyChooseMeStrength; index: number }) {
  const Icon = strength.icon;

  return (
    <li
      className={cn(
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
  const [testimonials] = useTestimonialsData();
  const [career] = useCareerData();
  const advisorProfile = useAdvisorDisplayProfile();
  const { user, advisor } = useAuth();
  const publicAdvisor = useResolvedPublicAdvisorPayload();
  const { recommendationCount } = usePublicProfileStats();

  const profileApproved = publicAdvisor
    ? isAdvisorProfileApproved(publicAdvisor.profile)
    : isAdvisorProfileApproved(advisor);

  const city = publicAdvisor?.city?.trim() || user?.city?.trim() || "";
  const state = publicAdvisor?.state?.trim() || user?.state?.trim() || "";
  const profession =
    publicAdvisor?.profession?.trim() || user?.profession?.trim() || advisorProfile.title;
  const about = advisorProfile.home.heroBio || advisorProfile.ctaDescription;

  const journeyExperienceDisplay = resolveCareerExperienceDisplay(career);

  const strengths = getWhyChooseMeStrengths({
    achievements,
    services,
    career,
    profileApproved,
    experienceDisplay: advisorProfile.experienceDisplay,
    journeyExperienceDisplay,
    avgRating: advisorProfile.rating,
    testimonialCount: testimonials.length,
    recommendationCount,
    city,
    state,
    profession,
    about,
    companyName: advisorProfile.companyName,
  });

  const intro = buildWhyChooseMeIntro({
    about,
    profession,
    city,
    state,
    experienceDisplay: advisorProfile.experienceDisplay,
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
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">{intro}</p>

      {strengths.length > 0 ? (
        <ul className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
          {strengths.map((strength, i) => (
            <StrengthRow key={strength.id} strength={strength} index={i} />
          ))}
        </ul>
      ) : (
        <ul className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
          {FALLBACK_STRENGTHS.map((label, i) => (
            <li
              key={label}
              className="border-b border-white/8 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 py-3 sm:py-3.5"
            >
              <div className="flex items-center gap-3 sm:gap-3.5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 shadow-md ring-1 ring-white/10">
                  <svg className="size-[1.125rem] text-[oklch(0.82_0.13_205)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="min-w-0 text-sm sm:text-[0.9375rem] font-semibold leading-snug tracking-tight text-foreground opacity-75">
                  {label}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

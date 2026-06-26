"use client";

import { BadgeCheck, Calendar, Phone, Shield } from "lucide-react";
import { AdvisorIdentityAvatar } from "@/components/advisor/advisor-identity-avatar";
import { AdvisorCtaButtons } from "@/components/contact/advisor-cta-buttons";
import { StarRating } from "@/components/ui/star-rating";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { ADVISOR_PROFILE_LABELS } from "@/lib/advisor-display-profile";

function buildCtaFallback(profile: {
  experienceDisplay: string;
  title: string;
  companyName: string;
}): string {
  const exp = profile.experienceDisplay?.trim();
  const role = profile.title?.trim() || "insurance advisor";
  const company = profile.companyName?.trim();

  if (exp && company) {
    return `With ${exp} of experience as a ${role} at ${company}, I provide honest, personalised guidance to help you find the right cover for your life, health and financial goals. Connect with me to get started.`;
  }
  if (exp) {
    return `With ${exp} of experience as a ${role}, I provide honest, personalised guidance to help you find the right cover for your life, health and financial goals. Connect with me to get started.`;
  }
  return `As a licensed ${role}, I provide honest, personalised guidance tailored to your life stage and goals. Connect with me to get started.`;
}
import {
  useAdvisorProfilePhoto,
  useShowAdvisorVerifiedBadge,
} from "@/hooks/use-advisor-profile-photo";
import { VERIFIED_BY_YVITY_LABEL } from "@/lib/verification/copy";
import { cn } from "@/lib/utils";

const HIGHLIGHT_ICONS = [Shield, Calendar, Phone] as const;

export function SectionAdvisorCta({ className }: { className?: string }) {
  const advisorProfile = useAdvisorDisplayProfile();
  const profilePhoto = useAdvisorProfilePhoto();
  const showVerifiedBadge = useShowAdvisorVerifiedBadge();
  const highlightItems = HIGHLIGHT_ICONS.map((icon, index) => ({
    icon,
    label: advisorProfile.highlights[index]?.label ?? "",
  }))
    // Avoid duplicating the top \"Verified by YVITY\" pill in the CTA body.
    .filter(
      (item) =>
        item.label.trim().length > 0 && item.label.trim() !== VERIFIED_BY_YVITY_LABEL,
    );

  return (
    <section
      className={cn(
        "yvity-on-dark relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/12",
        "bg-gradient-to-br from-primary via-[oklch(0.28_0.055_232)] to-brand-soft",
        "shadow-xl shadow-black/35",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_50%,oklch(0.82_0.13_205/0.18),transparent_60%)]" />

      <div className="relative flex flex-col lg:flex-row lg:min-h-[280px]">
        <div className="flex items-center justify-center px-5 pt-6 pb-2 sm:px-6 lg:px-8 lg:py-8 lg:border-r lg:border-white/10 lg:shrink-0">
          <AdvisorIdentityAvatar
            name={advisorProfile.name}
            photoUrl={profilePhoto}
            showVerifiedBadge={showVerifiedBadge}
            variant="cta"
          />
        </div>

        <div className="flex flex-1 flex-col justify-center px-5 pb-4 sm:px-6 md:px-8 lg:py-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {showVerifiedBadge ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.82_0.16_78/0.45)] bg-[oklch(0.82_0.16_78/0.12)] px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-[oklch(0.88_0.14_78)]">
                <BadgeCheck className="size-3.5" /> {VERIFIED_BY_YVITY_LABEL}
              </span>
            ) : null}
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
            {advisorProfile.ctaDescription &&
            advisorProfile.ctaDescription !== ADVISOR_PROFILE_LABELS.ctaDescription
              ? advisorProfile.ctaDescription
              : buildCtaFallback({
                  experienceDisplay: advisorProfile.experienceDisplay,
                  title: advisorProfile.title,
                  companyName: advisorProfile.companyName,
                })}
          </p>

          {highlightItems.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {highlightItems.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1.5 text-[11px] sm:text-xs text-foreground/90"
                >
                  <Icon className="size-3.5 text-[oklch(0.82_0.13_205)]" />
                  {label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col justify-center items-center gap-4 border-t border-white/10 px-5 py-5 sm:px-6 md:px-8 lg:w-[min(100%,300px)] lg:border-t-0 lg:border-l lg:shrink-0 lg:py-8">
          {advisorProfile.profileHeroStat.value !== "—" ? (
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-none">
                {advisorProfile.profileHeroStat.value}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-foreground/70">
                {advisorProfile.profileHeroStat.ctaLabel}
              </p>
            </div>
          ) : null}

          <AdvisorCtaButtons className="max-w-[260px]" />

          <p className="w-full max-w-[260px] text-center text-[10px] sm:text-xs text-foreground/50">
            No advisory fee · 100% confidential
          </p>
        </div>
      </div>
    </section>
  );
}

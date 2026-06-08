"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  MapPin,
  Phone,
  PhoneIncoming,
  Share2,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { ContactTrigger } from "@/components/contact/contact-trigger";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { useIsAdvisorWorkspacePreview } from "@/hooks/use-is-viewing-own-advisor-profile";
import { useShareProfileLink } from "@/hooks/use-share-profile-link";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { buildHomeServiceChips } from "@/lib/home/home-service-chips";
import { serviceAccents } from "@/lib/sections/services-config";
import { VERIFIED_BY_YVITY_LABEL } from "@/lib/verification/copy";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useAchievementsData, useServicesData } from "@/lib/sections/stores";
import { formatMdrtMemberLabel } from "@/lib/sections/achievement-tiers";
import { useAuth } from "@/context/AuthUserContext";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";
import { YvityVerificationSeal } from "@/components/brand/yvity-verification-seal";
import { CommunityTrustSection } from "@/components/home/community-trust-section";
import { HomeQuickActionsSection } from "@/components/home/home-quick-actions-section";
import { LatestHighlightsSection } from "@/components/home/latest-highlights-section";
import { SectionAdvisorCta } from "@/components/sections/section-advisor-cta";
import { WhyChooseMeSection } from "@/components/home/why-choose-me-section";
import { IntroVideoHeroBlock } from "@/components/intro-video/intro-video-hero-block";
import { HomeTrustSection } from "@/components/home/home-trust-section";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

function splitDisplayName(fullName: string): { leading: string; accent: string } {
  const parts = fullName.trim().split(/\s+/);
  // Single-word names (e.g. "Madonna") still deserve the gradient
  // accent — otherwise the hero loses its signature flourish.
  if (parts.length <= 1) return { leading: "", accent: fullName };
  const accent = parts.pop()!;
  return { leading: parts.join(" "), accent };
}

function HomeAdvisorPhoto({ className }: { className?: string }) {
  const { user } = useAuth();
  const advisorProfile = useAdvisorDisplayProfile();
  const initials = advisorProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const photoUrl =
    resolveProfilePhotoUrl(advisorProfile.photoUrl) ||
    resolveProfilePhotoUrl(user?.selfie_url) ||
    "";
  const photoSize = "size-28 sm:size-32 md:size-36 lg:size-[8.5rem]";

  return (
    <div className={cn("relative shrink-0 mx-auto lg:mx-0", className)}>
      <div
        className="pointer-events-none absolute inset-0 -m-3 sm:-m-3.5 rounded-full opacity-90"
        style={{
          background:
            "radial-gradient(circle at 42% 38%, oklch(0.82 0.13 205 / 0.28) 0%, oklch(0.85 0.16 78 / 0.18) 38%, transparent 68%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -m-1.5 rounded-full bg-[oklch(0.85_0.16_78/0.12)] blur-2xl"
        aria-hidden
      />

      <div
        className={cn(
          "relative inline-flex rounded-full p-[3px]",
          "bg-gradient-to-br from-[oklch(0.88_0.16_78)] via-[oklch(0.86_0.15_78)] to-[oklch(0.82_0.13_205/0.65)]",
          "shadow-[0_0_36px_-8px_oklch(0.85_0.16_78/0.55),0_14px_32px_-14px_oklch(0_0_0/0.55)]",
        )}
      >
        <div
          className={cn(
            "rounded-full p-[2.5px]",
            "bg-gradient-to-br from-[oklch(0.82_0.13_205)] via-[oklch(0.78_0.12_200)] to-[oklch(0.72_0.11_198)]",
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-full",
              photoSize,
              "shadow-[inset_0_1px_2px_oklch(0_0_0/0.35)]",
              "ring-1 ring-black/15",
              !photoUrl && "bg-gradient-to-br from-primary to-accent",
            )}
          >
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={advisorProfile.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 144px, 136px"
                priority
                unoptimized={photoUrl.startsWith("/api/")}
              />
            ) : (
              <span className="flex size-full items-center justify-center text-3xl sm:text-4xl font-bold text-primary-foreground">
                {initials}
              </span>
            )}
          </div>
        </div>
      </div>

      <YvityVerificationSeal className="absolute bottom-0 right-0 z-10 translate-x-0.5 translate-y-0.5 sm:translate-x-1 sm:translate-y-1" />
    </div>
  );
}

function ProfileHeaderBanner() {
  const advisorProfile = useAdvisorDisplayProfile();
  const publicView = usePublicProfileView();
  const { home } = advisorProfile;
  const { settings } = useAdvisorSettings();
  const isWorkspacePreview = useIsAdvisorWorkspacePreview();
  const [achievements] = useAchievementsData();
  const { advisor } = useAuth();
  const { share, copied: shareDone, canShare } = useShareProfileLink({
    advisorUserId: publicView?.userId,
    profileSlug: advisorProfile.slug,
    livePublicProfile: Boolean(publicView?.userId),
  });
  const { leading, accent } = splitDisplayName(advisorProfile.name);
  const mdrtLabel = formatMdrtMemberLabel(achievements);
  const showIrdaiBadge = publicView
    ? isAdvisorProfileApproved(publicView.profile)
    : isAdvisorProfileApproved(advisor);
  const telHref = `tel:${advisorProfile.phone.replace(/\s/g, "")}`;

  const showCall = settings.contact.callButton;
  const showCallback =
    !isWorkspacePreview &&
    settings.contact.contactForm &&
    settings.leads.acceptNewLeads &&
    settings.leads.publicProfileEnquiries;
  const showShare = canShare && settings.publicProfile.shareProfile;

  const headerBtn =
    "h-11 sm:h-12 w-full rounded-full text-sm font-semibold gap-2 shadow-md transition active:scale-[0.98]";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl sm:rounded-3xl",
        "glass-strong border border-white/10",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        aria-hidden
      />

      <div className="relative p-4 sm:p-5 md:p-6 lg:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6 xl:gap-8">
          <HomeAdvisorPhoto className="lg:shrink-0" />

          <div className="min-w-0 flex-1 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.85_0.16_78/0.45)] bg-[oklch(0.85_0.16_78/0.1)] px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[oklch(0.92_0.14_78)]">
                <BadgeCheck className="size-3.5" />
                {VERIFIED_BY_YVITY_LABEL}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.16_78)]">
                <Star className="size-3 fill-current" />
                {mdrtLabel}
              </span>
              {advisorProfile.rating != null ? (
                <StarRating
                  value={advisorProfile.rating}
                  size="md"
                  showValue
                  className="text-xs sm:text-sm text-muted-foreground"
                />
              ) : null}
            </div>

            {/* Hero name. Uses the same sans-serif stack as every other
                heading on the site (no `font-serif`) and the canonical
                `text-gradient-brand` treatment for the accent word —
                matching "How Can I Help?", "Latest Highlights",
                "Professional Journey", etc. */}
            <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-[2.15rem] lg:text-[2.35rem] font-bold tracking-tight leading-[1.12]">
              {leading && <span className="text-foreground">{leading} </span>}
              {accent && <span className="text-gradient-brand">{accent}</span>}
            </h1>

            <p className="mt-1 text-sm sm:text-base font-medium text-[oklch(0.85_0.16_78)]">
              {advisorProfile.title}
            </p>

            <p className="mt-3 text-sm sm:text-[0.9375rem] text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {home.heroBio}
            </p>

            <IntroVideoHeroBlock className="max-w-xl mx-auto lg:mx-0" />

            <ul className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <FactPill icon={MapPin} label={advisorProfile.location} />
              {showIrdaiBadge ? (
                <FactPill icon={Shield} label="IRDA Certified" />
              ) : null}
              {advisorProfile.experienceDisplay ? (
                <FactPill
                  icon={Clock}
                  label={`${advisorProfile.experienceDisplay} Experience`}
                />
              ) : null}
              {advisorProfile.profileHeroStat.value !== "—" ? (
                <FactPill
                  icon={Users}
                  label={`${advisorProfile.profileHeroStat.value} ${advisorProfile.profileHeroStat.label}`}
                />
              ) : null}
            </ul>
          </div>

          {(showCall || showCallback || showShare) && (
            <div className="flex flex-col gap-2.5 w-full lg:w-[min(100%,13.5rem)] shrink-0">
              {showCall && (
                <Button
                  asChild
                  className={cn(
                    headerBtn,
                    "bg-gradient-to-r from-[oklch(0.88_0.16_78)] to-[oklch(0.82_0.15_72)]",
                    // Dark teal text guarantees a 7:1+ contrast on gold;
                    // shadow uses the proper `<offset>` / `<blur>` syntax
                    // so the previously dropped shadow actually renders.
                    "text-[oklch(0.18_0.035_235)] hover:opacity-95",
                    "shadow-[0_10px_24px_-12px_oklch(0.85_0.16_78/0.55)]",
                  )}
                >
                  <a href={telHref}>
                    <Phone className="size-4 shrink-0" />
                    Call Now
                  </a>
                </Button>
              )}
              {showCallback && (
                <ContactTrigger
                  variant="outline"
                  className={cn(
                    headerBtn,
                    "border-white/20 bg-white/[0.04] text-foreground hover:bg-white/10",
                  )}
                >
                  <PhoneIncoming className="size-4 shrink-0 text-[oklch(0.82_0.13_205)]" />
                  Request Call Back
                </ContactTrigger>
              )}
              {showShare && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void share()}
                  className={cn(
                    headerBtn,
                    "border-white/20 bg-transparent text-foreground hover:bg-white/[0.06]",
                  )}
                >
                  <Share2 className="size-4 shrink-0" />
                  {shareDone ? "Link Copied!" : "Share Profile"}
                </Button>
              )}
            </div>
          )}
        </div>

        <HomeTrustSection />
      </div>
    </div>
  );
}

function FactPill({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <li>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] sm:text-xs text-muted-foreground">
        <Icon className="size-3.5 shrink-0 text-[oklch(0.82_0.13_205)]" />
        {label}
      </span>
    </li>
  );
}

function HeroServicesSection() {
  const advisorProfile = useAdvisorDisplayProfile();
  const { home } = advisorProfile;
  const [services, , loading] = useServicesData();
  const { advisor } = useAuth();
  const publicView = usePublicProfileView();
  const profileApproved = publicView
    ? isAdvisorProfileApproved(publicView.profile)
    : isAdvisorProfileApproved(advisor);

  const serviceChips = useMemo(
    () => buildHomeServiceChips(services, profileApproved),
    [services, profileApproved],
  );

  if (!loading && serviceChips.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Your advisor
      </p>
      <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.08]">
        <span className="text-gradient-brand">{home.headline}</span>
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
        Choose a service below — life, health, general insurance, and mutual funds, tailored to your
        goals.
      </p>

      {loading ? (
        <ul className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="h-[5.25rem] rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse"
            />
          ))}
        </ul>
      ) : (
        <ul className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {serviceChips.map((chip) => {
            const accent = serviceAccents[chip.category];
            const Icon = accent.icon;
            return (
              <li key={chip.id}>
                <Link
                  href={chip.href}
                  className={cn(
                    "group relative flex h-full items-center gap-3 sm:gap-4 overflow-hidden rounded-2xl border p-3.5 sm:p-4",
                    "transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]",
                    accent.border,
                    accent.soft,
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100",
                      "bg-gradient-to-br",
                      accent.ratio,
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl glass",
                      accent.ring,
                    )}
                  >
                    <Icon className={cn("size-5 sm:size-6", accent.text)} />
                  </span>
                  <span className="relative min-w-0 flex-1 text-left">
                    <span className={cn("block text-sm sm:text-base font-semibold", accent.text)}>
                      {chip.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground group-hover:text-foreground/70 transition line-clamp-1">
                      {chip.subtitle}
                    </span>
                  </span>
                  <ArrowRight
                    className={cn(
                      "relative size-4 shrink-0 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100",
                      accent.text,
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ProfileHomeHero() {
  return (
    <section id="home" className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[6%] left-[8%] size-56 rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute bottom-[20%] right-[5%] size-48 rounded-full bg-[oklch(0.85_0.16_78/0.08)] blur-[90px]" />
      </div>

      <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-9">
          <ProfileHeaderBanner />
          <HeroServicesSection />
          <CommunityTrustSection />
          <HomeQuickActionsSection />
          <WhyChooseMeSection />
          <LatestHighlightsSection />
          <SectionAdvisorCta />
        </div>
      </div>
    </section>
  );
}

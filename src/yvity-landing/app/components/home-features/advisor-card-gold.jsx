"use client";

import { IdentityVerifiedTick } from "@/yvity-landing/components/brand/IdentityVerifiedTick";
import { YvityScoreInfoTip } from "@/yvity-landing/components/brand/YvityScoreInfoTip";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  HeartPulse,
  Shield,
  Star,
  Umbrella,
  Users,
  ThumbsUp,
  Trophy,
  User,
  MapPin,
} from "lucide-react";
import { usePrefersReducedMotion } from "@/yvity-landing/hooks/usePrefersReducedMotion";
import { formatAverageRating, formatExperienceDisplay } from "@/yvity-landing/lib/advisor/publicMetrics";
import { AdvisorScoreAvatarRing } from "./advisor-score-avatar-ring";

const SERVICE_ICONS = {
  "Life Insurance": Shield,
  "Health Insurance": HeartPulse,
  "General Insurance": Umbrella,
};

const SERVICE_PILLS = [
  "Life Insurance",
  "Health Insurance",
  "General Insurance",
];

function resolveServicePills(serviceTypes = []) {
  const fromAdvisor = (serviceTypes ?? []).filter(Boolean).slice(0, 3);
  if (fromAdvisor.length) return fromAdvisor;
  return SERVICE_PILLS.slice(0, 3);
}

function ServicePill({ label, compact = false }) {
  const Icon = SERVICE_ICONS[label] ?? Shield;
  const short =
    label === "Life Insurance"
      ? "Life"
      : label === "Health Insurance"
        ? "Health"
        : label === "General Insurance"
          ? "General"
          : label.split(" ")[0];

  const labelText = compact
    ? short
    : label === "General Insurance"
      ? "General"
      : `${short} Insurance`;

  return (
    <span
      className={
        compact
          ? "advisor-card-gold-glass-pill inline-flex items-center gap-1 px-2 py-1 font-poppins text-[10px] font-bold leading-tight text-[#0A4A4A]"
          : "advisor-card-gold-glass-pill flex w-full items-center justify-center gap-1 px-1 py-1.5 font-poppins text-[11px] font-bold leading-tight tracking-[0.01em] text-[#0A4A4A] md:gap-1.5 md:px-2 md:py-1.5 md:text-[10px]"
      }
    >
      <Icon
        className={`shrink-0 text-[#0D6060] ${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`}
        strokeWidth={2}
      />
      <span className="text-center leading-tight">{labelText}</span>
    </span>
  );
}

function AchievementBadge({ label, compact = false }) {
  const shortLabel = label.startsWith("MDRT") ? "MDRT" : label;

  return (
    <span
      className={
        compact
          ? "advisor-card-gold-glass-pill inline-flex items-center gap-1 bg-[#FFF9E8] px-2 py-1 font-poppins text-[10px] font-bold leading-tight text-[#0A4A4A] ring-1 ring-[#F59E0B]/25"
          : "advisor-card-gold-glass-pill inline-flex w-full items-center justify-center gap-1.5 px-2 py-1.5 font-poppins text-[11px] font-bold leading-tight text-[#0A4A4A] md:text-[10px]"
      }
    >
      <Trophy className="h-3.5 w-3.5 shrink-0 text-[#F59E0B]" strokeWidth={2} />
      <span>{shortLabel}</span>
    </span>
  );
}

function StatCell({ icon: Icon, value, label, divider = "none" }) {
  const dividerClass =
    divider === "always"
      ? "border-l border-[#0A4A4A]/10 pl-2.5 md:pl-1.5"
      : divider === "desktop"
        ? "md:border-l md:border-[#0A4A4A]/10 md:pl-1.5"
        : "";

  return (
    <div
      className={`flex items-center gap-2 md:flex-col md:gap-1 md:py-1 md:text-center ${dividerClass}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/55 text-[#0D6060] ring-1 ring-[#0A4A4A]/10 backdrop-blur-sm md:h-7 md:w-7">
        <Icon className="h-4 w-4 md:h-3.5 md:w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="font-poppins text-[12px] font-bold leading-none text-[#0A4A4A] md:text-[13px]">
          {value}
        </p>
        <p className="mt-0.5 font-poppins text-[10px] font-semibold uppercase tracking-wide text-[#4B5563] md:text-[10px] md:normal-case md:tracking-normal md:font-medium">
          {label}
        </p>
      </div>
    </div>
  );
}

function ViewProfileCta({ profileUrl, compact, reducedMotion }) {
  const ctaInner = (
    <>
      <span className="pointer-events-none absolute inset-0 rounded-[999px] bg-gradient-to-r from-[#F59E0B] via-[#FFAE26] to-[#D97706]" />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
      {!reducedMotion ? (
        <motion.span
          className="pointer-events-none absolute -left-full top-0 h-full w-1/2 skew-x-[-20deg] bg-white/25"
          animate={{ left: ["-100%", "200%"] }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: "easeInOut",
            repeatDelay: 1.2,
          }}
        />
      ) : null}
      <span
        className={`relative z-10 flex w-full items-center justify-center font-poppins font-bold tracking-wide text-white ${
          compact
            ? "gap-1.5 py-0 text-xs"
            : "gap-2.5 px-1 text-[14px] md:text-sm"
        }`}
      >
        {!compact ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/35">
            <User className="h-4 w-4 text-white" strokeWidth={2} />
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          View Profile
          <ArrowRight className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </span>
      </span>
    </>
  );

  const className = `relative flex w-full overflow-hidden rounded-full shadow-[0_8px_22px_rgba(217,119,6,0.35)] ${
    compact ? "py-2" : "py-2 sm:py-2.5"
  }`;

  const liveProfilePath =
    profileUrl && profileUrl !== "/profile" ? profileUrl : null;

  if (liveProfilePath) {
    return (
      <Link
        href={liveProfilePath}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {ctaInner}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {ctaInner}
    </button>
  );
}

function AdvisorCardGoldCompact({
  name,
  title,
  location,
  score,
  avgRating,
  profileUrl,
  avatarUrl,
  showIdentityVerified = false,
  serviceTypes = [],
  achievementTags = [],
}) {
  const reducedMotion = usePrefersReducedMotion();

  const initials = (name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const servicePills = resolveServicePills(serviceTypes);

  return (
    <motion.article
      className="mx-auto h-full w-full max-w-[290px]"
      {...(reducedMotion
        ? {}
        : {
            whileHover: {
              y: -4,
              boxShadow:
                "0 14px 36px rgba(10,74,74,0.12), 0 0 18px rgba(245,158,11,0.12)",
              transition: { duration: 0.35, ease: "easeOut" },
            },
          })}
    >
      <div className="advisor-card-gold-shell advisor-card-gold-shell--compact">
        <div className="advisor-card-gold-inner relative flex h-full flex-col overflow-hidden antialiased">
          <div className="advisor-card-gold-profile-header px-3 pb-3 pt-3">
            {!reducedMotion ? (
              <span className="gold-bottom-shine" aria-hidden>
                <span className="shine" />
              </span>
            ) : null}

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative shrink-0 overflow-visible p-[2px]">
                <div className="absolute -inset-0.5 rounded-full bg-[#F59E0B]/25 blur-sm" />
                <AdvisorScoreAvatarRing score={numericScore} onDarkHeader>
                  <div className="relative rounded-full bg-gradient-to-br from-[#F59E0B] via-[#E8C872] to-[#C5A059] p-[2px]">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0A4A4A] to-[#0D6060] font-cormorant text-lg font-bold text-[#F8F6F1]">
                        {initials}
                      </div>
                    )}
                    {showIdentityVerified ? (
                      <IdentityVerifiedTick size="sm" />
                    ) : null}
                  </div>
                </AdvisorScoreAvatarRing>
              </div>

              <h3 className="mt-2.5 font-cormorant text-lg font-bold leading-tight tracking-[0.02em] text-white">
                {name}
              </h3>
              <p className="mt-0.5 font-poppins text-[11px] font-semibold text-[#F59E0B]">
                {title}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1 font-poppins text-[11px] font-medium leading-snug text-white/90">
                <MapPin className="h-3 w-3 shrink-0 text-[#F59E0B]" />
                <span className="line-clamp-1">{location}</span>
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-2 px-3 pb-3">
            <div className="advisor-card-gold-glass-panel flex items-center justify-between gap-2 px-2.5 py-2">
              <div className="flex items-center gap-1">
                <Star
                  className="h-3.5 w-3.5 shrink-0 fill-[#F59E0B] text-[#F59E0B]"
                  aria-hidden
                />
                <span className="font-poppins text-xs font-bold text-[#0A4A4A]">
                  {formatAverageRating(avgRating)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-poppins text-[10px] font-bold uppercase tracking-[0.1em] text-[#0A4A4A]/70">
                  YVITY
                </span>
                <span className="font-poppins text-sm font-bold tabular-nums text-[#0A4A4A]">
                  {Math.round(numericScore)}
                </span>
                <YvityScoreInfoTip />
              </div>
            </div>

            {servicePills.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-1">
                {servicePills.map((tag) => (
                  <ServicePill key={tag} label={tag} compact />
                ))}
              </div>
            ) : null}

            {achievementTags.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-1">
                {achievementTags.slice(0, 2).map((tag) => (
                  <AchievementBadge key={tag} label={tag} compact />
                ))}
              </div>
            ) : null}

            <ViewProfileCta
              profileUrl={profileUrl}
              compact
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function AdvisorCardGold({
  name,
  title,
  location,
  score,
  exp,
  avgRating,
  clients,
  clientsLabel = "Clients",
  recs,
  profileUrl,
  avatarUrl,
  showIdentityVerified = false,
  serviceTypes = [],
  achievementTags = [],
  variant = "default",
}) {
  if (variant === "compact") {
    return (
      <AdvisorCardGoldCompact
        name={name}
        title={title}
        location={location}
        score={score}
        avgRating={avgRating}
        profileUrl={profileUrl}
        avatarUrl={avatarUrl}
        showIdentityVerified={showIdentityVerified}
        serviceTypes={serviceTypes}
        achievementTags={achievementTags}
      />
    );
  }

  const reducedMotion = usePrefersReducedMotion();

  const initials = (name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const servicePills = resolveServicePills(serviceTypes);

  const statItems = [
    { icon: Briefcase, value: formatExperienceDisplay(exp), label: "Experience", divider: "none" },
    { icon: Star, value: formatAverageRating(avgRating), label: "Avg. rating", divider: "always" },
    { icon: Users, value: clients, label: clientsLabel, divider: "desktop" },
    { icon: ThumbsUp, value: recs, label: "Recommends", divider: "always" },
  ];

  return (
    <motion.article
      className="mx-auto h-full w-full max-w-[380px]"
      {...(reducedMotion
        ? {}
        : {
            whileHover: {
              y: -6,
              boxShadow:
                "0 18px 44px rgba(10,74,74,0.12), 0 0 24px rgba(245,158,11,0.15)",
              transition: { duration: 0.4, ease: "easeOut" },
            },
          })}
    >
      <div className="advisor-card-gold-shell">
        <div className="advisor-card-gold-inner relative flex h-full flex-col overflow-hidden antialiased">
          <div className="advisor-card-gold-profile-header px-3.5 pb-3.5 pt-3.5 sm:px-4 sm:pb-4 sm:pt-4">
            {!reducedMotion ? (
              <span className="gold-bottom-shine" aria-hidden>
                <span className="shine" />
              </span>
            ) : null}
            <div className="relative z-10 flex items-start gap-3 md:gap-4">
              <div className="relative shrink-0 overflow-visible p-[3px]">
                <div className="absolute -inset-0.5 rounded-full bg-[#F59E0B]/30 blur-sm md:-inset-1 md:blur-md" />
                <AdvisorScoreAvatarRing
                  score={numericScore}
                  onDarkHeader
                >
                  <div className="relative rounded-full bg-gradient-to-br from-[#F59E0B] via-[#E8C872] to-[#C5A059] p-[2px] md:p-[3px]">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="h-[64px] w-[64px] rounded-full object-cover md:h-[92px] md:w-[92px]"
                      />
                    ) : (
                      <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-gradient-to-br from-[#0A4A4A] to-[#0D6060] font-cormorant text-xl font-bold text-[#F8F6F1] md:h-[92px] md:w-[92px] md:text-3xl">
                        {initials}
                      </div>
                    )}
                    {showIdentityVerified ? (
                      <IdentityVerifiedTick size="sm" />
                    ) : null}
                  </div>
                </AdvisorScoreAvatarRing>
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="font-cormorant text-[21px] font-bold leading-[1.12] tracking-[0.02em] text-white md:text-[22px]">
                  {name}
                </h3>
                <p className="mt-0.5 font-poppins text-[12px] font-semibold tracking-wide text-[#F59E0B] md:text-[12px]">
                  {title}
                </p>
                <p className="mt-1.5 flex items-start gap-1 font-poppins text-[12px] font-medium leading-snug text-white/90 md:text-[11px]">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
                  <span className="min-w-0 break-words md:line-clamp-2">{location}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-2.5 p-3.5 sm:gap-3 sm:p-4">
            {servicePills.length > 0 ? (
              <div className="flex flex-col gap-1">
                <div className="grid grid-cols-2 gap-1">
                  {servicePills.slice(0, 2).map((tag) => (
                    <ServicePill key={tag} label={tag} />
                  ))}
                </div>
                {servicePills.length > 2 ? (
                  <div className="mx-auto w-[calc(50%-2px)]">
                    <ServicePill label={servicePills[2]} />
                  </div>
                ) : null}
              </div>
            ) : null}

            {achievementTags.length > 0 ? (
              <div className="grid grid-cols-2 gap-1">
                {achievementTags.slice(0, 2).map((tag) => (
                  <AchievementBadge key={tag} label={tag} />
                ))}
              </div>
            ) : null}

            <div className="advisor-card-gold-glass-panel p-2.5 md:p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <p className="font-poppins text-[11px] font-bold uppercase tracking-[0.12em] text-[#0A4A4A] md:text-[10px] md:tracking-[0.14em]">
                    YVITY Score
                  </p>
                  <YvityScoreInfoTip />
                </div>
                <p className="font-poppins text-[22px] font-bold leading-none tabular-nums text-[#0A4A4A] md:text-[20px]">
                  {Math.round(numericScore)}
                  <span className="font-poppins text-[13px] font-medium text-[#9CA3AF] md:text-[12px]">
                    {" "}
                    /100
                  </span>
                </p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/45 ring-1 ring-[#0A4A4A]/8 backdrop-blur-sm">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #F59E0B 0%, #C5A059 45%, #0D6060 100%)",
                  }}
                  initial={
                    reducedMotion ? { width: `${numericScore}%` } : { width: 0 }
                  }
                  whileInView={{ width: `${numericScore}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="advisor-card-gold-glass-panel grid grid-cols-2 gap-y-2 p-2.5 md:grid-cols-4 md:gap-y-0 md:p-2">
              {statItems.map(({ icon, value, label, divider }) => (
                <StatCell
                  key={label}
                  icon={icon}
                  value={value}
                  label={label}
                  divider={divider}
                />
              ))}
            </div>

            <ViewProfileCta
              profileUrl={profileUrl}
              compact={false}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

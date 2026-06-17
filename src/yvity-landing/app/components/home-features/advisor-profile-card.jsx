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
  TrendingUp,
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
  "Mutual Funds": TrendingUp,
};

function resolveServicePills(serviceTypes = []) {
  return (serviceTypes ?? []).filter(Boolean).slice(0, 3);
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
          : label === "Mutual Funds"
            ? "Mutual Funds"
            : label.split(" ")[0];

  const labelText = compact
    ? short
    : label === "General Insurance"
      ? "General"
      : label === "Mutual Funds"
        ? "Mutual Funds"
        : `${short} Insurance`;

  return (
    <span
      className={
        compact
          ? "advisor-card-gold-glass-pill inline-flex items-center gap-1 px-2 py-1 font-poppins text-[10px] font-bold leading-tight text-[#0A4A4A]"
          : "advisor-card-gold-glass-pill inline-flex items-center gap-1 px-2.5 py-1 font-poppins text-[11px] font-bold leading-tight text-[#0A4A4A]"
      }
    >
      <Icon
        className={`shrink-0 text-[#0D6060] ${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`}
        strokeWidth={2}
      />
      <span className="leading-tight">{labelText}</span>
    </span>
  );
}

function AchievementBadge({ label, compact = false }) {
  const shortLabel = label.startsWith("MDRT") ? "MDRT" : label;

  return (
    <span
      className={
        compact
          ? "inline-flex items-center gap-1 rounded-full bg-[#FFF9E8] px-2 py-0.5 font-poppins text-[10px] font-bold leading-tight text-[#92400E] ring-1 ring-[#F59E0B]/35"
          : "inline-flex items-center gap-1 rounded-full bg-[#FFF9E8] px-2 py-0.5 font-poppins text-[10px] font-bold leading-tight text-[#92400E] ring-1 ring-[#F59E0B]/35"
      }
    >
      <Trophy className="h-3 w-3 shrink-0 text-[#F59E0B]" strokeWidth={2} />
      <span>{shortLabel}</span>
    </span>
  );
}

function StatCell({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/55 text-[#0D6060] ring-1 ring-[#0A4A4A]/10 backdrop-blur-sm">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="font-poppins text-[12px] font-bold leading-none text-[#0A4A4A]">
          {value}
        </p>
        <p className="mt-0.5 font-poppins text-[10px] font-medium text-[#6B7280]">
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
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", repeatDelay: 4 }}
        />
      ) : null}
      <span
        className={`relative z-10 flex w-full items-center justify-center font-poppins font-bold tracking-wide text-white ${
          compact ? "gap-1.5 py-0 text-xs" : "gap-2 px-1 text-[13px]"
        }`}
      >
        {!compact ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/35">
            <User className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          View Profile
          <ArrowRight className={compact ? "h-3.5 w-3.5" : "h-3.5 w-3.5"} />
        </span>
      </span>
    </>
  );

  const className = `relative flex w-full overflow-hidden rounded-full shadow-[0_6px_18px_rgba(217,119,6,0.35)] ${
    compact ? "py-2" : "py-2"
  }`;

  const liveProfilePath = profileUrl && profileUrl !== "/profile" ? profileUrl : null;

  if (liveProfilePath) {
    return (
      <Link href={liveProfilePath} className={className} target="_blank" rel="noopener noreferrer">
        {ctaInner}
      </Link>
    );
  }

  return <button type="button" className={className}>{ctaInner}</button>;
}

/* ── Avatar block shared by both variants ── */
function AvatarBlock({ avatarUrl, name, numericScore, showIdentityVerified, size = "md" }) {
  const dim = size === "sm" ? "h-14 w-14" : "h-[56px] w-[56px] md:h-[92px] md:w-[92px]";
  const textSize = size === "sm" ? "text-lg" : "text-lg md:text-3xl";

  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    /* outer wrapper — identity tick is sibling to score ring so it sits above the SVG arc */
    <div className="relative shrink-0 overflow-visible">
      <div className="absolute -inset-0.5 rounded-full bg-[#F59E0B]/30 blur-sm" />
      <AdvisorScoreAvatarRing score={numericScore} onDarkHeader>
        <div className="relative rounded-full bg-gradient-to-br from-[#F59E0B] via-[#E8C872] to-[#C5A059] p-[2px]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className={`${dim} rounded-full object-cover`} />
          ) : (
            <div
              className={`${dim} flex items-center justify-center rounded-full bg-gradient-to-br from-[#0A4A4A] to-[#0D6060] font-cormorant font-bold text-[#F8F6F1] ${textSize}`}
            >
              {initials}
            </div>
          )}
        </div>
      </AdvisorScoreAvatarRing>
      {/* tick placed here — outside the ring SVG, z-[5] keeps it on top */}
      {showIdentityVerified ? <IdentityVerifiedTick size="sm" /> : null}
    </div>
  );
}

function StatCellCompact({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/55 text-[#0D6060] ring-1 ring-[#0A4A4A]/10">
        <Icon className="h-3 w-3" />
      </span>
      <p className="font-poppins text-[11px] font-bold leading-none tabular-nums text-[#0A4A4A]">{value}</p>
      <p className="font-poppins text-[9px] font-medium leading-none text-[#6B7280]">{label}</p>
    </div>
  );
}

/* ─────────────── Compact variant — in-app use ─────────────── */
function AdvisorProfileCardCompact({
  name, title, location, score, exp, avgRating,
  clients, clientsLabel = "Clients", recs,
  profileUrl, avatarUrl, showIdentityVerified = false,
  serviceTypes = [], achievementTags = [],
}) {
  const reducedMotion = usePrefersReducedMotion();
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const servicePills = resolveServicePills(serviceTypes);

  const statItems = [
    { icon: Briefcase, value: formatExperienceDisplay(exp), label: "Exp." },
    { icon: Star,      value: formatAverageRating(avgRating), label: "Rating" },
    { icon: Users,     value: clients,                        label: clientsLabel },
    { icon: ThumbsUp,  value: recs,                           label: "Recs" },
  ];

  return (
    <motion.article
      className="mx-auto h-full w-full max-w-[340px]"
      {...(reducedMotion ? {} : {
        whileHover: {
          y: -4,
          boxShadow: "0 14px 36px rgba(10,74,74,0.12), 0 0 18px rgba(245,158,11,0.12)",
          transition: { duration: 0.35, ease: "easeOut" },
        },
      })}
    >
      <div className="advisor-card-gold-shell">
        <div className="advisor-card-gold-inner relative flex h-full flex-col overflow-hidden antialiased">

          {/* Header — row layout, smaller padding */}
          <div className="advisor-card-gold-profile-header px-3 pb-3 pt-3">
            {!reducedMotion ? <span className="gold-bottom-shine" aria-hidden><span className="shine" /></span> : null}
            <div className="relative z-10 flex items-start gap-2.5">
              <AvatarBlock
                avatarUrl={avatarUrl}
                name={name}
                numericScore={numericScore}
                showIdentityVerified={showIdentityVerified}
                size="sm"
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="font-cormorant text-[16px] font-bold leading-tight tracking-[0.02em] text-white">
                  {name}
                </h3>
                <p className="mt-0.5 font-poppins text-[10px] font-semibold tracking-wide text-[#F59E0B]">
                  {title}
                </p>
                <p className="mt-0.5 flex items-center gap-1 font-poppins text-[10px] font-medium text-white/80">
                  <MapPin className="h-3 w-3 shrink-0 text-[#F59E0B]" />
                  <span className="line-clamp-1">{location}</span>
                </p>
                {achievementTags.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {achievementTags.slice(0, 2).map((tag) => (
                      <AchievementBadge key={tag} label={tag} compact />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="relative z-10 flex flex-col gap-2 p-3">

            {servicePills.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1">
                {servicePills.map((tag) => <ServicePill key={tag} label={tag} compact />)}
              </div>
            ) : null}

            {/* YVITY Score — compact bar */}
            <div className="advisor-card-gold-glass-panel px-2.5 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <p className="font-poppins text-[9px] font-bold uppercase tracking-[0.12em] text-[#0A4A4A]">YVITY Score</p>
                  <YvityScoreInfoTip />
                </div>
                <p className="font-poppins text-[15px] font-bold leading-none tabular-nums text-[#0A4A4A]">
                  {Math.round(numericScore)}
                  <span className="font-poppins text-[9px] font-medium text-[#9CA3AF]"> /100</span>
                </p>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/45 ring-1 ring-[#0A4A4A]/8">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #0D6060 0%, #14B8A6 45%, #F59E0B 100%)" }}
                  initial={reducedMotion ? { width: `${numericScore}%` } : { width: 0 }}
                  whileInView={{ width: `${numericScore}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Stats — 4 in a row */}
            <div className="advisor-card-gold-glass-panel grid grid-cols-4 gap-1 px-2 py-2">
              {statItems.map(({ icon, value, label }) => (
                <StatCellCompact key={label} icon={icon} value={value} label={label} />
              ))}
            </div>

            <ViewProfileCta profileUrl={profileUrl} compact reducedMotion={reducedMotion} />
          </div>

        </div>
      </div>
    </motion.article>
  );
}

/* ─────────────── Default variant (Find Advisors grid) ─────────────── */
export function AdvisorProfileCard({
  name, title, location, score, exp, avgRating,
  clients, clientsLabel = "Clients", recs,
  profileUrl, avatarUrl, showIdentityVerified = false,
  serviceTypes = [], achievementTags = [], variant = "default",
}) {
  if (variant === "compact") {
    return (
      <AdvisorProfileCardCompact
        name={name} title={title} location={location} score={score}
        avgRating={avgRating} profileUrl={profileUrl} avatarUrl={avatarUrl}
        showIdentityVerified={showIdentityVerified}
        serviceTypes={serviceTypes} achievementTags={achievementTags}
      />
    );
  }

  const reducedMotion = usePrefersReducedMotion();
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const servicePills = resolveServicePills(serviceTypes);

  const statItems = [
    { icon: Briefcase, value: formatExperienceDisplay(exp), label: "Experience" },
    { icon: Star,     value: formatAverageRating(avgRating), label: "Avg. Rating" },
    { icon: Users,    value: clients,                        label: clientsLabel  },
    { icon: ThumbsUp, value: recs,                           label: "Recs"        },
  ];

  return (
    <motion.article
      className="mx-auto h-full w-full max-w-[380px]"
      {...(reducedMotion ? {} : {
        whileHover: {
          y: -6,
          boxShadow: "0 18px 44px rgba(10,74,74,0.12), 0 0 24px rgba(245,158,11,0.15)",
          transition: { duration: 0.4, ease: "easeOut" },
        },
      })}
    >
      <div className="advisor-card-gold-shell">
        <div className="advisor-card-gold-inner relative flex h-full flex-col overflow-hidden antialiased">

          {/* Header — compact on mobile, full size on md+ */}
          <div className="advisor-card-gold-profile-header px-3 pb-3 pt-3 md:px-5 md:pb-5 md:pt-5">
            {!reducedMotion ? <span className="gold-bottom-shine" aria-hidden><span className="shine" /></span> : null}
            <div className="relative z-10 flex items-start gap-3">
              <AvatarBlock
                avatarUrl={avatarUrl}
                name={name}
                numericScore={numericScore}
                showIdentityVerified={showIdentityVerified}
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <h3 className="font-cormorant text-[19px] font-bold leading-[1.12] tracking-[0.02em] text-white md:text-[24px]">
                  {name}
                </h3>
                <p className="mt-0.5 font-poppins text-[11px] font-semibold tracking-wide text-[#F59E0B]">
                  {title}
                </p>
                <p className="mt-1 flex items-start gap-1 font-poppins text-[11px] font-medium leading-snug text-white/85">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[#F59E0B]" />
                  <span className="min-w-0 line-clamp-1 md:line-clamp-2">{location}</span>
                </p>
                {/* Achievements in header — clearly separated from services */}
                {achievementTags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {achievementTags.slice(0, 2).map((tag) => (
                      <AchievementBadge key={tag} label={tag} />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="relative z-10 flex flex-col gap-2 p-3 md:gap-3 md:p-4">

            {/* Service pills only — no achievements here */}
            {servicePills.length > 0 ? (
              <div className="flex flex-wrap items-center justify-start gap-1">
                {servicePills.map((tag) => <ServicePill key={tag} label={tag} />)}
              </div>
            ) : null}

            {/* YVITY Score */}
            <div className="advisor-card-gold-glass-panel p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <p className="font-poppins text-[10px] font-bold uppercase tracking-[0.12em] text-[#0A4A4A]">
                    YVITY Score
                  </p>
                  <YvityScoreInfoTip />
                </div>
                <p className="font-poppins text-[18px] font-bold leading-none tabular-nums text-[#0A4A4A]">
                  {Math.round(numericScore)}
                  <span className="font-poppins text-[11px] font-medium text-[#9CA3AF]"> /100</span>
                </p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/45 ring-1 ring-[#0A4A4A]/8">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #0D6060 0%, #14B8A6 45%, #F59E0B 100%)" }}
                  initial={reducedMotion ? { width: `${numericScore}%` } : { width: 0 }}
                  whileInView={{ width: `${numericScore}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Stats 2×2 */}
            <div className="advisor-card-gold-glass-panel grid grid-cols-2 gap-2 p-2.5">
              {statItems.map(({ icon, value, label }) => (
                <StatCell key={label} icon={icon} value={value} label={label} />
              ))}
            </div>

            <ViewProfileCta profileUrl={profileUrl} compact={false} reducedMotion={reducedMotion} />
          </div>

        </div>
      </div>
    </motion.article>
  );
}

"use client";

import { IdentityVerifiedTick } from "@/yvity-landing/components/brand/IdentityVerifiedTick";
import { YvityScoreInfoTip } from "@/yvity-landing/components/brand/YvityScoreInfoTip";
import Image from "next/image";
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
import { MdrtIcon } from "@/components/ui/mdrt-icon";

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

  const labelText = compact ? short : label;

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
  const isMdrt = label.startsWith("MDRT") || label === "COT" || label === "TOT";
  const displayLabel = label.startsWith("MDRT") ? label : label;

  if (isMdrt) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/30 backdrop-blur-sm">
        <MdrtIcon size={compact ? 12 : 14} className="shrink-0 brightness-0 invert" />
        <span className={`font-poppins font-bold leading-tight text-white ${compact ? "text-[8px]" : "text-[9px]"}`}>
          {displayLabel}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF9E8] px-2 py-0.5 font-poppins text-[10px] font-bold leading-tight text-[#92400E] ring-1 ring-[#F59E0B]/35">
      <Trophy className="h-3 w-3 shrink-0 text-[#F59E0B]" strokeWidth={2} />
      <span>{displayLabel}</span>
    </span>
  );
}

function YvityVerifiedBadge({ compact = false }) {
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-[#F8F6F1] ring-1 ring-[#0A4A4A]/20 shadow-[0_2px_8px_rgba(10,74,74,0.18)] ${compact ? "px-1.5 py-[3px]" : "px-2.5 py-1"}`}>
      <Image
        src="/brand/yvity-logo.png"
        alt="YVITY"
        width={10}
        height={10}
        className={compact ? "h-2.5 w-2.5 object-contain" : "h-3 w-3 object-contain"}
      />
      <span className={`font-poppins font-bold tracking-wide text-[#0A4A4A] ${compact ? "text-[8px]" : "text-[9px]"}`}>
        Verified
      </span>
    </div>
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

function ViewProfileCta({ profileUrl, compact, reducedMotion, isFeatured, isLoggedIn, onGatedClick }) {
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

  // Gated: not featured + not logged in → show login popup
  const isGated = !isFeatured && !isLoggedIn;

  if (isGated) {
    return (
      <button type="button" className={className} onClick={onGatedClick}>
        {ctaInner}
      </button>
    );
  }

  if (liveProfilePath) {
    const saveScroll = () => {
      try { sessionStorage.setItem("yvity_landing_scroll", String(window.scrollY)); } catch {}
    };
    return (
      <>
        {/* Mobile / PWA — same-tab navigation so the back button works inside the app */}
        <div className="md:hidden w-full">
          <Link href={liveProfilePath} className={className} onClick={saveScroll}>
            {ctaInner}
          </Link>
        </div>
        {/* Desktop — new tab; landing page stays open in original tab */}
        <div className="hidden md:block w-full">
          <Link href={liveProfilePath} className={className} target="_blank" rel="noopener noreferrer">
            {ctaInner}
          </Link>
        </div>
      </>
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
    <div className="relative shrink-0 overflow-visible">
      <div className="absolute -inset-1 rounded-full bg-white/30 blur-md" />
      <AdvisorScoreAvatarRing score={numericScore} onDarkHeader>
        <div className="relative rounded-full bg-gradient-to-br from-white via-white/95 to-white/80 p-[2.5px]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className={`${dim} rounded-full object-cover`} />
          ) : (
            <div
              className={`${dim} flex items-center justify-center rounded-full bg-gradient-to-br from-[#0A4A4A] to-[#0D6060] font-cormorant font-bold text-[#F8F6F1] ${textSize}`}
            >
              {initials}
            </div>
          )}
          {showIdentityVerified ? <IdentityVerifiedTick size="sm" /> : null}
        </div>
      </AdvisorScoreAvatarRing>
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
  isFeatured = true, isLoggedIn = true, onGatedClick,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const servicePills = resolveServicePills(serviceTypes);

  const numericRecs = Number(recs) || 0;
  const clientsDisplay = Number(clients) > 0 ? `${clients}+` : (clients ?? "0");
  const clientsLabelDisplay = clientsLabel === "Clients" ? "Clients Served" : clientsLabel;

  const statItems = [
    { icon: Briefcase, value: formatExperienceDisplay(exp),    label: "Exp."            },
    { icon: Star,      value: formatAverageRating(avgRating),  label: "Rating"          },
    { icon: Users,     value: clientsDisplay,                  label: clientsLabelDisplay },
    ...(numericRecs > 0 ? [{ icon: ThumbsUp, value: String(numericRecs), label: "Recs" }] : []),
  ];

  return (
    <motion.article
      className="relative mx-auto h-full w-full max-w-[340px] overflow-visible"
      {...(reducedMotion ? {} : {
        whileHover: {
          y: -4,
          boxShadow: "0 14px 36px rgba(10,74,74,0.12), 0 0 18px rgba(245,158,11,0.12)",
          transition: { duration: 0.35, ease: "easeOut" },
        },
      })}
    >
      {/* YVITY Verified badge — sits on the top edge of the card */}
      {showIdentityVerified ? (
        <div className="absolute -top-3 right-3 z-30">
          <YvityVerifiedBadge compact />
        </div>
      ) : null}

      <div className="advisor-card-gold-shell">
        <div className="advisor-card-gold-inner relative flex h-full flex-col overflow-hidden antialiased">

          {/* Header */}
          <div className="advisor-card-gold-profile-header px-3 pb-3 pt-3">
            {!reducedMotion ? <span className="gold-bottom-shine" aria-hidden><span className="shine" /></span> : null}
            {/* YVITY logo brand mark */}
            <Image
              src="/images/brand-logo.png"
              alt="YVITY"
              width={44}
              height={16}
              className="pointer-events-none absolute right-2.5 top-2.5 h-auto w-11 object-contain opacity-[0.25] brightness-0 invert"
              aria-hidden
            />
            <div className="relative z-10 flex items-center gap-2.5">
              <AvatarBlock
                avatarUrl={avatarUrl}
                name={name}
                numericScore={numericScore}
                showIdentityVerified={showIdentityVerified}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-cormorant text-[16px] font-bold leading-tight tracking-[0.02em] text-white">
                  {name}
                </h3>
                <p className="mt-0.5 font-poppins text-[10px] font-semibold tracking-wide text-[#F59E0B]">
                  {title}
                </p>
                <p className="mt-1 flex items-center gap-1 font-poppins text-[10px] font-medium text-white/75">
                  <MapPin className="h-3 w-3 shrink-0 text-[#F59E0B]/80" />
                  <span className="line-clamp-1 uppercase tracking-wider">{location}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="relative z-10 flex flex-col gap-2 p-3">

            {/* YVITY Score — above service pills */}
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
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[#0A4A4A]/10 ring-1 ring-[#0A4A4A]/8">
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

            {servicePills.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1">
                {servicePills.map((tag) => <ServicePill key={tag} label={tag} compact />)}
              </div>
            ) : null}

            {/* Stats — 3 or 4 in a row depending on recs */}
            <div className={`advisor-card-gold-glass-panel grid gap-1 px-2 py-2 ${statItems.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
              {statItems.map(({ icon, value, label }) => (
                <StatCellCompact key={label} icon={icon} value={value} label={label} />
              ))}
            </div>

            <ViewProfileCta
              profileUrl={profileUrl} compact reducedMotion={reducedMotion}
              isFeatured={isFeatured} isLoggedIn={isLoggedIn} onGatedClick={onGatedClick}
            />
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
  isFeatured = true, isLoggedIn = true, onGatedClick,
}) {
  if (variant === "compact") {
    return (
      <AdvisorProfileCardCompact
        name={name} title={title} location={location} score={score}
        exp={exp} avgRating={avgRating} clients={clients} clientsLabel={clientsLabel} recs={recs}
        profileUrl={profileUrl} avatarUrl={avatarUrl}
        showIdentityVerified={showIdentityVerified}
        serviceTypes={serviceTypes} achievementTags={achievementTags}
        isFeatured={isFeatured} isLoggedIn={isLoggedIn} onGatedClick={onGatedClick}
      />
    );
  }

  const reducedMotion = usePrefersReducedMotion();
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const servicePills = resolveServicePills(serviceTypes);

  const numericRecs = Number(recs) || 0;
  const clientsDisplay = Number(clients) > 0 ? `${clients}+` : (clients ?? "0");
  const clientsLabelDisplay = clientsLabel === "Clients" ? "Clients Served" : clientsLabel;

  const statItems = [
    { icon: Briefcase, value: formatExperienceDisplay(exp),   label: "Experience"       },
    { icon: Star,      value: formatAverageRating(avgRating), label: "Avg. Rating"      },
    { icon: Users,     value: clientsDisplay,                 label: clientsLabelDisplay },
    ...(numericRecs > 0 ? [{ icon: ThumbsUp, value: String(numericRecs), label: "Recommends" }] : []),
  ];

  return (
    <motion.article
      className="relative mx-auto h-full w-full max-w-[380px] overflow-visible"
      {...(reducedMotion ? {} : {
        whileHover: {
          y: -6,
          boxShadow: "0 18px 44px rgba(10,74,74,0.12), 0 0 24px rgba(245,158,11,0.15)",
          transition: { duration: 0.4, ease: "easeOut" },
        },
      })}
    >
      {/* YVITY Verified badge — sits on the top edge of the card */}
      {showIdentityVerified ? (
        <div className="absolute -top-3 right-4 z-30">
          <YvityVerifiedBadge />
        </div>
      ) : null}

      <div className="advisor-card-gold-shell">
        <div className="advisor-card-gold-inner relative flex h-full flex-col overflow-hidden antialiased">

          {/* Header */}
          <div className="advisor-card-gold-profile-header px-4 pb-4 pt-4 md:px-5 md:pb-5 md:pt-5">
            {!reducedMotion ? <span className="gold-bottom-shine" aria-hidden><span className="shine" /></span> : null}
            {/* YVITY logo brand mark — top-right corner */}
            <Image
              src="/images/brand-logo.png"
              alt="YVITY"
              width={56}
              height={20}
              className="pointer-events-none absolute right-3 top-3 h-auto w-14 object-contain opacity-[0.28] brightness-0 invert"
              aria-hidden
            />
            <div className="relative z-10 flex items-center gap-3">
              <AvatarBlock
                avatarUrl={avatarUrl}
                name={name}
                numericScore={numericScore}
                showIdentityVerified={showIdentityVerified}
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-cormorant text-[20px] font-bold leading-tight tracking-[0.015em] text-white md:text-[24px]">
                  {name}
                </h3>
                <p className="mt-0.5 font-poppins text-[11px] font-semibold tracking-wide text-[#F59E0B]">
                  {title}
                </p>
                <p className="mt-1.5 flex items-center gap-1 font-poppins text-[11px] font-medium text-white/75">
                  <MapPin className="h-3 w-3 shrink-0 text-[#F59E0B]/80" />
                  <span className="min-w-0 line-clamp-1 uppercase tracking-wider">{location}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="relative z-10 flex flex-col gap-2 p-3 md:gap-3 md:p-4">

            {/* YVITY Score — above service pills so trust signal comes first */}
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
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#0A4A4A]/10 ring-1 ring-[#0A4A4A]/8">
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

            {/* Service pills */}
            {servicePills.length > 0 ? (
              <div className="flex flex-wrap items-center justify-start gap-1">
                {servicePills.map((tag) => <ServicePill key={tag} label={tag} />)}
              </div>
            ) : null}

            {/* Stats — 2×2 or 1×3 row depending on recs */}
            <div className={`advisor-card-gold-glass-panel grid gap-2 p-2.5 ${statItems.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {statItems.map(({ icon, value, label }) => (
                <StatCell key={label} icon={icon} value={value} label={label} />
              ))}
            </div>

            <ViewProfileCta
              profileUrl={profileUrl} compact={false} reducedMotion={reducedMotion}
              isFeatured={isFeatured} isLoggedIn={isLoggedIn} onGatedClick={onGatedClick}
            />
          </div>

        </div>
      </div>
    </motion.article>
  );
}

"use client";

import { useId } from "react";
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
    <div className="flex flex-col items-center gap-1 py-1">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#F59E0B] ring-1 ring-white/15">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
      </span>
      <p className="font-poppins text-[13px] font-bold leading-none tabular-nums text-white">{value}</p>
      <p className="font-poppins text-[9px] font-medium leading-none text-white/55">{label}</p>
    </div>
  );
}

/** 270° circular score gauge — matches Image 4 style */
function ScoreGauge({ score, size = 72 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.75;
  const filled = (Math.min(100, Math.max(0, Number(score) || 0)) / 100) * arcLen;
  const numScore = Math.min(100, Math.max(0, Number(score) || 0));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id="sg-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0D6060" />
            <stop offset="50%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8.5" strokeLinecap="round"
          strokeDasharray={`${arcLen} ${circ - arcLen}`}
          transform="rotate(135 50 50)"
        />
        {numScore > 0 ? (
          <circle cx="50" cy="50" r={r}
            fill="none" stroke="url(#sg-fill)" strokeWidth="8.5" strokeLinecap="round"
            strokeDasharray={`${filled} ${circ - filled}`}
            transform="rotate(135 50 50)"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-poppins font-bold leading-none tabular-nums text-white"
          style={{ fontSize: size < 60 ? 16 : 20 }}>
          {Math.round(numScore)}
        </span>
        <span className="font-poppins font-medium text-white/50"
          style={{ fontSize: size < 60 ? 7 : 9 }}>
          /100
        </span>
      </div>
    </div>
  );
}

// Cream-body score dial used by the default card variant (unique gradId per instance avoids SVG collision)
function ScoreDial({ score, size = 90, gradId }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.75;
  const n = Math.min(100, Math.max(0, Number(score) || 0));
  const filled = (n / 100) * arcLen;
  const numSize = Math.round(size * 0.265);
  const subSize = Math.round(size * 0.145);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 52 52" width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#0D6060" />
            <stop offset="50%"  stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(10,74,74,0.12)" strokeWidth="5"
          strokeLinecap="round" strokeDasharray={`${arcLen} ${circ - arcLen}`} transform="rotate(135 26 26)" />
        {n > 0 && (
          <circle cx="26" cy="26" r={r} fill="none" stroke={`url(#${gradId})`} strokeWidth="5"
            strokeLinecap="round" strokeDasharray={`${filled} ${circ - filled}`} transform="rotate(135 26 26)" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-poppins font-bold leading-none tabular-nums text-[#0A4A4A]" style={{ fontSize: numSize }}>
          {Math.round(n)}
        </span>
        <span className="font-poppins font-medium text-[#9CA3AF]" style={{ fontSize: subSize }}>/100</span>
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
          className="pointer-events-none absolute -left-full top-0 h-full w-1/2 skew-x-[-20deg] bg-white/25 max-md:hidden"
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

  const glowStyle = compact
    ? { boxShadow: "0 4px 14px rgba(245,158,11,0.30)" }
    : { boxShadow: "0 0 0 1px rgba(245,158,11,0.35), 0 0 18px 6px rgba(245,158,11,0.45), 0 4px 16px rgba(245,158,11,0.30)" };

  const className = `relative flex w-full overflow-hidden rounded-full ${compact ? "py-2" : "py-2.5"}`;

  const liveProfilePath = profileUrl && profileUrl !== "/profile" ? profileUrl : null;

  // Gated: not featured + not logged in → show login popup
  const isGated = !isFeatured && !isLoggedIn;

  if (isGated) {
    return (
      <button type="button" className={className} style={glowStyle} onClick={onGatedClick}>
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
          <Link href={liveProfilePath} className={className} style={glowStyle} onClick={saveScroll}>
            {ctaInner}
          </Link>
        </div>
        {/* Desktop — new tab; landing page stays open in original tab */}
        <div className="hidden md:block w-full">
          <Link href={liveProfilePath} className={className} style={glowStyle} target="_blank" rel="noopener noreferrer">
            {ctaInner}
          </Link>
        </div>
      </>
    );
  }

  return <button type="button" className={className} style={glowStyle}>{ctaInner}</button>;
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
      <div className="absolute -inset-1 rounded-full bg-[#F59E0B]/22 blur-md" />
      <AdvisorScoreAvatarRing score={numericScore} onDarkHeader>
        <div className="relative rounded-full bg-gradient-to-br from-[#F59E0B] via-[#FFAE26] to-[#D97706] p-[3px]">
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
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#F59E0B] ring-1 ring-white/15">
        <Icon className="h-3 w-3" />
      </span>
      <p className="font-poppins text-[11px] font-bold leading-none tabular-nums text-white">{value}</p>
      <p className="font-poppins text-[9px] font-medium leading-none text-white/55">{label}</p>
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
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `arcc${uid}`;
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const servicePills = resolveServicePills(serviceTypes);
  const numericRecs = Number(recs) || 0;
  const clientsDisplay = Number(clients) > 0 ? `${clients}+` : (clients ?? "0");
  const clientsLabelDisplay = clientsLabel === "Clients" ? "Clients" : clientsLabel;

  const statItems = [
    { icon: Briefcase, value: formatExperienceDisplay(exp),   label: "Exp."   },
    { icon: Star,      value: formatAverageRating(avgRating), label: "Rating" },
    { icon: Users,     value: clientsDisplay,                 label: clientsLabelDisplay },
    ...(numericRecs > 0 ? [{ icon: ThumbsUp, value: String(numericRecs), label: "Recommends" }] : []),
  ];

  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.article
      className="relative mx-auto w-full max-w-[340px] overflow-hidden"
      style={{
        borderRadius: 24,
        boxShadow:
          "0 8px 36px rgba(10,74,74,0.14), 0 2px 8px rgba(0,0,0,0.06)," +
          "inset 0 0 0 1.5px rgba(245,158,11,0.16)",
      }}
      {...(reducedMotion ? {} : {
        whileHover: {
          y: -4,
          boxShadow:
            "0 14px 40px rgba(10,74,74,0.20), 0 0 20px rgba(245,158,11,0.14)," +
            "inset 0 0 0 1.5px rgba(245,158,11,0.32)",
        },
        transition: { duration: 0.3, ease: "easeOut" },
      })}
    >
      {/* ── Header ── */}
      <div className="relative overflow-hidden px-3 py-3" style={{ background: "#0A4A4A" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 90% 130%, rgba(245,158,11,0.30) 0%, transparent 62%)," +
              "radial-gradient(ellipse 60% 40% at 50% -20%, rgba(255,255,255,0.04) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          {/* Avatar — 72px */}
          <div className="relative shrink-0 overflow-visible" style={{ filter: "drop-shadow(0 0 10px rgba(245,158,11,0.40))" }}>
            <div className="relative rounded-full bg-gradient-to-br from-[#0D6060] via-[#14B8A6] to-[#F59E0B] p-[3px]">
              <div className="h-[72px] w-[72px] overflow-hidden rounded-full bg-gradient-to-br from-[#0D6060] to-[#0A4A4A]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-cormorant text-[28px] font-bold text-[#F8F6F1]">
                    {initials}
                  </div>
                )}
              </div>
              {showIdentityVerified && (
                <IdentityVerifiedTick
                  size="sm"
                  className="!bottom-[4px] !right-[4px] !translate-x-0 !translate-y-0"
                />
              )}
            </div>
          </div>
          {/* Name / title / location */}
          <div className="min-w-0 flex-1">
            <h3 className="font-cormorant text-[18px] font-bold leading-tight tracking-[0.015em] text-white">
              {name}
            </h3>
            <p className="mt-0.5 font-poppins text-[10px] font-semibold tracking-wide text-[#F59E0B]">
              {title}
            </p>
            <p className="mt-1 flex items-center gap-1 font-poppins text-[9px] font-medium text-white/70">
              <MapPin className="h-2.5 w-2.5 shrink-0 text-[#F59E0B]/80" />
              <span className="min-w-0 line-clamp-1 uppercase tracking-wider">{location}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Gold hairline divider ── */}
      <div
        className="h-[1px] w-full"
        style={{ background: "linear-gradient(90deg, #F59E0B, #FFAE26, #D97706)" }}
      />

      {/* ── Body: warm cream ── */}
      <div className="bg-[#F8F6F1] px-3 pb-3 pt-2">

        {/* Split panel: score ring (left) | service pills (right) */}
        <div className="mb-2 flex items-stretch overflow-hidden rounded-xl border border-[#0A4A4A]/10 bg-white shadow-[0_1px_6px_rgba(10,74,74,0.05)]">
          {/* Left — score ring */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 px-2 py-2">
            <ScoreDial score={numericScore} size={72} gradId={gradId} />
            <div className="flex items-center gap-0.5">
              <p className="font-poppins text-[7px] font-bold uppercase tracking-[0.1em] text-[#0A4A4A]/40">
                YVITY Score
              </p>
              <YvityScoreInfoTip buttonClassName="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-[#0A4A4A]/15 bg-[#0A4A4A]/05 text-[#0A4A4A]/40 transition hover:border-[#F59E0B]/50 hover:text-[#F59E0B] focus-visible:outline-none" />
            </div>
          </div>
          {/* Vertical divider */}
          <div className="w-px self-stretch bg-gradient-to-b from-transparent via-[#0A4A4A]/10 to-transparent" />
          {/* Right — service pills stacked vertically */}
          <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1 px-2.5 py-2">
            {servicePills.map((label) => {
              const Icon = SERVICE_ICONS[label] ?? Shield;
              return (
                <span
                  key={label}
                  className="flex items-center gap-1 rounded-full border border-[#0A4A4A]/12 bg-[#F8F6F1] px-2 py-[3px] shadow-[0_1px_3px_rgba(10,74,74,0.05)]"
                >
                  <Icon className="h-2.5 w-2.5 shrink-0 text-[#F59E0B]" strokeWidth={1.8} />
                  <span className="font-poppins text-[9px] font-medium text-[#0A4A4A]">{label}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Stats strip */}
        <div className={`mb-3 grid divide-x divide-[#0A4A4A]/8 overflow-hidden rounded-xl border border-[#0A4A4A]/10 bg-white shadow-[0_1px_6px_rgba(10,74,74,0.05)] ${statItems.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
          {statItems.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 px-1 py-1.5">
              <Icon className="h-3 w-3 text-[#F59E0B]" strokeWidth={1.8} />
              <p className="font-poppins text-[11px] font-bold leading-tight tabular-nums text-[#0A4A4A]">
                {value}
              </p>
              <p className="font-poppins text-[8px] font-medium leading-tight text-[#9CA3AF]">
                {label}
              </p>
            </div>
          ))}
        </div>

        <ViewProfileCta
          profileUrl={profileUrl} compact reducedMotion={reducedMotion}
          isFeatured={isFeatured} isLoggedIn={isLoggedIn} onGatedClick={onGatedClick}
        />
      </div>
    </motion.article>
  );
}

/* ─────────────── Single card — default (landing) + compact (dashboard) ─────────────── */
export function AdvisorProfileCard({
  name, title, location, score, exp, avgRating,
  clients, clientsLabel = "Clients", recs,
  profileUrl, avatarUrl, showIdentityVerified = false,
  serviceTypes = [], achievementTags = [], variant = "default",
  isFeatured = true, isLoggedIn = true, onGatedClick,
}) {
  const isCompact = variant === "compact";

  const reducedMotion = usePrefersReducedMotion();
  const uid      = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId   = `arc${uid}`;
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const servicePills = resolveServicePills(serviceTypes);
  const numericRecs  = Number(recs) || 0;
  const clientsDisplay = Number(clients) > 0 ? `${clients}+` : (clients ?? "0");

  const statItems = [
    { icon: Briefcase, value: formatExperienceDisplay(exp),   label: isCompact ? "Exp."    : "Experience"   },
    { icon: Star,      value: formatAverageRating(avgRating), label: isCompact ? "Rating"  : "Avg. Rating"  },
    { icon: Users,     value: clientsDisplay,                 label: isCompact ? "Clients" : (clientsLabel === "Clients" ? "Clients Served" : clientsLabel) },
    ...(numericRecs > 0 ? [{ icon: ThumbsUp, value: String(numericRecs), label: "Recommends" }] : []),
  ];

  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Size tokens — one place to control default vs compact
  const avatarPx   = isCompact ? 72  : 96;
  const dialPx     = isCompact ? 72  : 90;
  const radius     = isCompact ? 24  : 28;
  const tickOffset = isCompact ? "!bottom-[4px] !right-[4px] !translate-x-0 !translate-y-0"
                               : "!bottom-[6px] !right-[6px] !translate-x-0 !translate-y-0";
  const hdrPad     = isCompact ? "px-3 py-3"   : "px-4 py-4";
  const hdrGap     = isCompact ? "gap-3"       : "gap-3.5";
  const nameSize   = isCompact ? "text-[18px]" : "text-[22px] md:text-[24px]";
  const locSize    = isCompact ? "text-[9px]"  : "text-[10px]";
  const bodyPad    = isCompact ? "px-3 pb-3 pt-2"   : "px-4 pb-3 pt-2.5";
  const panelR     = isCompact ? "rounded-xl"  : "rounded-2xl";
  const pillPx     = isCompact ? "px-2 py-[3px]"    : "px-2.5 py-1";
  const pillIcon   = isCompact ? "h-2.5 w-2.5" : "h-3 w-3";
  const pillText   = isCompact ? "text-[9px]"  : "text-[10px]";
  const statPy     = isCompact ? "py-1.5"      : "py-2";
  const statIcon   = isCompact ? "h-3 w-3"     : "h-3.5 w-3.5";
  const statVal    = isCompact ? "text-[11px]" : "text-[13px]";
  const statLbl    = isCompact ? "text-[8px]"  : "text-[9px]";
  const ctaMb      = isCompact ? "mb-3"        : "mb-4";
  const maxW       = isCompact ? "max-w-[340px]" : "max-w-[380px]";

  return (
    <motion.article
      className={`relative mx-auto w-full overflow-hidden ${maxW}`}
      style={{
        borderRadius: radius,
        boxShadow:
          "0 8px 36px rgba(10,74,74,0.14), 0 2px 8px rgba(0,0,0,0.06)," +
          "inset 0 0 0 1.5px rgba(245,158,11,0.16)",
      }}
      {...(reducedMotion ? {} : {
        whileHover: {
          y: isCompact ? -4 : -6,
          boxShadow:
            "0 18px 48px rgba(10,74,74,0.20), 0 0 24px rgba(245,158,11,0.14)," +
            "inset 0 0 0 1.5px rgba(245,158,11,0.32)",
        },
        transition: { duration: 0.3, ease: "easeOut" },
      })}
    >
      {/* ── Header ── */}
      <div className={`relative overflow-hidden ${hdrPad}`} style={{ background: "#0A4A4A" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 90% 130%, rgba(245,158,11,0.30) 0%, transparent 62%)," +
              "radial-gradient(ellipse 36% 24% at 102% 108%, rgba(255,210,60,0.18) 0%, transparent 50%)," +
              "radial-gradient(ellipse 60% 40% at 50% -20%, rgba(255,255,255,0.04) 0%, transparent 60%)",
          }}
        />
        <div className={`relative z-10 flex items-center ${hdrGap}`}>
          {/* Avatar */}
          <div className="relative shrink-0 overflow-visible" style={{ filter: "drop-shadow(0 0 12px rgba(245,158,11,0.40))" }}>
            <div className="relative rounded-full bg-gradient-to-br from-[#0D6060] via-[#14B8A6] to-[#F59E0B] p-[3px]">
              <div
                className="overflow-hidden rounded-full bg-gradient-to-br from-[#0D6060] to-[#0A4A4A]"
                style={{ width: avatarPx, height: avatarPx }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center font-cormorant font-bold text-[#F8F6F1]"
                    style={{ fontSize: isCompact ? 28 : 36 }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              {showIdentityVerified && (
                <IdentityVerifiedTick size="sm" className={tickOffset} />
              )}
            </div>
          </div>

          {/* Name / title / location */}
          <div className="min-w-0 flex-1">
            <h3 className={`font-cormorant font-bold leading-tight tracking-[0.015em] text-white ${nameSize}`}>
              {name}
            </h3>
            <p className="mt-0.5 font-poppins text-[11px] font-semibold tracking-wide text-[#F59E0B]">
              {title}
            </p>
            <p className={`mt-1 flex items-center gap-1 font-poppins font-medium text-white/70 ${locSize}`}>
              <MapPin className="h-3 w-3 shrink-0 text-[#F59E0B]/80" />
              <span className="min-w-0 line-clamp-1 uppercase tracking-wider">{location}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Gold hairline divider ── */}
      <div className="h-[1px] w-full" style={{ background: "linear-gradient(90deg, #F59E0B, #FFAE26, #D97706)" }} />

      {/* ── Body: warm cream ── */}
      <div className={`bg-[#F8F6F1] ${bodyPad}`}>

        {/* Split panel */}
        <div className={`mb-2 flex items-stretch overflow-hidden border border-[#0A4A4A]/10 bg-white shadow-[0_1px_6px_rgba(10,74,74,0.05)] ${panelR}`}>
          {/* Left — score ring */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 px-2 py-2.5">
            <ScoreDial score={numericScore} size={dialPx} gradId={gradId} />
            <div className="flex items-center gap-0.5">
              <p className="font-poppins text-[7px] font-bold uppercase tracking-[0.1em] text-[#0A4A4A]/40">
                YVITY Score
              </p>
              <YvityScoreInfoTip buttonClassName="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-[#0A4A4A]/15 bg-[#0A4A4A]/05 text-[#0A4A4A]/40 transition hover:border-[#F59E0B]/50 hover:text-[#F59E0B] focus-visible:outline-none" />
            </div>
          </div>
          {/* Vertical divider */}
          <div className="w-px self-stretch bg-gradient-to-b from-transparent via-[#0A4A4A]/10 to-transparent" />
          {/* Right — service pills */}
          <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1 px-2.5 py-2.5">
            {servicePills.map((label) => {
              const Icon = SERVICE_ICONS[label] ?? Shield;
              return (
                <span
                  key={label}
                  className={`flex items-center gap-1.5 rounded-full border border-[#0A4A4A]/12 bg-[#F8F6F1] shadow-[0_1px_3px_rgba(10,74,74,0.05)] ${pillPx}`}
                >
                  <Icon className={`shrink-0 text-[#F59E0B] ${pillIcon}`} strokeWidth={1.8} />
                  <span className={`font-poppins font-medium text-[#0A4A4A] ${pillText}`}>{label}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Stats strip */}
        <div className={`${ctaMb} grid divide-x divide-[#0A4A4A]/8 overflow-hidden border border-[#0A4A4A]/10 bg-white shadow-[0_1px_6px_rgba(10,74,74,0.05)] ${panelR} ${statItems.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
          {statItems.map(({ icon: Icon, value, label }) => (
            <div key={label} className={`flex flex-col items-center gap-0.5 px-1 ${statPy}`}>
              <Icon className={`text-[#F59E0B] ${statIcon}`} strokeWidth={1.8} />
              <p className={`font-poppins font-bold leading-tight tabular-nums text-[#0A4A4A] ${statVal}`}>
                {value}
              </p>
              <p className={`font-poppins font-medium leading-tight text-[#9CA3AF] ${statLbl}`}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <ViewProfileCta
          profileUrl={profileUrl} compact={isCompact} reducedMotion={reducedMotion}
          isFeatured={isFeatured} isLoggedIn={isLoggedIn} onGatedClick={onGatedClick}
        />
      </div>
    </motion.article>
  );
}

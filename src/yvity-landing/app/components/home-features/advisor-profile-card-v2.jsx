"use client";

import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  HeartPulse,
  MapPin,
  Shield,
  Star,
  ThumbsUp,
  TrendingUp,
  Umbrella,
  Users,
} from "lucide-react";
import { IdentityVerifiedTick } from "@/yvity-landing/components/brand/IdentityVerifiedTick";

const SERVICE_ICON_MAP = {
  "Life Insurance": Shield,
  "Health Insurance": HeartPulse,
  "General Insurance": Umbrella,
  "Mutual Funds": TrendingUp,
};

// gradId must be unique per DOM instance to avoid cross-instance gradient lookup failures
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
        {/* Track — subtle teal tint on white bg */}
        <circle
          cx="26" cy="26" r={r}
          fill="none"
          stroke="rgba(10,74,74,0.12)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${arcLen} ${circ - arcLen}`}
          transform="rotate(135 26 26)"
        />
        {/* Filled arc */}
        {n > 0 && (
          <circle
            cx="26" cy="26" r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ - filled}`}
            transform="rotate(135 26 26)"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-poppins font-bold leading-none tabular-nums text-[#0A4A4A]"
          style={{ fontSize: numSize }}
        >
          {Math.round(n)}
        </span>
        <span
          className="font-poppins font-medium text-[#9CA3AF]"
          style={{ fontSize: subSize }}
        >
          /100
        </span>
      </div>
    </div>
  );
}

export function AdvisorProfileCardV2({
  name         = "Krishna Mohan Noti",
  title        = "Advisor",
  location     = "Nellore, Andhra Pradesh",
  score        = 53,
  exp          = "7+",
  avgRating    = "5.0",
  clients      = "397",
  recs         = "0",
  avatarUrl,
  showIdentityVerified = true,
  serviceTypes = ["General Insurance", "Life Insurance", "Health Insurance"],
  profileUrl   = "#",
}) {
  // Unique ID per DOM instance avoids SVG gradient ID collisions when
  // both the mobile-hidden and desktop-visible copies exist simultaneously.
  const uid    = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `v2arc${uid}`;

  const numScore = Math.min(100, Math.max(0, Number(score) || 0));
  const numRecs  = Number(recs) || 0;
  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statItems = [
    { icon: Briefcase, value: `${exp} yrs`,     label: "Experience" },
    { icon: Star,      value: String(avgRating), label: "Rating" },
    { icon: Users,     value: `${clients}+`,     label: "Clients" },
    { icon: ThumbsUp,  value: String(numRecs),   label: "Recs" },
  ];

  return (
    <motion.article
      className="relative mx-auto w-full overflow-hidden"
      style={{
        borderRadius: 28,
        boxShadow:
          "0 8px 36px rgba(10,74,74,0.14), 0 2px 8px rgba(0,0,0,0.06)," +
          "inset 0 0 0 1.5px rgba(245,158,11,0.16)",
      }}
      whileHover={{
        y: -6,
        boxShadow:
          "0 18px 48px rgba(10,74,74,0.20), 0 0 24px rgba(245,158,11,0.14)," +
          "inset 0 0 0 1.5px rgba(245,158,11,0.32)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* ── Verified badge — top-right corner of card ── */}
      {showIdentityVerified && (
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded-full border border-[#0A4A4A]/10 bg-[#F8F6F1] px-2.5 py-1.5 shadow-[0_2px_8px_rgba(10,74,74,0.14)]">
          <Image
            src="/brand/yvity-logo.png"
            alt="YVITY"
            width={18}
            height={18}
            className="h-[18px] w-[18px] shrink-0 object-contain"
          />
          <span className="font-poppins text-[9px] font-bold leading-none tracking-wide text-[#0A4A4A]">
            Verified Advisor
          </span>
        </div>
      )}

      {/* ── Header: avatar left + name / title / location right ── */}
      <div
        className="relative overflow-hidden px-4 py-4"
        style={{ background: "#0A4A4A" }}
      >
        {/* Gold ray gradients */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 90% 130%, rgba(245,158,11,0.30) 0%, transparent 62%)," +
              "radial-gradient(ellipse 36% 24% at 102% 108%, rgba(255,210,60,0.18) 0%, transparent 50%)," +
              "radial-gradient(ellipse 60% 40% at 50% -20%, rgba(255,255,255,0.04) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3.5">
          {/* Avatar — 96 px, gold border ring, glow layers, verified tick */}
          <div className="relative shrink-0 overflow-visible">
            {/* Outer ambient glow */}
            <div className="absolute -inset-[10px] rounded-full bg-[#F59E0B]/18 blur-xl" />
            {/* Inner warm glow */}
            <div className="absolute -inset-[5px] rounded-full bg-[#F59E0B]/30 blur-md" />
            {/* Gold border — relative so IdentityVerifiedTick anchors to it */}
            <div className="relative rounded-full bg-gradient-to-br from-[#F59E0B] via-[#FFAE26] to-[#D97706] p-[3px]">
              <div className="h-[96px] w-[96px] overflow-hidden rounded-full bg-gradient-to-br from-[#0D6060] to-[#0A4A4A]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-cormorant text-[36px] font-bold text-[#F8F6F1]">
                    {initials}
                  </div>
                )}
              </div>
              {/* Verified tick sits on the bottom-right of the gold ring */}
              {showIdentityVerified && <IdentityVerifiedTick size="sm" />}
            </div>
          </div>

          {/* Name / designation / location */}
          <div className="min-w-0 flex-1">
            <h3 className="font-cormorant text-[22px] font-bold leading-tight tracking-[0.015em] text-white md:text-[24px]">
              {name}
            </h3>
            <p className="mt-0.5 font-poppins text-[11px] font-semibold tracking-wide text-[#F59E0B]">
              {title}
            </p>
            <p className="mt-1.5 flex items-center gap-1 font-poppins text-[10px] font-medium text-white/70">
              <MapPin className="h-3 w-3 shrink-0 text-[#F59E0B]/80" />
              <span className="min-w-0 line-clamp-1 uppercase tracking-wider">{location}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Body: warm cream ── */}
      <div className="bg-[#F8F6F1] px-4 pb-3 pt-2.5">

        {/* Split panel: YVITY Score ring (left) | Service pills stacked (right) */}
        <div className="mb-2 flex items-stretch overflow-hidden rounded-2xl border border-[#0A4A4A]/10 bg-white shadow-[0_1px_6px_rgba(10,74,74,0.05)]">

          {/* Left — score ring */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 px-3 py-2.5">
            <ScoreDial score={numScore} size={90} gradId={gradId} />
            <p className="font-poppins text-[8px] font-bold uppercase tracking-[0.1em] text-[#0A4A4A]/40">
              YVITY Score
            </p>
          </div>

          {/* Vertical divider */}
          <div className="w-px self-stretch bg-gradient-to-b from-transparent via-[#0A4A4A]/10 to-transparent" />

          {/* Right — service pills stacked vertically */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-3 py-2.5">
            {serviceTypes.slice(0, 3).map((label) => {
              const Icon = SERVICE_ICON_MAP[label] ?? Shield;
              return (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-[#0A4A4A]/12 bg-[#F8F6F1] px-2.5 py-1 shadow-[0_1px_3px_rgba(10,74,74,0.05)]"
                >
                  <Icon className="h-3 w-3 shrink-0 text-[#F59E0B]" strokeWidth={1.8} />
                  <span className="font-poppins text-[10px] font-medium text-[#0A4A4A]">{label}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Stats — 4-column grid with dividers, tighter padding, larger text */}
        <div className="mb-2 grid grid-cols-4 divide-x divide-[#0A4A4A]/8 overflow-hidden rounded-2xl border border-[#0A4A4A]/10 bg-white shadow-[0_1px_6px_rgba(10,74,74,0.05)]">
          {statItems.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 px-1 py-2">
              <Icon className="h-3.5 w-3.5 text-[#F59E0B]" strokeWidth={1.8} />
              <p className="font-poppins text-[13px] font-bold leading-tight tabular-nums text-[#0A4A4A]">
                {value}
              </p>
              <p className="font-poppins text-[9px] font-medium leading-tight text-[#9CA3AF]">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={profileUrl}
          className="relative flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full py-2.5 shadow-[0_4px_16px_rgba(245,158,11,0.30)] transition-transform active:scale-[0.98]"
        >
          <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#FFAE26] to-[#D97706]" />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent" />
          <span className="relative z-10 flex items-center gap-1.5 font-poppins text-[13px] font-bold tracking-wide text-white">
            View Profile
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </motion.article>
  );
}

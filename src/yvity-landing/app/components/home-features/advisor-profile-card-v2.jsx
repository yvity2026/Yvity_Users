"use client";

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

const SERVICE_ICON_MAP = {
  "Life Insurance": Shield,
  "Health Insurance": HeartPulse,
  "General Insurance": Umbrella,
  "Mutual Funds": TrendingUp,
};

function ScoreDial({ score }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.75;
  const n = Math.min(100, Math.max(0, Number(score) || 0));
  const filled = (n / 100) * arcLen;

  return (
    <div className="relative h-[52px] w-[52px] shrink-0">
      <svg viewBox="0 0 52 52" width={52} height={52} aria-hidden>
        <defs>
          <linearGradient id="v2-arc-fill" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle
          cx="26" cy="26" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${arcLen} ${circ - arcLen}`}
          transform="rotate(135 26 26)"
        />
        {n > 0 && (
          <circle
            cx="26" cy="26" r={r}
            fill="none"
            stroke="url(#v2-arc-fill)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ - filled}`}
            transform="rotate(135 26 26)"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-poppins text-[14px] font-bold leading-none text-white">
          {Math.round(n)}
        </span>
        <span className="font-poppins text-[7px] font-medium text-white/50">/100</span>
      </div>
    </div>
  );
}

export function AdvisorProfileCardV2({
  name = "Krishna Mohan Noti",
  title = "Advisor",
  location = "Nellore, Andhra Pradesh",
  score = 53,
  exp = "7+",
  avgRating = "5.0",
  clients = "397",
  recs = "0",
  avatarUrl,
  showVerified = true,
  serviceTypes = ["General Insurance", "Life Insurance", "Health Insurance"],
  profileUrl = "#",
}) {
  const numScore = Math.min(100, Math.max(0, Number(score) || 0));
  const numRecs = Number(recs) || 0;
  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statItems = [
    { icon: Briefcase, value: `${exp} yrs`, label: "Experience" },
    { icon: Star,      value: String(avgRating), label: "Rating" },
    { icon: Users,     value: `${clients}+`,    label: "Clients" },
    { icon: ThumbsUp,  value: String(numRecs),  label: "Recs" },
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
      {/* ── Header: dark teal + golden rays ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "#0A4A4A", minHeight: 162 }}
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

        {/* YVITY Score dial — top right */}
        <div className="absolute right-3 top-3 flex flex-col items-center gap-0.5">
          <ScoreDial score={numScore} />
          <p className="font-poppins text-[7px] font-bold uppercase tracking-[0.1em] text-white/45">
            YVITY Score
          </p>
        </div>

        {/* Verified pill — top left */}
        {showVerified && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 backdrop-blur-sm">
            <Image
              src="/brand/yvity-logo.png"
              alt="YVITY"
              width={12}
              height={12}
              className="h-3 w-3 shrink-0 object-contain brightness-0 invert"
            />
            <span className="font-poppins text-[9px] font-bold tracking-wide text-white">
              Verified Advisor
            </span>
          </div>
        )}

        {/* Centered avatar */}
        <div className="flex justify-center pb-5 pt-[52px]">
          <div className="relative">
            {/* Gold ambient glow */}
            <div className="absolute -inset-[7px] rounded-full bg-[#F59E0B]/22 blur-md" />
            {/* Gold border ring */}
            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-[#F59E0B] via-[#FFAE26] to-[#D97706]" />
            {/* Photo / initials */}
            <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full bg-gradient-to-br from-[#0D6060] to-[#0A4A4A]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-cormorant text-[30px] font-bold text-[#F8F6F1]">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body: warm cream ── */}
      <div className="bg-[#F8F6F1] px-4 pb-4 pt-3">
        {/* Name / designation / location */}
        <div className="mb-3 text-center">
          <h3 className="font-cormorant text-[22px] font-bold leading-snug tracking-[0.01em] text-[#0A4A4A]">
            {name}
          </h3>
          <p className="font-poppins text-[11px] font-semibold text-[#F59E0B]">{title}</p>
          <p className="mt-1 flex items-center justify-center gap-1 font-poppins text-[10px] font-medium text-[#6B7280]">
            <MapPin className="h-3 w-3 shrink-0 text-[#F59E0B]" />
            <span className="uppercase tracking-[0.06em]">{location}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="mb-3 h-px w-full bg-gradient-to-r from-transparent via-[#0A4A4A]/10 to-transparent" />

        {/* Service pills */}
        {serviceTypes.length > 0 && (
          <div className="mb-3 flex flex-wrap justify-center gap-1.5">
            {serviceTypes.slice(0, 3).map((label) => {
              const Icon = SERVICE_ICON_MAP[label] ?? Shield;
              return (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-[#0A4A4A]/12 bg-white px-2.5 py-1 shadow-[0_1px_4px_rgba(10,74,74,0.06)]"
                >
                  <Icon className="h-3 w-3 shrink-0 text-[#F59E0B]" strokeWidth={1.8} />
                  <span className="font-poppins text-[10px] font-medium text-[#0A4A4A]">{label}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Stats — 4-column grid with dividers */}
        <div className="mb-3 grid grid-cols-4 divide-x divide-[#0A4A4A]/8 overflow-hidden rounded-2xl border border-[#0A4A4A]/10 bg-white shadow-[0_1px_6px_rgba(10,74,74,0.05)]">
          {statItems.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 px-1 py-2.5">
              <Icon className="h-3.5 w-3.5 text-[#F59E0B]" strokeWidth={1.8} />
              <p className="font-poppins text-[12px] font-bold leading-tight tabular-nums text-[#0A4A4A]">
                {value}
              </p>
              <p className="font-poppins text-[8px] font-medium leading-tight text-[#9CA3AF]">
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

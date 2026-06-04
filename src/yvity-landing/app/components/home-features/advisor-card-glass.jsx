"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  ChevronRight,
  Diamond,
  Heart,
  MapPin,
  Network,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react";
import BrandMark from "@/yvity-landing/components/brand/BrandMark";
import { formatExperienceDisplay } from "@/yvity-landing/lib/advisor/publicMetrics";
import { usePrefersReducedMotion } from "@/yvity-landing/hooks/usePrefersReducedMotion";
import { AdvisorScoreAvatarRing } from "./advisor-score-avatar-ring";

const SERVICE_OPTIONS = [
  { key: "Life Insurance", label: "Life", icon: Heart },
  { key: "Health Insurance", label: "Health", icon: Shield },
  { key: "General Insurance", label: "General", icon: Briefcase },
];

function formatExpShort(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "—";
  if (numeric < 1) return `${numeric.toFixed(1)}Y`;
  return `${Math.floor(numeric)}Y`;
}

function formatCount(value) {
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return String(value || "—");
  return numeric >= 100 ? `${Math.floor(numeric)}+` : String(value);
}

function scoreTierLabel(score) {
  const n = Number(score) || 0;
  if (n >= 90) return "Top 5% Advisor";
  if (n >= 80) return "Top 10% Advisor";
  if (n >= 70) return "Top 25% Advisor";
  return "Verified Advisor";
}

function GlassStatCell({ icon: Icon, value, label }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2.5">
      <Icon className="h-4 w-4 text-[#2DD4BF]" strokeWidth={1.75} />
      <span className="font-poppins text-[15px] font-bold leading-none text-white">
        {value}
      </span>
      <span className="text-center font-poppins text-[9px] leading-tight text-white/55">
        {label}
      </span>
    </div>
  );
}

export function AdvisorCardGlass({
  name,
  title,
  location,
  score,
  scoreLabel,
  exp,
  reviews,
  recs,
  clients,
  tags = [],
  avatarUrl,
  profileUrl,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const initials = (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeTags = useMemo(
    () =>
      SERVICE_OPTIONS.filter(({ key }) =>
        tags.some((t) => t === key || t.startsWith(key.split(" ")[0])),
      ),
    [tags],
  );

  const displayTags =
    activeTags.length > 0 ? activeTags : SERVICE_OPTIONS;

  const tierLabel = scoreLabel || scoreTierLabel(numericScore);

  const ctaInner = (
    <>
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-[#0A4A4A] via-[#0D6060] to-[#14B8A6]" />
      <span className="pointer-events-none absolute inset-[1px] rounded-full border border-[#2DD4BF]/45" />
      <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_20px_rgba(45,212,191,0.25)]" />
      <span className="relative z-10 flex w-full items-center gap-3 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10">
          <User className="h-4 w-4 text-white" strokeWidth={2} />
        </span>
        <span className="flex-1 text-left font-poppins text-[14px] font-semibold text-white">
          View Profile
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-white/90" strokeWidth={2.5} />
      </span>
    </>
  );

  return (
    <motion.article
      className="advisor-glass-premium mx-auto w-full max-w-[min(100%,380px)]"
      {...(reducedMotion ? {} : { whileHover: { y: -4 } })}
    >
      <div className="advisor-glass-premium-frame relative overflow-hidden rounded-[26px] p-[1.5px]">
        <div className="advisor-glass-premium-body relative flex flex-col overflow-hidden rounded-[24.5px] px-4 pb-4 pt-3.5">
          {/* Ambient bokeh */}
          <span
            className="pointer-events-none absolute -left-8 top-16 h-28 w-28 rounded-full bg-[#2DD4BF]/12 blur-2xl"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -right-6 bottom-24 h-24 w-24 rounded-full bg-[#F59E0B]/10 blur-2xl"
            aria-hidden
          />

          {/* Header */}
          <header className="relative z-10 flex items-center justify-between gap-2">
            <BrandMark
              logoSize={34}
              showName
              className="min-w-0"
              logoClassName="h-8 w-8 shrink-0 object-contain"
              nameClassName="font-cormorant text-[17px] font-bold uppercase leading-none tracking-wide text-white"
            />
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#F59E0B]/75 bg-[#0A4A4A]/40 px-2 py-1 font-poppins text-[8px] font-bold uppercase tracking-[0.06em] text-[#F59E0B] shadow-[0_0_14px_rgba(245,158,11,0.25)]">
              <Image
                src="/svgs/home/advisor_card/verified.svg"
                alt=""
                width={11}
                height={11}
                className="h-2.5 w-2.5"
              />
              Verified Advisor
            </span>
          </header>

          {/* Avatar */}
          <div className="relative z-10 mt-4 flex flex-col items-center">
            <div className="relative">
              <span
                className="pointer-events-none absolute -inset-2 rounded-full bg-[#F59E0B]/35 blur-lg"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-b from-[#FFE082]/80 via-[#F59E0B]/50 to-transparent opacity-90"
                aria-hidden
              />
              <AdvisorScoreAvatarRing score={numericScore} maskColor="#0A4A4A">
                <div className="relative rounded-full bg-gradient-to-br from-[#FFD54F] via-[#F59E0B] to-[#D97706] p-[3px] shadow-[0_0_28px_rgba(245,158,11,0.55)]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-[88px] w-[88px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gradient-to-br from-[#0A4A4A] to-[#0D6060] font-cormorant text-3xl font-bold text-white">
                      {initials}
                    </div>
                  )}
                </div>
              </AdvisorScoreAvatarRing>
            </div>

            <h3 className="mt-3 text-center font-poppins text-[18px] font-bold leading-tight text-white">
              {name}
            </h3>
            <p className="mt-1 text-center font-poppins text-[12px] font-medium text-[#2DD4BF]">
              {title}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 font-poppins text-[11px] text-white/75">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#2DD4BF]" />
              <span className="line-clamp-2 text-center">{location}</span>
            </p>
          </div>

          {/* Service pills */}
          <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
            {displayTags.map(({ key, label, icon: Icon }) => (
              <span
                key={key}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#2DD4BF]/35 bg-[#0A4A4A]/35 px-2 py-2 font-poppins text-[11px] font-semibold text-[#2DD4BF] backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                {label}
              </span>
            ))}
          </div>

          {/* YVITY Score — gold frame */}
          <div className="relative z-10 mt-4 overflow-hidden rounded-xl border-2 border-[#FFD54F]/85 bg-[#062626]/70 p-3 shadow-[0_0_22px_rgba(255,213,79,0.22),inset_0_1px_0_rgba(255,213,79,0.15)]">
            <div className="flex items-stretch gap-3">
              <div className="flex shrink-0 flex-col items-center justify-center">
                <span className="flex h-10 w-10 rotate-45 items-center justify-center rounded-md border border-[#F59E0B]/70 bg-[#0A4A4A]/80 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  <Diamond
                    className="-rotate-45 h-4 w-4 text-[#FFD54F]"
                    strokeWidth={2}
                    fill="#FFD54F"
                    fillOpacity={0.35}
                  />
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="font-poppins text-[9px] font-bold uppercase tracking-[0.18em] text-[#FFD54F]">
                  YVITY Score
                </p>
                <p className="font-poppins text-[36px] font-bold leading-none text-white">
                  {numericScore}
                </p>
              </div>
              <div className="flex min-w-0 max-w-[38%] flex-col justify-center border-l border-white/15 pl-3">
                <p className="font-poppins text-[11px] font-bold leading-snug text-[#FFD54F]">
                  {tierLabel}
                </p>
                <p className="mt-0.5 font-poppins text-[9px] leading-tight text-white/60">
                  Trusted by YVITY
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative z-10 mt-3 flex overflow-hidden rounded-xl border border-[#2DD4BF]/30 bg-[#062626]/55">
            <GlassStatCell
              icon={Calendar}
              value={formatExpShort(exp) || formatExperienceDisplay(exp)}
              label="Experience"
            />
            <div className="w-px shrink-0 bg-white/10" aria-hidden />
            <GlassStatCell
              icon={Users}
              value={formatCount(clients)}
              label="Clients"
            />
            <div className="w-px shrink-0 bg-white/10" aria-hidden />
            <GlassStatCell icon={Star} value={reviews || "—"} label="Rating" />
            <div className="w-px shrink-0 bg-white/10" aria-hidden />
            <GlassStatCell
              icon={Network}
              value={formatCount(recs)}
              label="Connections"
            />
          </div>

          {/* CTA */}
          <div className="relative z-10 mt-4">
            {profileUrl ? (
              <Link
                href={profileUrl}
                className="relative flex w-full overflow-hidden rounded-full"
              >
                {ctaInner}
              </Link>
            ) : (
              <button type="button" className="relative flex w-full overflow-hidden rounded-full">
                {ctaInner}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

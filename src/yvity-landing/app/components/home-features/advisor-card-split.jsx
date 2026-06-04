"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  HeartPulse,
  MapPin,
  Shield,
  Star,
  ThumbsUp,
  Umbrella,
  Users,
} from "lucide-react";
import { YvityScoreInfoTip } from "@/yvity-landing/components/brand/YvityScoreInfoTip";
import { formatExperienceDisplay } from "@/yvity-landing/lib/advisor/publicMetrics";
import { usePrefersReducedMotion } from "@/yvity-landing/hooks/usePrefersReducedMotion";
import { AdvisorScoreAvatarRing } from "./advisor-score-avatar-ring";

const SERVICE_ICONS = {
  "Life Insurance": Shield,
  "Health Insurance": HeartPulse,
  "General Insurance": Umbrella,
};

function formatExpLabel(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return formatExperienceDisplay(value).replace("yrs", "y").toUpperCase();
  }
  if (numeric < 1) return `${numeric.toFixed(1)}y`;
  return `${Math.floor(numeric)}+y`;
}

function ServicePill({ label }) {
  const Icon = SERVICE_ICONS[label] ?? Shield;
  return (
    <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#0A4A4A]/10 bg-[#ECFDF5] px-3.5 py-2 font-poppins text-[11px] font-semibold leading-snug tracking-[0.02em] text-[#0A4A4A] shadow-[0_0_0_1px_rgba(45,212,191,0.15)] md:gap-1 md:px-3 md:py-1.5 md:text-[10px]">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#0A4A4A]" strokeWidth={2} />
      {label}
    </span>
  );
}

function StatTile({ icon: Icon, value, label }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-[#E5E7EB]/80 bg-white px-1 py-3 shadow-[0_2px_10px_rgba(10,74,74,0.06)] md:py-2.5">
      <Icon className="h-4 w-4 text-[#F59E0B]" strokeWidth={2} />
      <span className="font-poppins text-[12px] font-bold leading-none text-[#0A4A4A] md:text-[11px]">
        {value}
      </span>
      <span className="font-poppins text-[10px] font-semibold uppercase tracking-[0.06em] text-[#4B5563] md:text-[8px] md:tracking-wide md:text-[#6B7280]">
        {label}
      </span>
    </div>
  );
}

export function AdvisorCardSplit({
  name,
  title,
  location,
  score,
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

  const serviceTags = useMemo(() => {
    const services = ["Life Insurance", "Health Insurance", "General Insurance"].filter(
      (label) => tags.includes(label),
    );
    return services.length > 0
      ? services
      : ["Life Insurance", "Health Insurance", "General Insurance"];
  }, [tags]);

  return (
    <motion.article
      className="relative mx-auto w-full max-w-[min(100%,380px)] antialiased"
      {...(reducedMotion ? {} : { whileHover: { y: -3 } })}
    >
      {/* Gold corner accents */}
      <span
        className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[#F59E0B]/70"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[#F59E0B]/70"
        aria-hidden
      />

      <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_16px_40px_rgba(10,74,74,0.14)]">
        {/* Bright header */}
        <div className="bg-gradient-to-br from-[#2DD4BF] via-[#14B8A6] to-[#0D9488] px-4 pb-4 pt-4">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <AdvisorScoreAvatarRing score={numericScore} maskColor="#14B8A6">
                <div className="rounded-full bg-gradient-to-br from-[#F59E0B] via-[#FBBF24] to-[#D97706] p-[2px] shadow-[0_4px_14px_rgba(245,158,11,0.35)]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-[72px] w-[72px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#0A4A4A] font-cormorant text-2xl font-bold text-white">
                      {initials}
                    </div>
                  )}
                </div>
              </AdvisorScoreAvatarRing>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow ring-2 ring-white">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-[#0A4A4A] ring-1 ring-[#F59E0B]">
                  <Image
                    src="/svgs/home/advisor_card/verified.svg"
                    alt=""
                    width={12}
                    height={12}
                    className="h-3 w-3"
                  />
                </span>
              </span>
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <h3 className="font-cormorant text-[21px] font-bold leading-[1.12] tracking-[0.02em] text-white drop-shadow-sm md:text-[22px]">
                {name}
              </h3>
              <p className="mt-0.5 font-poppins text-[12px] font-semibold italic tracking-wide text-[#ECFDF5] md:font-medium">
                {title}
              </p>
              <p className="mt-1.5 flex items-start gap-1 font-poppins text-[12px] font-medium leading-snug text-white/90 md:text-[11px]">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span className="line-clamp-2">{location}</span>
              </p>
            </div>
          </div>
        </div>

        {/* White body */}
        <div className="space-y-3 px-4 pb-4 pt-3.5">
          {/* Service pills — 2 + 1 layout */}
          <div className="flex flex-wrap justify-center gap-2">
            {serviceTags.slice(0, 2).map((label) => (
              <ServicePill key={label} label={label} />
            ))}
          </div>
          {serviceTags[2] ? (
            <div className="flex justify-center">
              <ServicePill label={serviceTags[2]} />
            </div>
          ) : null}

          {/* YVITY Score */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-poppins text-[13px] font-semibold tracking-wide text-[#0A4A4A] md:text-[12px]">
                  YVITY Score
                </span>
                <YvityScoreInfoTip buttonClassName="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#D1D5DB] text-[#9CA3AF] transition hover:border-[#F59E0B]/50 hover:text-[#F59E0B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/35" />
              </div>
              <p className="font-cormorant text-[26px] font-bold leading-none tabular-nums text-[#0A4A4A] md:text-[22px]">
                {numericScore}
                <span className="text-[15px] font-semibold text-[#9CA3AF] md:text-[14px]"> /100</span>
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#92400E]"
                initial={
                  reducedMotion ? { width: `${numericScore}%` } : { width: 0 }
                }
                whileInView={{ width: `${numericScore}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-1.5">
            <StatTile icon={Briefcase} value={formatExpLabel(exp)} label="Exp" />
            <StatTile icon={Star} value={reviews ?? "—"} label="Reviews" />
            <StatTile icon={ThumbsUp} value={recs ?? "—"} label="Recs" />
            <StatTile icon={Users} value={clients ?? "—"} label="Clients" />
          </div>

          {/* CTA */}
          {profileUrl ? (
            <Link
              href={profileUrl}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0A4A4A] py-3 font-poppins text-[14px] font-bold tracking-wide text-[#F59E0B] shadow-[0_6px_18px_rgba(10,74,74,0.25)] transition-transform active:scale-[0.98] md:text-[13px] md:font-semibold md:tracking-normal"
            >
              View Full Profile
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          ) : (
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0A4A4A] py-3 font-poppins text-[14px] font-bold tracking-wide text-[#F59E0B] shadow-[0_6px_18px_rgba(10,74,74,0.25)] md:text-[13px] md:font-semibold md:tracking-normal"
            >
              View Full Profile
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

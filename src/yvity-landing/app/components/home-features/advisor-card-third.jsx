"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useId, useMemo } from "react";
import { MapPin, Shield, Star, Stethoscope, Umbrella, User, Users, ThumbsUp, Briefcase, ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/yvity-landing/hooks/usePrefersReducedMotion";
import { formatExperienceDisplay } from "@/yvity-landing/lib/advisor/publicMetrics";
import { AdvisorScoreAvatarRing } from "./advisor-score-avatar-ring";

const SERVICE_ICONS = {
  "Life Insurance": Shield,
  "Health Insurance": Stethoscope,
  "General Insurance": Umbrella,
};

export function AdvisorCardThird({
  name,
  title,
  location,
  score,
  scoreLabel = "Highly Credible",
  exp,
  reviews,
  recs,
  clients,
  tags = [],
  avatarUrl,
  profileUrl,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const ringId = useId().replace(/:/g, "");
  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const initials = (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const serviceTags = useMemo(
    () =>
      ["Life Insurance", "Health Insurance", "General Insurance"].filter((label) =>
        tags.includes(label),
      ),
    [tags],
  );

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (numericScore / 100) * circumference;

  return (
    <motion.article
      className="mx-auto w-full max-w-[380px] rounded-[28px] border border-[#C5A059]/50 bg-white p-3 shadow-[0_12px_32px_rgba(10,74,74,0.14)]"
      {...(reducedMotion ? {} : { whileHover: { y: -4 } })}
    >
      <div className="rounded-[22px] border border-[#F59E0B]/35 bg-[#F8F6F1] p-3.5">
        <div className="flex items-start gap-3">
          <AdvisorScoreAvatarRing score={numericScore} maskColor="#F8F6F1">
            <div className="rounded-full border-2 border-[#F59E0B] p-[2px]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-[62px] w-[62px] rounded-full object-cover"
                />
              ) : (
                <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#0A4A4A] font-cormorant text-2xl font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
          </AdvisorScoreAvatarRing>
          <div className="min-w-0 flex-1">
            <h3 className="font-cormorant text-[24px] font-bold leading-none text-[#0A4A4A]">
              {name}
            </h3>
            <p className="mt-1 font-poppins text-[12px] font-semibold text-[#F59E0B]">
              {title}
            </p>
            <p className="mt-1 flex items-center gap-1 font-poppins text-[11px] text-[#6B7280]">
              <MapPin className="h-3.5 w-3.5 text-[#0A4A4A]" />
              <span className="line-clamp-1">{location}</span>
            </p>
          </div>
        </div>

        <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-[#F59E0B]/45 to-transparent" />

        <div className="grid grid-cols-3 gap-2">
          {serviceTags.map((tag) => {
            const Icon = SERVICE_ICONS[tag] ?? Shield;
            return (
              <div
                key={tag}
                className="flex items-center justify-center gap-1 rounded-xl border border-[#E5E0D6] bg-white px-1 py-2 text-center"
              >
                <Icon className="h-3.5 w-3.5 text-[#0A4A4A]" />
                <span className="text-[9px] font-semibold leading-tight text-[#0A4A4A]">
                  {tag.replace(" Insurance", "")}
                </span>
              </div>
            );
          })}
        </div>

        <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-[#F59E0B]/35 to-transparent" />

        <div className="rounded-2xl border border-[#E8E4DC] bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
                YVITY Score
              </p>
              <p className="text-[14px] font-bold text-[#F59E0B]">{scoreLabel}</p>
            </div>
            <div className="relative h-[66px] w-[66px]">
              <svg width="66" height="66" className="-rotate-90">
                <circle cx="33" cy="33" r={radius} fill="none" stroke="#E5E0D6" strokeWidth="4" />
                <motion.circle
                  cx="33"
                  cy="33"
                  r={radius}
                  fill="none"
                  stroke={`url(#${ringId})`}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={
                    reducedMotion
                      ? { strokeDashoffset: dashOffset }
                      : { strokeDashoffset: circumference }
                  }
                  whileInView={{ strokeDashoffset: dashOffset }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#0A4A4A" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[14px] font-bold text-[#0A4A4A]">
                {numericScore}
              </div>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5E0D6]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#0A4A4A]"
              initial={reducedMotion ? { width: `${numericScore}%` } : { width: 0 }}
              whileInView={{ width: `${numericScore}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          <StatBox icon={Briefcase} value={formatExperienceDisplay(exp)} label="Exp" />
          <StatBox icon={Star} value={reviews} label="Rating" />
          <StatBox icon={Users} value={clients} label="Clients" />
          <StatBox icon={ThumbsUp} value={recs} label="Recs" />
        </div>

        {profileUrl ? (
          <Link
            href={profileUrl}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] py-2.5 text-sm font-semibold text-white"
          >
            <User className="h-4 w-4" />
            View Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] py-2.5 text-sm font-semibold text-white"
          >
            <User className="h-4 w-4" />
            View Profile
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.article>
  );
}

function StatBox({ icon: Icon, value, label }) {
  return (
    <div className="rounded-xl border border-[#E5E0D6] bg-white p-1.5 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-[#F59E0B]" />
      <p className="mt-1 text-[10px] font-bold leading-none text-[#0A4A4A]">{value}</p>
      <p className="mt-0.5 text-[8px] text-[#6B7280]">{label}</p>
    </div>
  );
}


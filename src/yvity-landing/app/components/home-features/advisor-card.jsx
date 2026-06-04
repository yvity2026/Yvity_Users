"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  HeartPulse,
  MapPin,
  Shield,
  Star,
  ThumbsUp,
  Trophy,
  Umbrella,
  User,
  Users,
} from "lucide-react";
import { formatExperienceDisplay } from "@/yvity-landing/lib/advisor/publicMetrics";
import { usePrefersReducedMotion } from "@/yvity-landing/hooks/usePrefersReducedMotion";
import { AdvisorCardBrandHeader } from "./advisor-card-brand-header";
import { AdvisorScoreAvatarRing } from "./advisor-score-avatar-ring";

const SERVICE_TAGS = new Set([
  "Life Insurance",
  "Health Insurance",
  "General Insurance",
]);

const ACHIEVEMENT_TAGS = new Set([
  "MDRT",
  "COT",
  "TOT",
  "Founding Advisor",
  "Founding Member",
]);

const SERVICE_ICONS = {
  "Life Insurance": Shield,
  "Health Insurance": HeartPulse,
  "General Insurance": Umbrella,
};

const BADGE_ICONS = {
  MDRT: Trophy,
  COT: Trophy,
  TOT: Trophy,
  "Founding Advisor": Star,
  "Founding Member": Star,
};

function GoldHairline() {
  return (
    <div
      className="h-px w-full bg-gradient-to-r from-transparent via-[#F59E0B]/45 to-transparent"
      aria-hidden
    />
  );
}

function ServiceMiniCard({ label }) {
  const Icon = SERVICE_ICONS[label] ?? Shield;
  const short =
    label === "Life Insurance"
      ? "Life"
      : label === "Health Insurance"
        ? "Health"
        : label === "General Insurance"
          ? "General"
          : label.split(" ")[0];

  return (
    <div className="flex h-full min-h-[56px] w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#E5E0D6] bg-[#F4F7F6] px-2 py-2.5 shadow-[0_2px_8px_rgba(10,74,74,0.05)] sm:min-h-[58px] sm:gap-2 sm:px-2.5">
      <Icon
        className="h-[18px] w-[18px] shrink-0 text-[#0A4A4A] sm:h-5 sm:w-5"
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1 text-left font-poppins leading-tight">
        <span className="block text-[11px] font-semibold text-[#0A4A4A] sm:text-xs">
          {short}
        </span>
        <span className="block text-[10px] font-medium text-[#6B7280] sm:text-[11px]">
          Insurance
        </span>
      </span>
    </div>
  );
}

function BadgeCard({ tag }) {
  const Icon = BADGE_ICONS[tag] ?? Star;
  const isMdrt = tag === "MDRT" || tag.startsWith("MDRT");

  return (
    <div className="flex min-h-[30px] flex-1 items-center justify-center gap-1 rounded-full bg-[#FFF9E8] px-2.5 py-1.5 ring-1 ring-[#F59E0B]/18 shadow-[0_1px_4px_rgba(245,158,11,0.08)]">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#F59E0B]" strokeWidth={2} />
      <span className="font-poppins text-[9px] font-semibold text-[#0A4A4A] sm:text-[10px]">
        {tag}
      </span>
      {isMdrt ? (
        <span className="rounded-full bg-[#1A3C34] px-1 py-0.5 font-poppins text-[7px] font-bold text-white">
          x2
        </span>
      ) : null}
    </div>
  );
}

function ScoreGauge({ score, reducedMotion, gradientId, compact = false }) {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  const size = compact ? 62 : 72;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeScore / 100) * circumference;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${
        compact ? "h-[62px] w-[62px]" : "h-[72px] w-[72px]"
      }`}
      aria-hidden
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E0D6"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={
            reducedMotion
              ? { strokeDashoffset: dashOffset }
              : { strokeDashoffset: circumference }
          }
          whileInView={{ strokeDashoffset: dashOffset }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#0A4A4A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-poppins">
        <span className="text-[20px] font-bold leading-none text-[#0A4A4A]">
          {safeScore}
        </span>
        <span className="text-[8px] font-semibold text-[#6B7280]">/100</span>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl border border-[#E5E0D6] bg-white px-1 py-2 shadow-[0_2px_8px_rgba(10,74,74,0.06)] sm:py-2.5">
      <Icon className="h-3.5 w-3.5 text-[#F59E0B]" strokeWidth={2} />
      <span className="font-poppins text-[10px] font-bold leading-none text-[#0A4A4A]">
        {value}
      </span>
      <span className="text-center font-poppins text-[8px] leading-tight text-[#6B7280]">
        {label}
      </span>
    </div>
  );
}

export const AdvisorCard = ({
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
  isButtonHover = false,
  ButtonText,
  avatarUrl,
  profileUrl,
  showVerifiedBadge = true,
}) => {
  const reducedMotion = usePrefersReducedMotion();
  const scoreGradientId = useId().replace(/:/g, "");

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));

  const { serviceTags, achievementTags } = useMemo(() => {
    const service = [];
    const achievement = [];
    const other = [];

    for (const tag of tags) {
      if (SERVICE_TAGS.has(tag)) service.push(tag);
      else if (ACHIEVEMENT_TAGS.has(tag) || tag.startsWith("MDRT"))
        achievement.push(tag);
      else other.push(tag);
    }

    const orderedServices = [
      "Life Insurance",
      "Health Insurance",
      "General Insurance",
    ].filter((label) => service.includes(label));
    const extraServices = [...service, ...other].filter(
      (t) => !orderedServices.includes(t),
    );

    return {
      serviceTags: [...orderedServices, ...extraServices].slice(0, 3),
      achievementTags: achievement.slice(0, 2),
    };
  }, [tags]);

  const hasServices = serviceTags.length > 0;
  const hasBadges = achievementTags.length > 0;

  const cardMotion = reducedMotion
    ? {}
    : {
        whileHover: { y: -4, transition: { duration: 0.35, ease: "easeOut" } },
      };

  const ctaLabel = ButtonText || "View Profile";

  const ctaInner = (
    <>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F59E0B] via-[#FFAE26] to-[#D97706]" />
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
      <span className="relative z-10 flex w-full items-center justify-center gap-2.5 px-1">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/35">
          <User className="h-4 w-4 text-white" strokeWidth={2} />
        </span>
        <span className="flex flex-1 items-center justify-center gap-1.5 font-poppins text-[13px] font-bold text-white sm:text-sm">
          {ctaLabel}
          <ArrowRight className="h-4 w-4 shrink-0" />
        </span>
      </span>
    </>
  );

  const ctaClassName =
    "group/btn relative flex w-full shrink-0 overflow-hidden rounded-full py-2.5 shadow-[0_8px_22px_rgba(217,119,6,0.35)] transition-transform active:scale-[0.98] sm:py-3";

  return (
    <motion.article
      {...cardMotion}
      className="mx-auto h-full w-full max-w-[360px] sm:max-w-[400px]"
    >
      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#F59E0B]/40 bg-white shadow-[0_12px_36px_rgba(10,74,74,0.1)] sm:rounded-[28px] ${
          isButtonHover ? "ring-1 ring-[#F59E0B]/50" : ""
        }`}
      >
        {showVerifiedBadge ? (
          <AdvisorCardBrandHeader variant="dark" />
        ) : null}

        <div className="flex flex-col p-3.5 sm:p-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="relative shrink-0">
              <AdvisorScoreAvatarRing score={numericScore} maskColor="#ffffff">
                <div className="rounded-full bg-gradient-to-br from-[#F59E0B] via-[#E8C872] to-[#C5A059] p-[2px] shadow-[0_3px_12px_rgba(197,160,89,0.28)]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-[52px] w-[52px] rounded-full object-cover bg-[#115e59] sm:h-[58px] sm:w-[58px]"
                    />
                  ) : (
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#0A4A4A] to-[#0D6060] font-cormorant text-lg font-bold text-[#F8F6F1] sm:h-[58px] sm:w-[58px] sm:text-xl">
                      {initials}
                    </div>
                  )}
                </div>
              </AdvisorScoreAvatarRing>
              {showVerifiedBadge ? (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow ring-2 ring-white sm:h-[18px] sm:w-[18px]">
                  <Image
                    src="/svgs/home/advisor_card/verified.svg"
                    alt=""
                    width={12}
                    height={12}
                    className="h-3 w-3"
                  />
                </span>
              ) : null}
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="font-cormorant text-[19px] font-bold leading-tight text-[#1A3C34] sm:text-[21px]">
                {name}
              </h3>
              <p className="mt-0.5 font-poppins text-[11px] font-medium text-[#C5A059] sm:text-xs">
                {title}
              </p>
              <p className="mt-1 flex items-start gap-1 font-poppins text-[10px] text-[#6B7280] sm:text-[11px]">
                <MapPin className="mt-px h-3 w-3 shrink-0 text-[#0A4A4A]/70" />
                <span className="line-clamp-2">{location}</span>
              </p>
            </div>
          </div>

          <div className="my-2.5">
            <GoldHairline />
          </div>

          {hasServices ? (
            <div
              className={`grid w-full gap-2 ${
                serviceTags.length === 1
                  ? "grid-cols-1"
                  : serviceTags.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {serviceTags.map((tag) => (
                <ServiceMiniCard key={tag} label={tag} />
              ))}
            </div>
          ) : null}

          {hasServices && hasBadges ? (
            <div className="my-2.5">
              <GoldHairline />
            </div>
          ) : null}

          {hasBadges ? (
            <div className="flex gap-1 sm:gap-1">
              {achievementTags.map((tag) => (
                <BadgeCard key={tag} tag={tag} />
              ))}
            </div>
          ) : null}

          {(hasServices || hasBadges) ? (
            <div className="my-2.5">
              <GoldHairline />
            </div>
          ) : null}

          <div className="flex flex-col gap-3.5 sm:gap-4">
            <div className="rounded-2xl border border-[#E8E4DC] bg-[#F4F7F6] p-3 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] sm:p-3.5">
              <div className="flex items-center gap-2.5">
                <div className="min-w-0 flex-1">
                  <p className="font-poppins text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                    YVITY Score
                  </p>
                  <p className="mt-0.5 font-poppins text-[13px] font-bold text-[#C5A059]">
                    {scoreLabel}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E5E0D6]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #F59E0B 0%, #C5A059 45%, #0A4A4A 100%)",
                      }}
                      initial={
                        reducedMotion
                          ? { width: `${numericScore}%` }
                          : { width: 0 }
                      }
                      whileInView={{ width: `${numericScore}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <ScoreGauge
                  score={numericScore}
                  reducedMotion={reducedMotion}
                  gradientId={scoreGradientId}
                  compact
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              <StatTile
                icon={Briefcase}
                value={formatExperienceDisplay(exp)}
                label="Experience"
              />
              <StatTile
                icon={Star}
                value={reviews}
                label="Avg. rating"
              />
              <StatTile icon={Users} value={clients} label="Clients" />
              <StatTile icon={ThumbsUp} value={recs} label="Recs" />
            </div>

            {profileUrl ? (
              <Link href={profileUrl} className={ctaClassName}>
                {ctaInner}
              </Link>
            ) : (
              <button type="button" className={ctaClassName}>
                {ctaInner}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  HeartPulse,
  MapPin,
  Shield,
  Umbrella,
} from "lucide-react";
import { YvityScoreInfoTip } from "@/yvity-landing/components/brand/YvityScoreInfoTip";
import { AdvisorCardBrandHeader } from "./advisor-card-brand-header";
import { AdvisorScoreAvatarRing } from "./advisor-score-avatar-ring";

const SAFFRON = "#D4A017";
const TEAL = "#0A4A4A";
const BRIGHT_TEAL = "#028382";

const SERVICE_OPTIONS = [
  { key: "Life Insurance", label: "Life", icon: Shield },
  { key: "Health Insurance", label: "Health", icon: HeartPulse },
  { key: "General Insurance", label: "General", icon: Umbrella },
];

function formatExpShort(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "0Y";
  return `${Math.floor(n)}Y`;
}

function formatClients(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return n >= 100 ? `${Math.floor(n)}+` : String(Math.floor(n));
}

export function AdvisorCardPremiumMobile({
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
  ButtonText,
}) {
  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const numericScore = Math.min(100, Math.max(0, Number(score) || 0));
  const ctaLabel = ButtonText || "View Profile";

  const activeTagSet = useMemo(() => new Set(tags), [tags]);

  const stats = [
    { value: formatExpShort(exp), label: "Experience" },
    { value: formatClients(clients), label: "Clients" },
    { value: reviews ?? "0", label: "Reviews" },
    { value: recs ?? "0", label: "Recommends" },
  ];

  const ctaClassName =
    "group relative flex w-full items-center justify-center overflow-hidden rounded-2xl py-3.5 font-poppins text-[13px] font-semibold tracking-wide shadow-[0_12px_32px_rgba(10,74,74,0.28)] transition-transform active:scale-[0.98]";

  const ctaInner = (
    <>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A4A4A] via-[#0D5555] to-[#083F3F]" />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/14 to-transparent" />
      <span
        className="relative flex items-center gap-2"
        style={{ color: SAFFRON }}
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </span>
    </>
  );

  return (
    <article className="advisor-glass-card mx-auto w-full max-w-[min(100%,380px)]">
      <div className="relative overflow-hidden rounded-[28px] border border-[#0A4A4A]/10 bg-white p-[1.5px] shadow-[0_16px_40px_rgba(10,74,74,0.1)]">
        <div className="advisor-glass-card-inner relative flex flex-col rounded-[26.5px] bg-white px-4 pb-4 pt-3.5">

          {/* Header — logo + YVITY + tagline */}
          <AdvisorCardBrandHeader variant="light" />

          {/* Avatar hero + curved backdrop */}
          <div className="relative z-10 mt-2 flex flex-col items-center">
            <div
              className="pointer-events-none absolute left-1/2 top-1 h-[88px] w-[92%] max-w-[300px] -translate-x-1/2 rounded-[50%] border border-[#028382]/20 bg-gradient-to-b from-[#028382]/08 via-white/20 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-1/2 top-4 h-[72px] w-[78%] max-w-[260px] -translate-x-1/2 rounded-[50%] border border-[#D4A017]/15"
              aria-hidden
            />

            <AdvisorScoreAvatarRing
              score={numericScore}
              maskColor="#ffffff"
              className="relative mt-3 shadow-[0_0_32px_rgba(212,160,23,0.4),0_10px_28px_rgba(10,74,74,0.18)]"
            >
              <div
                className="rounded-full p-[3px]"
                style={{
                  background: `linear-gradient(135deg, ${SAFFRON}99, ${SAFFRON}33)`,
                }}
              >
                <div
                  className="rounded-full p-[2.5px]"
                  style={{ background: TEAL }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-[80px] w-[80px] rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-[80px] w-[80px] items-center justify-center rounded-full font-cormorant text-[28px] font-bold text-[#F8F6F1]"
                      style={{
                        background: `linear-gradient(145deg, ${TEAL}, #0D6060)`,
                      }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
              </div>
            </AdvisorScoreAvatarRing>
          </div>

          {/* Advisor info */}
          <div className="relative z-10 mt-3 text-center">
            <h3 className="font-cormorant text-[23px] font-bold leading-tight text-[#1A3C34]">
              {name}
            </h3>
            <p
              className="mt-0.5 font-poppins text-[12px] font-medium capitalize"
              style={{ color: SAFFRON }}
            >
              {title}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 font-poppins text-[11px] text-[#6B7280]">
              <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: TEAL }} />
              <span className="line-clamp-2">{location}</span>
            </p>
          </div>

          {/* Insurance tags */}
          <div className="relative z-10 mt-4">
            <p className="mb-2 text-center font-poppins text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              Insurance
            </p>
            <div className="flex justify-center gap-2">
              {SERVICE_OPTIONS.map(({ key, label, icon: Icon }) => {
                const active = activeTagSet.has(key);
                return (
                  <span
                    key={key}
                    className="inline-flex min-w-[72px] flex-1 max-w-[96px] items-center justify-center gap-1 rounded-xl border px-2 py-2 font-poppins text-[11px] font-semibold backdrop-blur-sm transition-colors"
                    style={{
                      color: active ? TEAL : "#9CA3AF",
                      background: active
                        ? "rgba(255,255,255,0.62)"
                        : "rgba(255,255,255,0.28)",
                      borderColor: active
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(255,255,255,0.45)",
                      boxShadow: active
                        ? "0 4px 14px rgba(10,74,74,0.08)"
                        : "none",
                    }}
                  >
                    <Icon
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: active ? SAFFRON : "#C4C4C4" }}
                      strokeWidth={2}
                    />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* YVITY Score — wireframe: label + info + 87/100 + progress bar */}
          <div
            className="relative z-10 mt-4 rounded-2xl border border-white/70 px-3.5 py-3 backdrop-blur-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(244,247,246,0.45) 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), 0 6px 20px rgba(10,74,74,0.06)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-poppins text-[12px] font-semibold text-[#1A3C34]">
                  YVITY Score
                </span>
                <YvityScoreInfoTip buttonClassName="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#D1D5DB]/80 bg-white/40 text-[#9CA3AF] transition hover:border-[#F59E0B]/50 hover:text-[#F59E0B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/35" />
              </div>
              <span
                className="font-cormorant text-[22px] font-bold leading-none"
                style={{ color: TEAL }}
              >
                {numericScore}
                <span className="text-[14px] font-semibold text-[#9CA3AF]">
                  /100
                </span>
              </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#E5E7EB]/80">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${numericScore}%`,
                  background: `linear-gradient(90deg, ${SAFFRON} 0%, #C5A059 45%, ${TEAL} 100%)`,
                  boxShadow: `0 0 10px ${SAFFRON}55`,
                }}
              />
            </div>
          </div>

          {/* Stat cards — 2×2 luxury glass tiles */}
          <div className="relative z-10 mt-3 grid grid-cols-2 gap-2">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center rounded-xl border border-white/75 px-2 py-2.5 backdrop-blur-sm"
                style={{
                  background: "rgba(255,255,255,0.48)",
                  boxShadow:
                    "0 4px 14px rgba(10,74,74,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
                }}
              >
                <span
                  className="font-poppins text-[13px] font-bold leading-none"
                  style={{ color: TEAL }}
                >
                  {value}
                </span>
                <span className="mt-1 font-poppins text-[9px] font-medium text-[#6B7280]">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="relative z-10 mt-4">
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
    </article>
  );
}

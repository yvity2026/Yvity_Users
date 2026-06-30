"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Award,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Gift,
  Link2,
  Loader2,
  Share2,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

// ── Constants (mirrored from API) ───────────────────────────────
const EXTENSION_TIERS = [
  { credits: 3000,  months: 1,  label: "1 Month" },
  { credits: 6000,  months: 2,  label: "2 Months" },
  { credits: 9000,  months: 3,  label: "3 Months" },
  { credits: 12000, months: 4,  label: "4 Months" },
  { credits: 15000, months: 6,  label: "6 Months" },
  { credits: 25000, months: 12, label: "1 Year FREE" },
];

const BADGE_TIERS = [
  { threshold: 5,   label: "Bronze",   color: "#CD7F32", bg: "from-[#78350F]/20 to-[#92400E]/10" },
  { threshold: 15,  label: "Silver",   color: "#94A3B8", bg: "from-[#334155]/20 to-[#475569]/10" },
  { threshold: 30,  label: "Gold",     color: "#F59E0B", bg: "from-[#78350F]/20 to-[#B45309]/10" },
  { threshold: 60,  label: "Platinum", color: "#C084FC", bg: "from-[#4C1D95]/20 to-[#6D28D9]/10" },
  { threshold: 100, label: "Diamond",  color: "#60A5FA", bg: "from-[#1E3A5F]/20 to-[#1D4ED8]/10" },
];

function fmt(n) { return Number(n || 0).toLocaleString("en-IN"); }

// ── Referral Code Card ──────────────────────────────────────────
function ReferralCodeCard({ code, link }) {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [link]);

  const shareLink = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join YVITY as an Insurance Advisor",
          text: `Use my referral code ${code} to join YVITY — India's trusted platform for insurance advisors.`,
          url: link,
        });
      } catch {
        // user cancelled or not supported
      }
    } else {
      copyLink();
    }
  }, [code, link, copyLink]);

  return (
    <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0A4A4A] to-[#0D6060] p-5 text-white shadow-[0_8px_32px_rgba(10,74,74,0.35)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Gift size={18} strokeWidth={1.75} />
        </div>
        <div>
          <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
            Your Referral Code
          </p>
          <p className="font-poppins text-xs text-white/75">Share this link to earn credits</p>
        </div>
      </div>

      {/* Code display */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
        <span className="flex-1 font-mono text-lg font-bold tracking-widest text-[#F59E0B] sm:text-xl">
          {code || "—"}
        </span>
        <button
          type="button"
          onClick={copyLink}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 font-poppins text-xs font-semibold text-white transition hover:bg-white/25 active:scale-95"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Link row */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <Link2 size={13} className="shrink-0 text-white/50" />
        <span className="flex-1 truncate font-poppins text-[11px] text-white/60">{link}</span>
      </div>

      {/* Share CTA */}
      <button
        type="button"
        onClick={shareLink}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F59E0B] py-3 font-poppins text-sm font-bold text-[#0A4A4A] shadow-[0_4px_16px_rgba(245,158,11,0.40)] transition hover:bg-[#FBBF24] active:scale-[0.98]"
      >
        <Share2 size={16} />
        Share Referral Link
      </button>

      {/* Credit info */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <p className="font-poppins text-lg font-bold text-[#F59E0B]">600</p>
          <p className="font-poppins text-[10px] text-white/60">Credits / Silver</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <p className="font-poppins text-lg font-bold text-[#F59E0B]">1,000</p>
          <p className="font-poppins text-[10px] text-white/60">Credits / Gold</p>
        </div>
      </div>
    </div>
  );
}

// ── Credits Summary Card ────────────────────────────────────────
function CreditsSummaryCard({ totalCredits, currentExtension, nextTier, creditsToNext }) {
  const maxCredits = nextTier ? nextTier.credits : 25000;
  const progress = nextTier
    ? Math.min(100, (totalCredits / nextTier.credits) * 100)
    : 100;

  return (
    <div className="rounded-[24px] border border-[#E4E2DB] bg-white p-5 shadow-[0_4px_24px_rgba(10,74,74,0.06)] sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF9E8]">
            <Zap size={18} className="text-[#F59E0B]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
              Referral Credits
            </p>
            <p className="font-poppins text-xs text-[#6B7280]">Current balance</p>
          </div>
        </div>
        {currentExtension.months > 0 && (
          <div className="rounded-full bg-[#E8F4F4] px-3 py-1">
            <p className="font-poppins text-[11px] font-bold text-[#0A4A4A]">
              {currentExtension.label} earned
            </p>
          </div>
        )}
      </div>

      {/* Big credit number */}
      <div className="mb-4 text-center">
        <p className="font-cormorant text-5xl font-bold text-[#0A4A4A] sm:text-6xl">
          {fmt(totalCredits)}
        </p>
        <p className="mt-1 font-poppins text-sm text-[#9CA3AF]">credits earned</p>
      </div>

      {/* Progress bar */}
      {nextTier ? (
        <div className="mb-3">
          <div className="mb-2 flex justify-between">
            <span className="font-poppins text-xs text-[#6B7280]">{fmt(totalCredits)} credits</span>
            <span className="font-poppins text-xs font-semibold text-[#0A4A4A]">
              {fmt(nextTier.credits)} → {nextTier.months === 12 ? "1 Year FREE" : `${nextTier.months} Month${nextTier.months > 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-[#F3F4F6]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0A4A4A] to-[#14B8A6] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-center font-poppins text-xs text-[#6B7280]">
            <span className="font-bold text-[#0A4A4A]">{fmt(creditsToNext)} more credits</span> to unlock{" "}
            {nextTier.months === 12 ? "1 Year FREE" : `${nextTier.months} Month${nextTier.months > 1 ? "s" : ""}`} extension
          </p>
        </div>
      ) : (
        <div className="mb-3 rounded-2xl bg-[#E8F4F4] px-4 py-3 text-center">
          <p className="font-poppins text-sm font-bold text-[#0A4A4A]">
            Maximum reward unlocked! 🎉
          </p>
          <p className="font-poppins text-xs text-[#6B7280]">You&apos;ve earned a 1 Year FREE extension</p>
        </div>
      )}

      {/* Credit rules */}
      <div className="mt-4 rounded-2xl border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-3">
        <div className="flex items-start gap-2">
          <Clock size={14} className="mt-0.5 shrink-0 text-[#D97706]" />
          <p className="font-poppins text-[11px] leading-relaxed text-[#92400E]">
            Credits are valid for your current membership year. Unused credits expire at renewal.
            30-day grace period if membership lapses. Extension applies automatically at renewal.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Ambassador Badge Card ───────────────────────────────────────
function AmbassadorBadgeCard({ badge, nextBadge, qualifiedCount }) {
  const allTiers = BADGE_TIERS;

  return (
    <div className="rounded-[24px] border border-[#E4E2DB] bg-white p-5 shadow-[0_4px_24px_rgba(10,74,74,0.06)] sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF9E8]">
          <Award size={18} className="text-[#F59E0B]" strokeWidth={1.75} />
        </div>
        <div>
          <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Ambassador Level
          </p>
          <p className="font-poppins text-xs text-[#6B7280]">Based on paid referrals</p>
        </div>
      </div>

      {/* Current badge */}
      {badge ? (
        <div
          className={`mb-4 rounded-2xl bg-gradient-to-br ${allTiers.find((t) => t.label === badge.label.split(" ")[0])?.bg ?? "from-[#F3F4F6] to-[#E5E7EB]"} p-4 text-center`}
        >
          <p className="font-poppins text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: badge.color }}>
            Current Badge
          </p>
          <p className="mt-1 font-cormorant text-3xl font-bold" style={{ color: badge.color }}>
            {badge.label}
          </p>
          <p className="mt-1 font-poppins text-xs text-[#6B7280]">
            {qualifiedCount} paid referral{qualifiedCount !== 1 ? "s" : ""}
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-2xl border border-dashed border-[#E4E2DB] bg-[#F9F8F6] p-4 text-center">
          <p className="font-poppins text-sm font-semibold text-[#9CA3AF]">No badge yet</p>
          <p className="mt-1 font-poppins text-xs text-[#9CA3AF]">
            Refer {5 - qualifiedCount} more paid advisor{5 - qualifiedCount !== 1 ? "s" : ""} to earn Bronze
          </p>
        </div>
      )}

      {/* Badge ladder */}
      <div className="space-y-2">
        {allTiers.map((tier) => {
          const earned = qualifiedCount >= tier.threshold;
          const isCurrent = badge?.label === `${tier.label} Ambassador`;
          return (
            <div
              key={tier.label}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                isCurrent
                  ? "border border-[#F59E0B]/30 bg-[#FFFBEB]"
                  : earned
                  ? "bg-[#F9F8F6]"
                  : "opacity-45"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star
                  size={15}
                  fill={earned ? tier.color : "transparent"}
                  style={{ color: tier.color }}
                  strokeWidth={1.5}
                />
                <span className="font-poppins text-sm font-semibold text-[#0A4A4A]">
                  {tier.label} Ambassador
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-[#F59E0B] px-2 py-0.5 font-poppins text-[9px] font-bold uppercase text-[#0A4A4A]">
                    You
                  </span>
                )}
              </div>
              <span className="font-poppins text-xs text-[#6B7280]">{tier.threshold}+ paid</span>
            </div>
          );
        })}
      </div>

      {nextBadge && (
        <p className="mt-3 text-center font-poppins text-xs text-[#6B7280]">
          <span className="font-bold text-[#0A4A4A]">{nextBadge.threshold - qualifiedCount} more</span> paid referral{nextBadge.threshold - qualifiedCount !== 1 ? "s" : ""} to reach{" "}
          <span style={{ color: BADGE_TIERS.find((t) => t.label === nextBadge.label.split(" ")[0])?.color }}>
            {nextBadge.label}
          </span>
        </p>
      )}
    </div>
  );
}

// ── Milestones Card ─────────────────────────────────────────────
function MilestonesCard({ totalCredits, currentExtension }) {
  return (
    <div className="rounded-[24px] border border-[#E4E2DB] bg-white p-5 shadow-[0_4px_24px_rgba(10,74,74,0.06)] sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F4F4]">
          <TrendingUp size={18} className="text-[#0A4A4A]" strokeWidth={1.75} />
        </div>
        <div>
          <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Reward Milestones
          </p>
          <p className="font-poppins text-xs text-[#6B7280]">Extension unlocks at renewal</p>
        </div>
      </div>

      <div className="space-y-2">
        {EXTENSION_TIERS.map((tier, idx) => {
          const unlocked = totalCredits >= tier.credits;
          const isCurrent =
            currentExtension.months === tier.months && unlocked;
          const isNext = !unlocked && (idx === 0 || totalCredits >= EXTENSION_TIERS[idx - 1].credits);

          return (
            <div
              key={tier.credits}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                isCurrent
                  ? "border border-[#14B8A6]/30 bg-gradient-to-r from-[#E8F4F4] to-[#F0FDF9]"
                  : unlocked
                  ? "bg-[#F9F8F6]"
                  : isNext
                  ? "border border-dashed border-[#F59E0B]/40 bg-[#FFFBEB]"
                  : "opacity-40"
              }`}
            >
              {/* Lock / Check */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  unlocked ? "bg-[#0A4A4A]" : isNext ? "bg-[#FEF3C7]" : "bg-[#F3F4F6]"
                }`}
              >
                {unlocked ? (
                  <Check size={14} className="text-white" strokeWidth={2.5} />
                ) : (
                  <span className="font-poppins text-[10px] font-bold text-[#9CA3AF]">{idx + 1}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-poppins text-sm font-bold text-[#0A4A4A]">{tier.label}</span>
                  {tier.months === 12 && (
                    <span className="rounded-full bg-[#FEF3C7] px-1.5 py-0.5 font-poppins text-[9px] font-bold uppercase text-[#B45309]">
                      Best
                    </span>
                  )}
                </div>
                <p className="font-poppins text-[11px] text-[#9CA3AF]">
                  {fmt(tier.credits)} credits
                  {isNext && !unlocked && (
                    <span className="ml-1 font-semibold text-[#D97706]">
                      · next reward
                    </span>
                  )}
                </p>
              </div>

              <ChevronRight
                size={15}
                className={unlocked ? "text-[#0A4A4A]" : "text-[#D1D5DB]"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stats Strip ─────────────────────────────────────────────────
function StatsStrip({ stats }) {
  const items = [
    { label: "Total Referred", value: stats?.total ?? 0, icon: Users },
    { label: "Paid Referrals", value: stats?.qualified ?? 0, icon: Check },
    { label: "Pending", value: stats?.pending ?? 0, icon: Clock },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-[20px] border border-[#E4E2DB] bg-white p-3 text-center shadow-sm sm:p-4"
        >
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F4F4]">
            <Icon size={15} className="text-[#0A4A4A]" strokeWidth={1.75} />
          </div>
          <p className="font-cormorant text-2xl font-bold text-[#0A4A4A]">{value}</p>
          <p className="font-poppins text-[10px] leading-snug text-[#9CA3AF]">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Referral History ────────────────────────────────────────────
const STATUS_STYLE = {
  qualified: { label: "Paid", className: "bg-[#D1FAE5] text-[#065F46]" },
  registered: { label: "Registered", className: "bg-[#FEF9C3] text-[#854D0E]" },
  expired:    { label: "Expired", className: "bg-[#F3F4F6] text-[#6B7280]" },
  invalid:    { label: "Invalid", className: "bg-[#FEE2E2] text-[#991B1B]" },
};

function ReferralHistoryCard({ history }) {
  if (!history?.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#E4E2DB] bg-[#F9F8F6] p-8 text-center">
        <Users size={28} className="mx-auto mb-3 text-[#D1D5DB]" />
        <p className="font-poppins text-sm font-semibold text-[#9CA3AF]">No referrals yet</p>
        <p className="mt-1 font-poppins text-xs text-[#9CA3AF]">
          Share your referral link to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-[#E4E2DB] bg-white shadow-[0_4px_24px_rgba(10,74,74,0.06)] overflow-hidden">
      <div className="border-b border-[#F3F4F6] px-5 py-4">
        <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
          Referral History
        </p>
        <p className="mt-0.5 font-cormorant text-lg font-bold text-[#0A4A4A]">
          Recent referrals
        </p>
      </div>
      <div className="divide-y divide-[#F3F4F6]">
        {history.map((row) => {
          const style = STATUS_STYLE[row.status] ?? STATUS_STYLE.registered;
          const plan = row.planPurchased
            ? row.planPurchased.charAt(0).toUpperCase() + row.planPurchased.slice(1)
            : null;
          const date = row.registeredAt
            ? new Date(row.registeredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "—";

          return (
            <div key={row.id} className="flex items-center gap-3 px-5 py-3.5">
              {/* Avatar placeholder */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F4F4] font-poppins text-sm font-bold text-[#0A4A4A]">
                {String(row.name || "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-poppins text-sm font-semibold text-[#0A4A4A]">
                  {row.name || "—"}
                </p>
                <p className="font-poppins text-[11px] text-[#9CA3AF]">
                  {date}{plan ? ` · ${plan}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`rounded-full px-2 py-0.5 font-poppins text-[10px] font-semibold ${style.className}`}>
                  {style.label}
                </span>
                {row.creditsAwarded > 0 && (
                  <span className="font-poppins text-[10px] font-bold text-[#F59E0B]">
                    +{fmt(row.creditsAwarded)} cr
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Module ─────────────────────────────────────────────────
export function AdvisorReferralModule() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/advisor/referral-program", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setData(result.data);
        else setError(result.message || "Failed to load");
      })
      .catch(() => setError("Failed to load referral data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#0A4A4A]/40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-poppins text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const {
    referralCode,
    referralLink,
    totalCredits,
    currentExtension,
    nextExtensionTier,
    creditsToNext,
    badge,
    nextBadge,
    stats,
    history,
  } = data;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Referral code */}
      <ReferralCodeCard code={referralCode} link={referralLink} />

      {/* Stats strip */}
      <StatsStrip stats={stats} />

      {/* Credits summary */}
      <CreditsSummaryCard
        totalCredits={totalCredits}
        currentExtension={currentExtension}
        nextTier={nextExtensionTier}
        creditsToNext={creditsToNext}
      />

      {/* 2-col on desktop: milestones + badge */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <MilestonesCard totalCredits={totalCredits} currentExtension={currentExtension} />
        <AmbassadorBadgeCard
          badge={badge}
          nextBadge={nextBadge}
          qualifiedCount={stats?.qualified ?? 0}
        />
      </div>

      {/* History */}
      <ReferralHistoryCard history={history} />
    </div>
  );
}

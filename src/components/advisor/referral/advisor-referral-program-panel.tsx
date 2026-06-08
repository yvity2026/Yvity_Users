"use client";

import { useState } from "react";
import { Check, Copy, Gift, Link2, UserPlus, Users } from "lucide-react";
import type { AmbassadorDashboardData } from "@/lib/advisor/ambassador-types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function formatQualifyingPlans(plans: string[]) {
  if (!plans.length) return "Silver or Gold";
  return plans.map((plan) => plan.charAt(0).toUpperCase() + plan.slice(1)).join(" or ");
}

function referralStatusLabel(
  status: AmbassadorDashboardData["recentReferrals"][number]["status"],
  planPurchased: string | null,
) {
  if (status === "qualified") return planPurchased ? `Qualified (${planPurchased})` : "Qualified";
  if (status === "registered") return "Joined (Free)";
  return status;
}

type AdvisorReferralProgramPanelProps = {
  data: AmbassadorDashboardData;
  compact?: boolean;
};

export function AdvisorReferralProgramPanel({ data, compact = false }: AdvisorReferralProgramPanelProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const qualifyLabel = formatQualifyingPlans(data.rewardsQualifyOn);

  const copyText = async (text: string, kind: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
      toast.success(kind === "link" ? "Referral link copied" : "Referral code copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-4">
      {!data.programActive ? (
        <p className="rounded-xl border border-[#B45309]/30 bg-[#B45309]/10 px-3 py-2 text-sm text-[#FCD34D]">
          The referral program is temporarily paused. Your link still works for tracking, but new
          rewards are on hold.
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Every advisor can refer colleagues. Free sign-ups are tracked here and in admin. Rewards are
        generated only when a referral purchases {qualifyLabel}.
      </p>

      <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{data.totalReferrals}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Qualified</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-[oklch(0.82_0.16_162)]">
            {data.successfulReferrals}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Free joins</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{data.freeReferrals}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Rewards</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{data.pendingRewards}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[oklch(0.85_0.16_78/0.25)] bg-[oklch(0.85_0.16_78/0.08)] p-4 space-y-3">
        <div className="flex items-center gap-2 text-[oklch(0.9_0.14_78)]">
          <Link2 className="size-4" />
          <p className="text-sm font-semibold">Your referral link</p>
        </div>
        <p className="break-all rounded-xl bg-black/20 px-3 py-2 font-mono text-[11px] text-foreground/90">
          {data.referralLink}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={() => void copyText(data.referralLink, "link")}
          >
            {copiedLink ? <Check className="size-4" /> : <Copy className="size-4" />}
            Copy link
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2 border-white/15"
            onClick={() => void copyText(data.referralCode, "code")}
          >
            {copiedCode ? <Check className="size-4" /> : <Copy className="size-4" />}
            Code {data.referralCode}
          </Button>
        </div>
      </div>

      {data.recentReferrals.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Recent referrals</p>
          {data.recentReferrals.map((referral, index) => (
            <div
              key={`${referral.name}-${referral.registeredAt}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
            >
              <div className="min-w-0 flex items-center gap-2">
                <Users className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{referral.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {referralStatusLabel(referral.status, referral.planPurchased)}
                  </p>
                </div>
              </div>
              {referral.status === "qualified" && referral.planPurchased ? (
                <span className="shrink-0 rounded-full bg-[oklch(0.82_0.16_162/0.2)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[oklch(0.82_0.16_162)]">
                  {referral.planPurchased}
                </span>
              ) : referral.status === "registered" ? (
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  Free
                </span>
              ) : (
                <UserPlus className="size-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Gift className="size-4" />
          Share your link to start tracking referrals. Rewards unlock when they upgrade to {qualifyLabel}.
        </p>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { AlertTriangle, Sparkles } from "lucide-react";
import { formatUsageLine, upgradePlanLabel, type PlanLimitUsage } from "@/lib/advisor-membership/plan-limit-usage";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";
import { cn } from "@/lib/utils";

type PlanLimitBannerProps = {
  usage: PlanLimitUsage;
  resourceLabel: string;
  upgradePlan?: MembershipPlanId | null;
  /** Advisor workspace — links to membership tab. */
  showUpgradeLink?: boolean;
  /** Visitor-facing copy when the advisor cannot accept more. */
  visitorMessage?: string;
  className?: string;
};

export function PlanLimitBanner({
  usage,
  resourceLabel,
  upgradePlan,
  showUpgradeLink = true,
  visitorMessage,
  className,
}: PlanLimitBannerProps) {
  if (!usage.capped) return null;
  if (!usage.atLimit && !usage.nearLimit) return null;

  const usageLine = formatUsageLine(usage, resourceLabel);
  const upgradeName = upgradePlanLabel(upgradePlan);
  const profileHome = usePublicProfileNavHome();

  if (usage.atLimit && visitorMessage) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3",
          className,
        )}
        role="status"
      >
        <p className="text-sm font-semibold text-foreground">{visitorMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3",
        usage.atLimit
          ? "border-[oklch(0.85_0.16_78/0.35)] bg-[oklch(0.85_0.16_78/0.08)]"
          : "border-white/12 bg-white/[0.03]",
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
            usage.atLimit
              ? "bg-[oklch(0.85_0.16_78/0.15)] text-[oklch(0.92_0.14_78)]"
              : "bg-white/5 text-muted-foreground",
          )}
        >
          {usage.atLimit ? <Sparkles className="size-4" /> : <AlertTriangle className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {usage.atLimit
              ? `${resourceLabel.charAt(0).toUpperCase()}${resourceLabel.slice(1)} limit reached`
              : `Almost at your ${resourceLabel} limit`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {usage.atLimit ? (
              <>
                You&apos;re using {usageLine} on your current plan.
                {upgradePlan && showUpgradeLink
                  ? ` Upgrade to ${upgradeName} for more capacity.`
                  : upgradePlan
                    ? ` Upgrade to ${upgradeName} for more capacity.`
                    : null}
              </>
            ) : (
              <>
                {usageLine} used — {usage.remaining} slot{usage.remaining === 1 ? "" : "s"} left on
                your plan.
              </>
            )}
          </p>
          {upgradePlan && showUpgradeLink && usage.atLimit ? (
            <Link
              href={`${profileHome}?tab=membership`}
              className="mt-2 inline-flex text-xs font-semibold text-[oklch(0.85_0.16_78)] hover:underline"
            >
              View upgrade options
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

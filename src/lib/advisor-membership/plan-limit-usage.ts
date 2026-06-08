import { formatLimit } from "./plan-limits";
import type { MembershipPlanId } from "./types";

export type PlanLimitUsage = {
  capped: boolean;
  atLimit: boolean;
  nearLimit: boolean;
  current: number;
  cap: number | null;
  remaining: number | null;
};

export function planLimitUsage(current: number, cap: number | null): PlanLimitUsage {
  const safeCurrent = Math.max(0, current);
  if (cap === null) {
    return {
      capped: false,
      atLimit: false,
      nearLimit: false,
      current: safeCurrent,
      cap: null,
      remaining: null,
    };
  }

  const remaining = Math.max(0, cap - safeCurrent);
  return {
    capped: true,
    atLimit: safeCurrent >= cap,
    nearLimit: remaining > 0 && remaining <= 2,
    current: safeCurrent,
    cap,
    remaining,
  };
}

export function planLimitLabel(cap: number | null, noun: string): string {
  if (cap === null) return `Unlimited ${noun}`;
  return `${cap} ${noun}${cap === 1 ? "" : "s"}`;
}

export function upgradePlanLabel(planId: MembershipPlanId | null | undefined): string {
  if (planId === "gold") return "Gold";
  if (planId === "silver") return "Silver";
  return "a higher plan";
}

export function formatUsageLine(usage: PlanLimitUsage, noun: string): string {
  if (!usage.capped || usage.cap === null) {
    return `${usage.current} ${noun}${usage.current === 1 ? "" : "s"}`;
  }
  return `${usage.current} of ${formatLimit(usage.cap)} ${noun}${usage.cap === 1 ? "" : "s"}`;
}

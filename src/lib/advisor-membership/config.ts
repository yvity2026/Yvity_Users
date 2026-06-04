import type { MembershipPlanId } from "./types";

/** Advisor membership — replace with billing API when available. */
export const advisorMembershipConfig = {
  planId: "silver" satisfies MembershipPlanId,
  startDate: "2025-12-15",
  renewalDate: "2026-12-15",
} as const;

export function daysUntilRenewal(isoDate: string): number {
  const end = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

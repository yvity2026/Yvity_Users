import { getPlanMarketing } from "./plan-catalog";
import type { MembershipPlanId } from "./types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const SUBSCRIPTION_TERM_DAYS = 365;

export type SilverToGoldUpgradeQuote = {
  goldAnnualInr: number;
  silverAnnualInr: number;
  silverCreditInr: number;
  amountDueInr: number;
  remainingDays: number;
  subscriptionTermDays: number;
};

function toDayCount(from: Date, to: Date): number {
  return Math.max(1, Math.ceil((to.getTime() - from.getTime()) / MS_PER_DAY));
}

export function remainingSubscriptionDays(
  expiresAtIso: string,
  now: Date = new Date(),
): number {
  const expiresAt = new Date(expiresAtIso);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= now) return 0;
  return Math.ceil((expiresAt.getTime() - now.getTime()) / MS_PER_DAY);
}

/** Unused Silver value on a pro-rata basis for the remaining subscription term. */
export function calculateUnusedSilverCredit(input: {
  silverAnnualInr: number;
  subscriptionExpiresAt: string;
  subscriptionStartedAt?: string | null;
  now?: Date;
}): number {
  const now = input.now ?? new Date();
  const expiresAt = new Date(input.subscriptionExpiresAt);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= now) return 0;

  const startedAt = input.subscriptionStartedAt
    ? new Date(input.subscriptionStartedAt)
    : new Date(expiresAt.getTime() - SUBSCRIPTION_TERM_DAYS * MS_PER_DAY);

  const termDays = toDayCount(startedAt, expiresAt);
  const remainingDays = remainingSubscriptionDays(input.subscriptionExpiresAt, now);
  if (remainingDays <= 0) return 0;

  return Math.round((input.silverAnnualInr * remainingDays) / termDays);
}

/** Silver → Gold upgrade: full Gold year minus unused Silver credit. Gold is valid 1 year from upgrade. */
export function calculateSilverToGoldUpgradeQuote(input: {
  subscriptionExpiresAt: string;
  subscriptionStartedAt?: string | null;
  now?: Date;
}): SilverToGoldUpgradeQuote {
  const silverAnnualInr = getPlanMarketing("silver").priceAnnualInr;
  const goldAnnualInr = getPlanMarketing("gold").priceAnnualInr;
  const now = input.now ?? new Date();
  const remainingDays = remainingSubscriptionDays(input.subscriptionExpiresAt, now);
  const silverCreditInr = calculateUnusedSilverCredit({
    silverAnnualInr,
    subscriptionExpiresAt: input.subscriptionExpiresAt,
    subscriptionStartedAt: input.subscriptionStartedAt,
    now,
  });

  return {
    goldAnnualInr,
    silverAnnualInr,
    silverCreditInr,
    amountDueInr: Math.max(0, goldAnnualInr - silverCreditInr),
    remainingDays,
    subscriptionTermDays: SUBSCRIPTION_TERM_DAYS,
  };
}

export function shouldApplySilverUpgradeCredit(
  currentPlanId: MembershipPlanId,
  targetPlanId: MembershipPlanId,
): boolean {
  return currentPlanId === "silver" && targetPlanId === "gold";
}

export function formatInr(amount: number): string {
  if (amount === 0) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

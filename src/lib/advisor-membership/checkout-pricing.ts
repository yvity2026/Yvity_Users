import type { AdvisorProfileRecord } from "@/lib/server/advisor-profile-store";
import { getPlanMarketing } from "./plan-catalog";
import {
  calculateSilverToGoldUpgradeQuote,
  shouldApplySilverUpgradeCredit,
} from "./proration";
import type { MembershipPlanId } from "./types";

export type CheckoutKind = "purchase" | "renew" | "upgrade";

export type CheckoutQuote = {
  checkoutKind: CheckoutKind;
  planId: "silver" | "gold";
  amountInr: number;
  listPriceInr: number;
  creditInr: number;
  fromPlanId: MembershipPlanId | null;
  remainingDays: number;
  summary: string;
  amountBeforeCouponInr?: number;
  couponCode?: string;
  couponDiscountInr?: number;
};

function normalizePlanId(value: unknown): MembershipPlanId {
  const plan = String(value ?? "free").trim().toLowerCase();
  if (plan === "silver" || plan === "gold" || plan === "free") return plan;
  return "free";
}

export function resolveSubscriptionDates(profile: Pick<
  AdvisorProfileRecord,
  "approved_at" | "submitted_at" | "subscription_started_at" | "subscription_expires_at"
>): { startedAt: string; expiresAt: string } {
  if (profile.subscription_started_at && profile.subscription_expires_at) {
    return {
      startedAt: profile.subscription_started_at,
      expiresAt: profile.subscription_expires_at,
    };
  }

  const anchor = profile.approved_at ?? profile.submitted_at ?? new Date().toISOString();
  const startedAt = new Date(anchor);
  const expiresAt = new Date(startedAt);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  return {
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function addOneYear(fromIso: string | Date): string {
  const base = typeof fromIso === "string" ? new Date(fromIso) : new Date(fromIso.getTime());
  base.setFullYear(base.getFullYear() + 1);
  return base.toISOString();
}

export function resolveCheckoutQuote(input: {
  checkoutKind: CheckoutKind;
  currentPlanId: MembershipPlanId;
  targetPlanId: "silver" | "gold";
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  approvedAt?: string | null;
  submittedAt?: string | null;
  now?: Date;
  /** Dynamic plan prices from admin (platform_configs "plan_pricing"). Overrides hardcoded catalog. */
  planPrices?: Partial<Record<string, number>>;
}): CheckoutQuote | { error: string } {
  const currentPlanId = normalizePlanId(input.currentPlanId);
  const targetPlanId = input.targetPlanId;
  const getPrice = (planId: MembershipPlanId) =>
    input.planPrices?.[planId] ?? getPlanMarketing(planId).priceAnnualInr;
  const listPriceInr = getPrice(targetPlanId);

  if (input.checkoutKind === "renew") {
    if (currentPlanId !== "silver" && currentPlanId !== "gold") {
      return { error: "Only Silver or Gold memberships can be renewed" };
    }
    if (targetPlanId !== currentPlanId) {
      return { error: "Renewal must use your current plan. Use upgrade to change plans." };
    }
    return {
      checkoutKind: "renew",
      planId: targetPlanId,
      amountInr: listPriceInr,
      listPriceInr,
      creditInr: 0,
      fromPlanId: currentPlanId,
      remainingDays: 0,
      summary: `Renew ${getPlanMarketing(targetPlanId).name} for one year (${getPlanMarketing(targetPlanId).priceLabel}).`,
    };
  }

  if (input.checkoutKind === "upgrade") {
    if (targetPlanId !== "gold" && targetPlanId !== "silver") {
      return { error: "Invalid upgrade target" };
    }
    if (
      currentPlanId !== "free" &&
      getPrice(currentPlanId) >= listPriceInr
    ) {
      return { error: "You can only upgrade to a higher plan" };
    }

    if (shouldApplySilverUpgradeCredit(currentPlanId, targetPlanId)) {
      const dates = resolveSubscriptionDates({
        approved_at: input.approvedAt ?? null,
        submitted_at: input.submittedAt ?? null,
        subscription_started_at: input.subscriptionStartedAt ?? null,
        subscription_expires_at: input.subscriptionExpiresAt ?? null,
      });
      const quote = calculateSilverToGoldUpgradeQuote({
        subscriptionExpiresAt: dates.expiresAt,
        subscriptionStartedAt: dates.startedAt,
        now: input.now,
        planPrices: input.planPrices,
      });

      return {
        checkoutKind: "upgrade",
        planId: "gold",
        amountInr: quote.amountDueInr,
        listPriceInr: quote.goldAnnualInr,
        creditInr: quote.silverCreditInr,
        fromPlanId: "silver",
        remainingDays: quote.remainingDays,
        summary:
          quote.silverCreditInr > 0
            ? `Gold membership for one year from today. Unused Silver credit of ₹${quote.silverCreditInr.toLocaleString("en-IN")} applied.`
            : "Gold membership for one year from today.",
      };
    }

    return {
      checkoutKind: "upgrade",
      planId: targetPlanId,
      amountInr: listPriceInr,
      listPriceInr,
      creditInr: 0,
      fromPlanId: currentPlanId === "free" ? "free" : currentPlanId,
      remainingDays: 0,
      summary: `Upgrade to ${getPlanMarketing(targetPlanId).name} for one year (${getPlanMarketing(targetPlanId).priceLabel}).`,
    };
  }

  // purchase — initial paid signup
  return {
    checkoutKind: "purchase",
    planId: targetPlanId,
    amountInr: listPriceInr,
    listPriceInr,
    creditInr: 0,
    fromPlanId: null,
    remainingDays: 0,
    summary: `${getPlanMarketing(targetPlanId).name} for one year (${getPlanMarketing(targetPlanId).priceLabel}).`,
  };
}

export function resolveCheckoutQuoteForProfile(
  profile: AdvisorProfileRecord,
  input: { checkoutKind: CheckoutKind; targetPlanId: "silver" | "gold"; planPrices?: Partial<Record<string, number>> },
  now?: Date,
): CheckoutQuote | { error: string } {
  return resolveCheckoutQuote({
    checkoutKind: input.checkoutKind,
    currentPlanId: normalizePlanId(profile.subscription_plan),
    targetPlanId: input.targetPlanId,
    subscriptionStartedAt: profile.subscription_started_at,
    subscriptionExpiresAt: profile.subscription_expires_at,
    approvedAt: profile.approved_at,
    submittedAt: profile.submitted_at,
    now,
    planPrices: input.planPrices,
  });
}

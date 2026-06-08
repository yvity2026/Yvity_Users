import type { MembershipPlanId } from "./types";
import { daysUntilRenewal } from "./config";
import { resolveSubscriptionDates } from "./checkout-pricing";
import { featuresForPlan, MEMBERSHIP_PLANS } from "./plans";
import type { MembershipModel, MembershipStatus } from "./types";

function renewalReminderLevel(days: number): MembershipModel["renewal"]["reminderLevel"] {
  if (days <= 0) return "urgent";
  if (days <= 14) return "urgent";
  if (days <= 45) return "soon";
  return "none";
}

function normalizePlanId(value: unknown): MembershipPlanId {
  const p = String(value ?? "free").toLowerCase();
  if (p === "silver" || p === "gold" || p === "free") return p;
  return "free";
}

export function buildMembershipModel(input?: {
  subscriptionPlan?: string | null;
  approvedAt?: string | null;
  submittedAt?: string | null;
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
}): MembershipModel {
  const planId = normalizePlanId(input?.subscriptionPlan);
  const planDef = MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0]!;
  const dates = resolveSubscriptionDates({
    approved_at: input?.approvedAt ?? null,
    submitted_at: input?.submittedAt ?? null,
    subscription_started_at: input?.subscriptionStartedAt ?? null,
    subscription_expires_at: input?.subscriptionExpiresAt ?? null,
  });
  const startDate = dates.startedAt.slice(0, 10);
  const renewalDate = dates.expiresAt.slice(0, 10);
  const daysRemaining = daysUntilRenewal(renewalDate);
  const status: MembershipStatus = planId === "free" || daysRemaining > 0 ? "active" : "expired";

  return {
    current: {
      planId: planDef.id,
      planName: planDef.name,
      status,
      startDate,
      expiryDate: renewalDate,
      daysRemaining: Math.max(0, daysRemaining),
      showVerifiedBadge: planId === "silver" || planId === "gold",
    },
    benefits: featuresForPlan(planDef.id),
    plans: MEMBERSHIP_PLANS,
    renewal: {
      renewalDate,
      expiryDate: renewalDate,
      daysRemaining: Math.max(0, daysRemaining),
      showReminder: planId !== "free" && daysRemaining <= 45,
      reminderLevel: renewalReminderLevel(daysRemaining),
    },
    payments: [],
  };
}

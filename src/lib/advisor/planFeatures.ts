import { getIdentityRefreshStatus } from "@/lib/identity/refreshPolicy";

export function normalizePlan(value: unknown) {
  return String(value || "free").trim().toLowerCase();
}

export function normalizeAccountStatus(value: unknown) {
  return String(value || "active").trim().toLowerCase();
}

export function getEffectivePlan(subscriptionPlan: unknown, accountStatus: unknown) {
  const plan = normalizePlan(subscriptionPlan);
  const status = normalizeAccountStatus(accountStatus);

  if (status !== "active") return "free";
  if (plan === "free") return "free";
  // Custom tiers (e.g. platinum) keep their plan id when active.
  return plan;
}

export function hasGoldPlan(subscriptionPlan: unknown, accountStatus: unknown) {
  return getEffectivePlan(subscriptionPlan, accountStatus) === "gold";
}

export function hasFoundingAdvisorBadge(subscriptionPlan: unknown, accountStatus: unknown) {
  return hasGoldPlan(subscriptionPlan, accountStatus);
}

export function hasIdentityVerified(user: Record<string, unknown> | null | undefined) {
  if (!user || typeof user !== "object") {
    return false;
  }

  const refresh = getIdentityRefreshStatus(user);
  const hasVerificationAnchor = Boolean(
    user.identity_verified_at || user.selfie_url || user.mobile_verified,
  );

  return hasVerificationAnchor && refresh.canPerformTrustActions;
}

export function hasVerifiedServices(subscriptionPlan: unknown, accountStatus: unknown) {
  const plan = getEffectivePlan(subscriptionPlan, accountStatus);
  return plan === "silver" || plan === "gold";
}

export function hasVerifiedTick(subscriptionPlan: unknown, accountStatus: unknown) {
  return hasGoldPlan(subscriptionPlan, accountStatus);
}

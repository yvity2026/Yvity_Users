import { advisorMembershipConfig } from "./config";

export { advisorMembershipConfig, daysUntilRenewal } from "./config";
export { buildMembershipModel } from "./build-model";
export { MEMBERSHIP_FEATURES, MEMBERSHIP_PLANS, planHasFeature, upgradePlanId } from "./plans";
export type { MembershipModel, MembershipPlanId, MembershipStatus, PaymentRecord } from "./types";

import { MEMBERSHIP_PLANS } from "./plans";

const freePlan = MEMBERSHIP_PLANS.find((p) => p.id === "free")!;
const goldPlan = MEMBERSHIP_PLANS.find((p) => p.id === "gold")!;

/** Dashboard membership strip fallback when advisor plan is unknown. */
export const advisorMembership = {
  planId: "free" as const,
  planName: freePlan.name,
  tagline: freePlan.tagline,
  renewalDate: advisorMembershipConfig.renewalDate,
  benefits: freePlan.features.map((id) => id.replace(/_/g, " ")),
  upgradePlanName: goldPlan.name,
  upgradeHighlight: goldPlan.tagline,
} as const;

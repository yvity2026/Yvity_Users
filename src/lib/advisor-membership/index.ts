import { advisorMembershipConfig } from "./config";

export { advisorMembershipConfig, daysUntilRenewal } from "./config";
export { buildMembershipModel } from "./build-model";
export {
  addOneYear,
  resolveCheckoutQuote,
  resolveCheckoutQuoteForProfile,
  resolveSubscriptionDates,
} from "./checkout-pricing";
export type { CheckoutKind, CheckoutQuote } from "./checkout-pricing";
export {
  listActiveTestimonialLimitRows,
  canAcceptAnyTestimonialType,
  firstAvailableTestimonialType,
} from "./testimonial-limit-usage";
export {
  calculateSilverToGoldUpgradeQuote,
  calculateUnusedSilverCredit,
  formatInr as formatMembershipInr,
  remainingSubscriptionDays,
  shouldApplySilverUpgradeCredit,
} from "./proration";
export {
  allPlanComparisonLabels,
  getPlanMarketing,
  includedBenefitLabels,
  marketingFeatureRows,
  MEMBERSHIP_PLAN_MARKETING,
  planMarketingIncludes,
} from "./plan-catalog";
export {
  allowedThemeIds,
  canAcceptRecommendation,
  canAcceptTestimonialType,
  canAddGalleryPhoto,
  canUseIntroVideo,
  canUseIntroVideoDuration,
  capCount,
  countCustomerTestimonialsByType,
  filterGalleryForPublicDisplay,
  filterTestimonialsForPublicDisplay,
  isThemeAllowed,
  resolveThemeForPlan,
  PLAN_ALLOWED_THEMES,
  validateIntroVideoSettings,
  validateTestimonialCounts,
  visibleLeads,
  advisorEligibleForSearch,
} from "./plan-enforcement";
export {
  countHeldRecommendations,
  countHeldTestimonials,
  countPublishedRecommendations,
  heldTestimonialsByType,
  resolveRecommendationPublicVisibility,
  resolveTestimonialPublicVisibility,
  upgradePlanForHeldContent,
  type PublicVisibility,
} from "./content-visibility";
export { formatLimit, getPlanLimits, PLAN_LIMITS, resolvePlanLimits } from "./plan-limits";
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

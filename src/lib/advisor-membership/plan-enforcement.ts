import { PROFILE_THEME_IDS, YVITY_BRAND_THEME_ID, type ProfileThemeId } from "@/lib/profile-themes";
import type { Lead } from "@/lib/leads/types";
import type { TestimonialItem, TestimonialType } from "@/lib/sections/types";
import { isServiceVerifiedByYvity } from "@/lib/verification/defaults";
import type { VerificationRecord } from "@/lib/verification/types";
import type { PlanLimits } from "./plan-limits";
import { nextUpgradePlan } from "./plan-limits";
import type { MembershipPlanId } from "./types";
import { isHostedIntroVideoUrl } from "@/lib/media-urls";

/** Themes unlocked per membership tier. */
export const PLAN_ALLOWED_THEMES: Record<MembershipPlanId, ProfileThemeId[]> = {
  free: [YVITY_BRAND_THEME_ID],
  silver: [YVITY_BRAND_THEME_ID, "clean-white"],
  gold: [...PROFILE_THEME_IDS],
};

export type PlanLimitCheck = {
  ok: boolean;
  reason?: string;
  upgradePlan?: MembershipPlanId;
};

export function countCustomerTestimonialsByType(items: TestimonialItem[]): Record<TestimonialType, number> {
  const customer = items.filter((item) => item.source !== "advisor");
  return {
    text: customer.filter((item) => item.type === "text").length,
    audio: customer.filter((item) => item.type === "audio").length,
    video: customer.filter((item) => item.type === "video").length,
  };
}

export function validateTestimonialCounts(
  limits: PlanLimits,
  items: TestimonialItem[],
  planId: MembershipPlanId,
): PlanLimitCheck {
  const counts = countCustomerTestimonialsByType(items);
  for (const type of ["text", "audio", "video"] as const) {
    const cap = limits.testimonials[type];
    if (cap === null) continue;
    if (counts[type] > cap) {
      const upgrade = nextUpgradePlan(planId);
      return {
        ok: false,
        reason: `Your plan allows up to ${cap} ${type} testimonial${cap === 1 ? "" : "s"}.`,
        upgradePlan: upgrade ?? undefined,
      };
    }
  }
  return { ok: true };
}

export function canAcceptTestimonialType(
  limits: PlanLimits,
  items: TestimonialItem[],
  type: TestimonialType,
  planId: MembershipPlanId,
): PlanLimitCheck {
  const cap = limits.testimonials[type];
  if (cap === null) return { ok: true };
  const counts = countCustomerTestimonialsByType(items);
  if (counts[type] >= cap) {
    const upgrade = nextUpgradePlan(planId);
    return {
      ok: false,
      reason: `This advisor has reached the ${type} testimonial limit (${cap}) on their current plan.`,
      upgradePlan: upgrade ?? undefined,
    };
  }
  return { ok: true };
}

export function canAddGalleryPhoto(
  limits: PlanLimits,
  currentCount: number,
  planId: MembershipPlanId,
): PlanLimitCheck {
  const cap = limits.galleryPhotos;
  if (cap === null) return { ok: true };
  if (currentCount >= cap) {
    return {
      ok: false,
      reason: `Your plan allows up to ${cap} gallery photos.`,
      upgradePlan: nextUpgradePlan(planId) ?? undefined,
    };
  }
  return { ok: true };
}

export function canAcceptRecommendation(
  limits: PlanLimits,
  currentCount: number,
  planId: MembershipPlanId,
): PlanLimitCheck {
  const cap = limits.recommendations;
  if (cap === null) return { ok: true };
  if (currentCount >= cap) {
    return {
      ok: false,
      reason: `This advisor has reached the recommendation limit (${cap}) on their current plan.`,
      upgradePlan: nextUpgradePlan(planId) ?? undefined,
    };
  }
  return { ok: true };
}

export function capCount(count: number, limit: number | null): number {
  if (limit === null) return count;
  return Math.min(count, limit);
}

export function visibleLeads<T extends Lead>(
  limits: PlanLimits,
  leads: T[],
): { visible: T[]; total: number; lockedCount: number; limit: number | null } {
  const total = leads.length;
  const limit = limits.leadsVisible;
  if (limit === null) {
    return { visible: leads, total, lockedCount: 0, limit: null };
  }
  const visible = leads.slice(0, limit);
  return { visible, total, lockedCount: Math.max(0, total - visible.length), limit };
}

export function allowedThemeIds(planId: MembershipPlanId): ProfileThemeId[] {
  return PLAN_ALLOWED_THEMES[planId] ?? PLAN_ALLOWED_THEMES.free;
}

export function isThemeAllowed(planId: MembershipPlanId, themeId: ProfileThemeId): boolean {
  return allowedThemeIds(planId).includes(themeId);
}

export function resolveThemeForPlan(
  planId: MembershipPlanId,
  themeId: ProfileThemeId,
): ProfileThemeId {
  return isThemeAllowed(planId, themeId) ? themeId : YVITY_BRAND_THEME_ID;
}

export function canUseIntroVideo(
  limits: PlanLimits,
  planId: MembershipPlanId,
): PlanLimitCheck {
  if (limits.introVideoEnabled) return { ok: true };
  return {
    ok: false,
    reason: "Intro video is available on Silver and Gold plans.",
    upgradePlan: "silver",
  };
}

export function canUseIntroVideoDuration(
  limits: PlanLimits,
  durationSeconds: number,
  planId: MembershipPlanId,
): PlanLimitCheck {
  const enabled = canUseIntroVideo(limits, planId);
  if (!enabled.ok) return enabled;

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return { ok: true };
  }
  if (durationSeconds <= limits.introVideoMaxSeconds) return { ok: true };
  return {
    ok: false,
    reason: `Your plan allows intro videos up to ${limits.introVideoMaxSeconds} seconds.`,
    upgradePlan: nextUpgradePlan(planId) ?? undefined,
  };
}

export function validateIntroVideoSettings(
  limits: PlanLimits,
  planId: MembershipPlanId,
  introVideo: { url?: string; durationLabel?: string },
  parseDuration: (label: string | undefined | null) => number | null,
): PlanLimitCheck {
  const url = introVideo.url?.trim() ?? "";
  if (!url) return { ok: true };

  if (!isHostedIntroVideoUrl(url)) {
    return {
      ok: false,
      reason: "Intro video must be uploaded directly — external URLs are not supported.",
    };
  }

  const enabled = canUseIntroVideo(limits, planId);
  if (!enabled.ok) return enabled;

  const durationSeconds = parseDuration(introVideo.durationLabel);
  if (durationSeconds === null) {
    return {
      ok: false,
      reason: "Please set the video duration (e.g. 0:30) to save an intro video.",
    };
  }

  return canUseIntroVideoDuration(limits, durationSeconds, planId);
}

export function advisorEligibleForSearch(
  limits: PlanLimits,
  searchVisibilityEnabled = true,
): boolean {
  return limits.searchAppearance && searchVisibilityEnabled;
}

export function isServiceVerifiedForPlan(
  limits: PlanLimits,
  item: { verification?: VerificationRecord },
  profileApproved?: boolean,
): boolean {
  if (!limits.serviceVerification) return false;
  return isServiceVerifiedByYvity(item, profileApproved);
}

/** Public profile: cap customer audio/video testimonials while preserving list order. */
export { filterTestimonialsForPublicDisplay } from "./content-visibility";

export function filterGalleryForPublicDisplay(
  limits: PlanLimits,
  items: import("@/lib/gallery-types").GalleryItem[],
): import("@/lib/gallery-types").GalleryItem[] {
  const cap = limits.galleryPhotos;
  if (cap === null) return items;
  // Show featured items first so the cap never hides them in favour of
  // later-added non-featured photos.
  const sorted = [
    ...items.filter((i) => i.featured),
    ...items.filter((i) => !i.featured),
  ];
  return sorted.slice(0, cap);
}

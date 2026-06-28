import "server-only";

import { loadJsonFile, canUseLocalDataFiles } from "@/lib/server/json-store";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import type { PlanLimits } from "@/lib/advisor-membership/plan-limits";
import { PLAN_LIMITS as DEFAULT_PLAN_LIMITS } from "@/lib/advisor-membership/plan-limits";

const CONFIG_FILE = "feature-controls-config.json";

type AdminLimitRecord = {
  testimonialsText?: string | number;
  testimonialsAudio?: string | number;
  testimonialsVideo?: string | number;
  galleryPhotos?: string | number;
  introVideoSeconds?: number;
  introVideoHeroPlacement?: boolean;
  recommendations?: string | number;
  leadsVisible?: string | number;
  profileThemes?: string | number;
  serviceVerification?: boolean;
  yvityVerifiedBadge?: boolean;
  searchAppearance?: boolean;
  profileAnalytics?: boolean;
  featuredAdvisorEligibility?: boolean;
};

type FeatureControlsConfig = {
  planLimits?: Partial<Record<MembershipPlanId, AdminLimitRecord>>;
  globalFlags?: Record<string, boolean>;
};

const DEFAULT_GLOBAL_FLAGS = {
  membershipCheckoutEnabled: true,
  couponRedemptionEnabled: true,
  advisorSelfServiceUpgrade: true,
  galleryUploadsEnabled: true,
  introVideoUploadsEnabled: true,
  publicSearchEnabled: true,
  serviceVerificationEnabled: true,
};

function parseLimitValue(value: string | number | undefined): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.toLowerCase() === "unlimited") return null;
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.round(num)) : null;
}

function toUsersPlanLimits(record: AdminLimitRecord = {}): PlanLimits {
  const introVideoMaxSeconds = Number(record.introVideoSeconds) || 0;

  return {
    testimonials: {
      text: parseLimitValue(record.testimonialsText),
      audio: parseLimitValue(record.testimonialsAudio),
      video: parseLimitValue(record.testimonialsVideo),
    },
    galleryPhotos: parseLimitValue(record.galleryPhotos),
    introVideoEnabled: introVideoMaxSeconds > 0,
    introVideoMaxSeconds,
    introVideoHeroPlacement: Boolean(record.introVideoHeroPlacement),
    recommendations: parseLimitValue(record.recommendations),
    leadsVisible: parseLimitValue(record.leadsVisible),
    profileThemes: parseLimitValue(record.profileThemes),
    serviceVerification: Boolean(record.serviceVerification),
    yvityVerifiedBadge: Boolean(record.yvityVerifiedBadge),
    searchAppearance: Boolean(record.searchAppearance),
    profileAnalytics: Boolean(record.profileAnalytics),
    featuredAdvisorEligibility: Boolean(record.featuredAdvisorEligibility),
  };
}

async function loadConfigFromSupabase(): Promise<FeatureControlsConfig> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return {};
  const { data } = await supabase
    .from("platform_configs")
    .select("config")
    .eq("key", "feature_controls")
    .maybeSingle();
  return (data?.config as FeatureControlsConfig) || {};
}

async function loadConfig(): Promise<FeatureControlsConfig> {
  if (!canUseLocalDataFiles()) return loadConfigFromSupabase();
  return loadJsonFile<FeatureControlsConfig>(CONFIG_FILE, {});
}

export async function getConfiguredPlanLimits(planId: string): Promise<PlanLimits> {
  const config = await loadConfig();
  const key = planId as MembershipPlanId;
  const record = config.planLimits?.[key];
  if (record) return toUsersPlanLimits(record);
  const builtin = DEFAULT_PLAN_LIMITS[planId as MembershipPlanId];
  if (builtin) return builtin;
  return DEFAULT_PLAN_LIMITS.gold;
}

export async function getGlobalFeatureFlags(): Promise<Record<string, boolean>> {
  const config = await loadConfig();
  return {
    ...DEFAULT_GLOBAL_FLAGS,
    ...(config.globalFlags || {}),
  };
}

type AdminPlanPricingConfig = {
  plans?: Array<{
    id: string;
    salePriceInr?: number;
    listPriceInr?: number;
    included?: string[];
    excluded?: string[];
  }>;
};

export type AdminPlanPrice = {
  salePriceInr: number;
  listPriceInr: number | null;
  included?: string[];
  excluded?: string[];
};

/**
 * Reads plan prices AND marketing entitlements set in the admin app
 * (platform_configs key "plan_pricing").
 * Returns a map of planId → { salePriceInr, listPriceInr, included, excluded }.
 * Falls back to empty map (callers fall back to hardcoded plan-catalog prices/features).
 */
export async function getAdminPlanPrices(): Promise<Partial<Record<string, AdminPlanPrice>>> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return {};
  try {
    const { data } = await supabase
      .from("platform_configs")
      .select("config")
      .eq("key", "plan_pricing")
      .maybeSingle();
    const config = data?.config as AdminPlanPricingConfig | null;
    if (!config?.plans) return {};
    const prices: Partial<Record<string, AdminPlanPrice>> = {};
    for (const plan of config.plans) {
      const sale = Number(plan.salePriceInr ?? 0);
      const list = Number(plan.listPriceInr ?? 0);
      const entry: AdminPlanPrice = {
        salePriceInr: sale,
        listPriceInr: list > sale ? list : null,
      };
      if (Array.isArray(plan.included) && plan.included.length > 0) entry.included = plan.included;
      if (Array.isArray(plan.excluded) && plan.excluded.length > 0) entry.excluded = plan.excluded;
      // Include entry if it has a price or live entitlements
      if (sale > 0 || entry.included || entry.excluded) prices[plan.id] = entry;
    }
    return prices;
  } catch {
    return {};
  }
}

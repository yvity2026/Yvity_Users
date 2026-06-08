import type { AdvisorProfileSection, AdvisorTopSection } from "@/lib/advisor-nav";

export type ProfileStrengthLabel = "Starter" | "Growing" | "Strong" | "Elite";

export type ProfileHealthItem = {
  id: string;
  label: string;
  complete: boolean;
  weight: number;
  profileSection?: AdvisorProfileSection;
};

/**
 * Typed discriminator for Action Center entries that need a custom
 * handler instead of the generic "navigate to topSection/profileSection"
 * behaviour. New custom flows should add a literal here so the handler
 * switch stays type-checked.
 */
export type DashboardActionKind = "open-intro-video";

export type DashboardAction = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  topSection?: AdvisorTopSection;
  profileSection?: AdvisorProfileSection;
  /** When set, the dashboard runs the matching custom handler instead
   *  of doing the default navigation. */
  kind?: DashboardActionKind;
};

export type LeadSummary = {
  totalLeads: number;
  newLeads: number;
  followUpLeads: number;
  convertedLeads: number;
};

export type PerformanceSnapshot = {
  yvityScore: number;
  profileViews: number;
  profileViewsDelta: string;
  searchAppearances: number;
  searchDelta: string;
  profileSharesByOthers: number;
  testimonialsReceived: number;
  recommendationsReceived: number;
};

export type ProfilePerformanceInsight = {
  label: string;
  value: string;
  hint?: string;
};

export type DashboardOverviewModel = {
  displayName: string;
  photoUrl?: string;
  membershipPlan: string;
  profileCompletionPercent: number;
  profileStrength: ProfileStrengthLabel;
  performance: PerformanceSnapshot;
  leads: LeadSummary;
  healthItems: ProfileHealthItem[];
  actions: DashboardAction[];
  performanceInsights: ProfilePerformanceInsight[];
  viewsTrend: number[];
  membership: {
    planName: string;
    renewalDate: string;
    daysUntilRenewal: number;
    benefits: readonly string[];
    upgradePlanName: string;
    upgradeHighlight: string;
  };
  pendingTestimonialReplies: number;
};

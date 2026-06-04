import type { AdvisorProfileSection } from "@/lib/advisor-nav";
import type { ProfileStrengthLabel } from "@/lib/advisor-dashboard/types";

export type LeadSourceInsight = {
  id: "yvity_public_profile" | "self_referral" | "self_manual";
  label: string;
  count: number;
  percent: number;
};

export type ServicePerformanceRow = {
  id: string;
  label: string;
  views: number;
  leads: number;
};

export type CredibilitySuggestion = {
  id: string;
  title: string;
  description: string;
  profileSection?: AdvisorProfileSection;
};

export type InsightsModel = {
  profilePerformance: {
    totalProfileViews: number;
    monthProfileViews: number;
    monthViewsDelta: string;
    searchAppearances: number;
    searchDelta: string;
    profileShares: number;
    sharesDelta: string;
    contactRequests: number;
    contactDelta: string;
  };
  leadInsights: {
    totalLeads: number;
    newLeads: number;
    convertedLeads: number;
    conversionRate: number;
    bySource: LeadSourceInsight[];
  };
  servicePerformance: ServicePerformanceRow[];
  credibility: {
    yvityScore: number;
    scoreTrend: string;
    completionPercent: number;
    profileStrength: ProfileStrengthLabel;
    suggestions: CredibilitySuggestion[];
  };
  testimonialInsights: {
    total: number;
    averageRating: number;
    newThisMonth: number;
  };
};

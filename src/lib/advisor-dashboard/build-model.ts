import {
  buildMembershipModel,
  daysUntilRenewal,
  MEMBERSHIP_PLANS,
  upgradePlanId,
} from "@/lib/advisor-membership";
import type { Lead } from "@/lib/leads/types";
import { computeOverviewStats } from "@/lib/leads/utils";
import type { CareerData } from "@/lib/career-types";
import type { AchievementItem, ServiceItem, TestimonialItem } from "@/lib/sections/types";
import type { GalleryItem } from "@/lib/gallery-types";
import { getYvityScoreTotal } from "@/lib/advisor-score/build";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";
import { getEmptyAnalytics } from "./demo-analytics";
import type {
  DashboardAction,
  DashboardOverviewModel,
  LeadSummary,
  ProfileHealthItem,
  ProfileStrengthLabel,
} from "./types";

export function summarizeLeads(leads: Lead[]): LeadSummary {
  const stats = computeOverviewStats(leads);
  return {
    totalLeads: stats.total,
    newLeads: stats.new,
    followUpLeads: stats.followUpPending,
    convertedLeads: stats.converted,
  };
}

export function buildProfileHealth(input: {
  /** Registration / identity selfie — default public profile photo. */
  photoUrl?: string;
  introVideoUrl?: string;
  /** When false, intro video is omitted from profile health (Free plan). */
  introVideoEnabled?: boolean;
  career: CareerData;
  services: ServiceItem[];
  achievements: AchievementItem[];
  testimonials: TestimonialItem[];
  gallery: GalleryItem[];
}): ProfileHealthItem[] {
  const hasCareer =
    input.career.experiences.length > 0 &&
    input.career.experiences.some((e) => e.bullets.some((b) => b.trim().length > 0));
  const hasEducation = input.career.education.length > 0;
  const includeIntroVideo = input.introVideoEnabled !== false;

  return [
    {
      id: "photo",
      label: "Profile Photo",
      complete: Boolean(input.photoUrl?.trim()),
      weight: 12,
      profileSection: "profile",
    },
    ...(includeIntroVideo
      ? [
          {
            id: "intro-video" as const,
            label: "Introduction Video",
            complete: Boolean(input.introVideoUrl?.trim()),
            weight: 10,
            profileSection: "profile" as const,
          },
        ]
      : []),
    {
      id: "career",
      label: "Career Journey",
      complete: hasCareer,
      weight: 18,
      profileSection: "profile",
    },
    {
      id: "education",
      label: "Educational Journey",
      complete: hasEducation,
      weight: 12,
      profileSection: "profile",
    },
    {
      id: "services",
      label: "Services",
      complete: input.services.length >= 1,
      weight: 14,
      profileSection: "services",
    },
    {
      id: "testimonials",
      label: "Testimonials",
      complete: input.testimonials.length >= 2,
      weight: 14,
      profileSection: "testimonials",
    },
    {
      id: "achievements",
      label: "Achievements",
      complete: input.achievements.length >= 1,
      weight: 10,
      profileSection: "achievements",
    },
    {
      id: "gallery",
      label: "Gallery",
      complete: input.gallery.length >= 5,
      weight: 10,
      profileSection: "gallery",
    },
  ];
}

export function profileCompletionPercent(items: ProfileHealthItem[]): number {
  const total = items.reduce((s, i) => s + i.weight, 0);
  const done = items.filter((i) => i.complete).reduce((s, i) => s + i.weight, 0);
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function profileStrengthLabel(percent: number): ProfileStrengthLabel {
  if (percent >= 90) return "Elite";
  if (percent >= 70) return "Strong";
  if (percent >= 45) return "Growing";
  return "Starter";
}

export function computeYvityScore(
  completionPercent: number,
  input: {
    testimonials: TestimonialItem[];
    achievements: AchievementItem[];
    verifiedExperiences: number;
    verifiedCerts: number;
  },
): number {
  const socialProof = Math.min(
    15,
    input.testimonials.length * 2 + input.achievements.length + input.verifiedExperiences,
  );
  const trust = Math.min(10, input.verifiedCerts * 3);
  const raw = completionPercent * 0.75 + socialProof + trust;
  return Math.min(100, Math.round(raw));
}

export function buildDashboardActions(input: {
  healthItems: ProfileHealthItem[];
  leads: LeadSummary;
  testimonials: TestimonialItem[];
  pendingReplies: number;
  daysUntilRenewal: number;
}): DashboardAction[] {
  const actions: DashboardAction[] = [];

  if (input.leads.newLeads > 0) {
    actions.push({
      id: "leads-new",
      title: "Respond to New Leads",
      description: `${input.leads.newLeads} new ${input.leads.newLeads === 1 ? "inquiry" : "inquiries"} waiting in your inbox.`,
      priority: "high",
      topSection: "leads",
    });
  }

  if (input.pendingReplies > 0) {
    actions.push({
      id: "testimonial-reply",
      title: "Reply to Testimonials",
      description: `${input.pendingReplies} client ${input.pendingReplies === 1 ? "story" : "stories"} without your advisor response.`,
      priority: "medium",
      topSection: "profile",
      profileSection: "testimonials",
    });
  }

  if (input.daysUntilRenewal <= 45) {
    actions.push({
      id: "membership-renew",
      title: "Renew Membership",
      description: `Your plan renews in ${input.daysUntilRenewal} days — keep verified benefits active.`,
      priority: input.daysUntilRenewal <= 14 ? "high" : "low",
      topSection: "membership",
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return actions.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 7);
}

export function buildDashboardOverviewModel(input: {
  displayName?: string;
  profileSlug?: string;
  userIdentifier?: string;
  career: CareerData;
  services: ServiceItem[];
  achievements: AchievementItem[];
  testimonials: TestimonialItem[];
  gallery: GalleryItem[];
  leads: Lead[];
  /**
   * Effective intro video URL — usually `getEffectiveIntroVideoUrl(settings)`.
   * Falls back to the static `advisorProfile.home.introVideoUrl` seed when
   * the caller doesn't have settings context (e.g. server-side previews).
   */
  introVideoUrl?: string;
  /** Identity verification selfie — default public profile photo. */
  photoUrl?: string;
  /** When true, performance stats show zeros until the profile is approved. */
  underReview?: boolean;
  /** Admin approved IRDAI license — unlocks IRDA points and live visibility score. */
  profileApproved?: boolean;
  /** IRDA certificate uploaded during My Space setup. */
  irdaiCertificateUploaded?: boolean;
  publicProfileActive?: boolean;
  subscriptionPlan?: string | null;
  approvedAt?: string | null;
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  verifiedRecommendationCount?: number;
  accountCreatedAt?: string | null;
  decayPenalty?: number;
  decayActive?: boolean;
  decayGraceDaysRemaining?: number | null;
  monthlyActivity?: import("@/lib/advisor-score/decay").MonthlyScoreActivity;
  profileViews?: number;
  profileViewsDelta?: string;
  searchAppearances?: number;
  searchDelta?: string;
}): DashboardOverviewModel {
  const demo = getEmptyAnalytics();
  const profilePhotoUrl = input.photoUrl?.trim() || "";
  const planLimits = resolvePlanLimits(input.subscriptionPlan, "active");

  const healthItems = buildProfileHealth({
    photoUrl: profilePhotoUrl,
    introVideoUrl: input.introVideoUrl ?? "",
    introVideoEnabled: planLimits.introVideoEnabled,
    career: input.career,
    services: input.services,
    achievements: input.achievements,
    testimonials: input.testimonials,
    gallery: input.gallery,
  });
  const completionPercent = profileCompletionPercent(healthItems);
  const profileStrength = profileStrengthLabel(completionPercent);
  const leads = summarizeLeads(input.leads);
  const pendingTestimonialReplies = input.testimonials.filter(
    (t) => t.source === "customer" && !t.advisorReply?.text?.trim(),
  ).length;

  const profileApproved =
    input.profileApproved ??
    Boolean(input.approvedAt?.trim() && input.underReview === false);
  const irdaiCertificateUploaded = Boolean(input.irdaiCertificateUploaded);

  const yvityScore = getYvityScoreTotal({
    photoUrl: profilePhotoUrl,
    introVideoUrl: input.introVideoUrl ?? "",
    publicProfileActive: input.publicProfileActive ?? false,
    career: input.career,
    services: input.services,
    achievements: input.achievements,
    testimonials: input.testimonials,
    gallery: input.gallery,
    underReview: input.underReview,
    profileApproved,
    irdaiCertificateUploaded,
    verifiedRecommendationCount: profileApproved
      ? Math.max(0, input.verifiedRecommendationCount ?? 0)
      : 0,
    decayPenalty: input.decayActive ? Math.max(0, input.decayPenalty ?? 0) : 0,
    decayActive: input.decayActive,
    decayGraceDaysRemaining: input.decayGraceDaysRemaining,
    monthlyActivity: input.monthlyActivity,
  });

  const recommendationCount = profileApproved
    ? Math.max(0, input.verifiedRecommendationCount ?? 0)
    : 0;

  const membershipModel = buildMembershipModel({
    subscriptionPlan: input.subscriptionPlan,
    approvedAt: input.approvedAt,
    subscriptionStartedAt: input.subscriptionStartedAt,
    subscriptionExpiresAt: input.subscriptionExpiresAt,
  });
  const upgradeId = upgradePlanId(membershipModel.current.planId);
  const upgradePlan = MEMBERSHIP_PLANS.find((p) => p.id === upgradeId);
  const renewalDays = membershipModel.renewal.daysRemaining;
  const actions = buildDashboardActions({
    healthItems,
    leads,
    testimonials: input.testimonials,
    pendingReplies: pendingTestimonialReplies,
    daysUntilRenewal: renewalDays,
  });

  return {
    displayName: input.displayName?.trim() || "Advisor",
    photoUrl: profilePhotoUrl || undefined,
    membershipPlan: membershipModel.current.planName,
    profileCompletionPercent: completionPercent,
    profileStrength,
    performance: {
      yvityScore,
      profileViews: profileApproved ? Math.max(0, input.profileViews ?? 0) : 0,
      profileViewsDelta: profileApproved ? (input.profileViewsDelta ?? "0%") : "0%",
      searchAppearances: profileApproved ? Math.max(0, input.searchAppearances ?? 0) : 0,
      searchDelta: profileApproved ? (input.searchDelta ?? "0%") : "0%",
      profileSharesByOthers: profileApproved
        ? Math.max(0, input.monthlyActivity?.clientSharers ?? 0)
        : 0,
      testimonialsReceived: input.testimonials.length,
      recommendationsReceived: recommendationCount,
    },
    leads,
    healthItems,
    actions,
    performanceInsights: [
      { label: "Most viewed service", value: demo.mostViewedService },
      { label: "Most viewed achievement", value: demo.mostViewedAchievement },
      { label: "Testimonial growth", value: demo.testimonialGrowth, hint: "Last 30 days" },
      {
        label: "Recommendation growth",
        value: recommendationCount > 0 ? `+${recommendationCount} verified` : "0 verified",
        hint: "OTP-verified client recommendations",
      },
    ],
    viewsTrend: demo.viewsTrend,
    membership: {
      planName: membershipModel.current.planName,
      renewalDate: membershipModel.renewal.renewalDate,
      daysUntilRenewal: renewalDays,
      benefits: membershipModel.benefits.map((b) => b.label),
      canUpgrade: !!upgradePlan,
      upgradePlanName: upgradePlan?.name ?? "",
      upgradeHighlight: upgradePlan?.tagline ?? "",
    },
    pendingTestimonialReplies,
  };
}

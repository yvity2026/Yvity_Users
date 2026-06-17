"use client";

import { useEffect, useMemo, useState } from "react";
import { buildDashboardOverviewModel } from "@/lib/advisor-dashboard/build-model";
import type { DashboardOverviewModel } from "@/lib/advisor-dashboard/types";
import type { Lead } from "@/lib/leads/types";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { getAdvisorIntroVideoUrl } from "@/lib/intro-video";
import { useCareerData } from "@/lib/career-store";
import { useGalleryData } from "@/lib/gallery-store";
import { useAchievementsData, useServicesData, useTestimonialsData } from "@/lib/sections/stores";
import { useAuth } from "@/context/AuthUserContext";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { hasIrdaiCertificateUploaded } from "@/lib/advisor/irdai-workspace";
import { useVerifiedRecommendationCount } from "@/hooks/use-verified-recommendation-count";
import { useProfileShareCounts } from "@/hooks/use-profile-share-counts";
import { useScoreActivity } from "@/hooks/use-score-activity";

export function useAdvisorDashboardModel(): {
  model: DashboardOverviewModel | null;
  loading: boolean;
  refreshLeads: () => void;
} {
  const [career, , careerLoading] = useCareerData();
  const [services, , servicesLoading] = useServicesData();
  const [achievements, , achievementsLoading] = useAchievementsData();
  const [testimonials, , testimonialsLoading] = useTestimonialsData();
  const [gallery, , galleryLoading] = useGalleryData();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const { settings, loading: settingsLoading } = useAdvisorSettings();
  const { user, advisor } = useAuth();
  const { limits } = usePlanLimits();
  const profilePhotoUrl = resolveProfilePhotoUrl(user?.selfie_url);
  const underReview = advisor?.account_status === "under_review";
  const profileApproved = isAdvisorProfileApproved(advisor);
  const { count: verifiedRecommendationCount, loading: recsLoading } =
    useVerifiedRecommendationCount();
  const {
    decayPenalty,
    decayActive,
    graceDaysRemaining,
    monthlyActivity,
    profileViews,
    profileViewsDelta,
    searchAppearances,
    searchDelta,
    loading: activityLoading,
  } = useScoreActivity();
  const { selfShareCount, loading: sharesLoading } = useProfileShareCounts();

  const loadLeads = () => {
    setLeadsLoading(true);
    void fetch("/api/leads", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json: { data?: Lead[] }) => setLeads(json.data ?? []))
      .catch(() => setLeads([]))
      .finally(() => setLeadsLoading(false));
  };

  useEffect(() => {
    loadLeads();
    const onLeads = () => loadLeads();
    window.addEventListener("yvity-leads-updated", onLeads);
    return () => window.removeEventListener("yvity-leads-updated", onLeads);
  }, []);

  const loading =
    careerLoading ||
    servicesLoading ||
    achievementsLoading ||
    testimonialsLoading ||
    galleryLoading ||
    leadsLoading ||
    settingsLoading ||
    recsLoading ||
    sharesLoading ||
    activityLoading;

  const introVideoUrl = getAdvisorIntroVideoUrl(settings, limits);

  const model = useMemo(
    () =>
      loading
        ? null
        : buildDashboardOverviewModel({
            displayName: user?.name,
            profileSlug: advisor?.profile_slug,
            career,
            services,
            achievements,
            testimonials,
            gallery,
            leads,
            introVideoUrl,
            photoUrl: profilePhotoUrl,
            underReview,
            profileApproved,
            irdaiCertificateUploaded: hasIrdaiCertificateUploaded(advisor),
            publicProfileActive: settings.publicProfile.profileActive,
            subscriptionPlan: advisor?.subscription_plan,
            approvedAt: advisor?.approved_at,
            subscriptionStartedAt: advisor?.subscription_started_at,
            subscriptionExpiresAt: advisor?.subscription_expires_at,
            verifiedRecommendationCount,
            selfShareCount,
            accountCreatedAt: user?.created_at ?? null,
            decayPenalty,
            decayActive,
            decayGraceDaysRemaining: graceDaysRemaining,
            monthlyActivity: monthlyActivity ?? undefined,
            profileViews,
            profileViewsDelta,
            searchAppearances,
            searchDelta,
          }),
    [
      loading,
      career,
      services,
      achievements,
      testimonials,
      gallery,
      leads,
      introVideoUrl,
      limits.introVideoEnabled,
      profilePhotoUrl,
      user?.name,
      advisor?.profile_slug,
      underReview,
      profileApproved,
      advisor,
      settings.publicProfile.profileActive,
      advisor?.subscription_plan,
      advisor?.approved_at,
      verifiedRecommendationCount,
      selfShareCount,
      user?.created_at,
      decayPenalty,
      decayActive,
      graceDaysRemaining,
      monthlyActivity,
      profileViews,
      profileViewsDelta,
      searchAppearances,
      searchDelta,
    ],
  );

  // Keep advisor_scores in sync so Find Advisors card matches dashboard score.
  useEffect(() => {
    if (loading) return;
    fetch("/api/advisor/score/sync", { method: "POST", credentials: "same-origin" }).catch(
      () => {},
    );
  }, [loading]);

  return { model, loading, refreshLeads: loadLeads };
}

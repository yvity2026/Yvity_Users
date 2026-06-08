"use client";

import { useMemo } from "react";
import { buildYvityScoreModel } from "@/lib/advisor-score/build";
import type { YvityScoreModel } from "@/lib/advisor-score/types";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { hasIrdaiCertificateUploaded } from "@/lib/advisor/irdai-workspace";
import { useAuth } from "@/context/AuthUserContext";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { getAdvisorIntroVideoUrl } from "@/lib/intro-video";
import { useCareerData } from "@/lib/career-store";
import { useGalleryData } from "@/lib/gallery-store";
import { useAchievementsData, useServicesData, useTestimonialsData } from "@/lib/sections/stores";
import { useVerifiedRecommendationCount } from "@/hooks/use-verified-recommendation-count";
import { useProfileShareCounts } from "@/hooks/use-profile-share-counts";
import { useScoreActivity } from "@/hooks/use-score-activity";

/**
 * Aggregate the advisor's career / services / achievements / testimonials /
 * gallery / settings into the detailed YVITY Score model used by the
 * dashboard's "YVITY Score" tab.
 */
export function useAdvisorScore(): { model: YvityScoreModel | null; loading: boolean } {
  const [career, , careerLoading] = useCareerData();
  const [services, , servicesLoading] = useServicesData();
  const [achievements, , achievementsLoading] = useAchievementsData();
  const [testimonials, , testimonialsLoading] = useTestimonialsData();
  const [gallery, , galleryLoading] = useGalleryData();
  const { settings, loading: settingsLoading } = useAdvisorSettings();
  const { user, advisor } = useAuth();
  const underReview = advisor?.account_status === "under_review";
  const profileApproved = isAdvisorProfileApproved(advisor);
  const profilePhotoUrl = resolveProfilePhotoUrl(user?.selfie_url);
  const { count: verifiedRecommendationCount, loading: recsLoading } =
    useVerifiedRecommendationCount();
  const {
    selfShareCount,
    clientShareCount,
    loading: sharesLoading,
  } = useProfileShareCounts();
  const {
    decayPenalty,
    decayActive,
    graceDaysRemaining,
    monthlyActivity,
    negativeRules,
    loading: activityLoading,
  } = useScoreActivity();
  const { limits } = usePlanLimits();

  const loading =
    careerLoading ||
    servicesLoading ||
    achievementsLoading ||
    testimonialsLoading ||
    galleryLoading ||
    settingsLoading ||
    recsLoading ||
    sharesLoading ||
    activityLoading;

  const introVideoUrl = getAdvisorIntroVideoUrl(settings, limits);

  const model = useMemo<YvityScoreModel | null>(() => {
    if (loading) return null;
    return buildYvityScoreModel({
      photoUrl: profilePhotoUrl,
      introVideoUrl,
      publicProfileActive: settings.publicProfile.profileActive,
      career,
      services,
      achievements,
      testimonials,
      gallery,
      underReview,
      verifiedRecommendationCount,
      selfShareCount,
      clientShareCount,
      profileApproved,
      irdaiCertificateUploaded: hasIrdaiCertificateUploaded(advisor),
      accountCreatedAt: user?.created_at ?? null,
      decayPenalty,
      decayActive,
      decayGraceDaysRemaining: graceDaysRemaining,
      monthlyActivity: monthlyActivity ?? undefined,
      decayNegativeRules: negativeRules ?? undefined,
    });
  }, [
    loading,
    introVideoUrl,
    limits,
    profilePhotoUrl,
    settings.publicProfile.profileActive,
    career,
    services,
    achievements,
    testimonials,
    gallery,
    underReview,
    profileApproved,
    advisor,
    verifiedRecommendationCount,
    selfShareCount,
    clientShareCount,
    user?.created_at,
    decayPenalty,
    decayActive,
    graceDaysRemaining,
    monthlyActivity,
    negativeRules,
  ]);

  return { model, loading };
}

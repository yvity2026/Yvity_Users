"use client";

import { useMemo } from "react";
import { getYvityScoreTotal } from "@/lib/advisor-score/build";
import { useAuth } from "@/context/AuthUserContext";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { getPlanGatedIntroVideoUrl } from "@/lib/intro-video";
import { useCareerData } from "@/lib/career-store";
import { useGalleryData } from "@/lib/gallery-store";
import { usePublicProfileStats } from "@/hooks/use-public-profile-stats";
import { useResolvedPlanLimits } from "@/hooks/use-resolved-plan-limits";
import { useAchievementsData, useServicesData, useTestimonialsData } from "@/lib/sections/stores";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { hasIrdaiCertificateUploaded } from "@/lib/advisor/irdai-workspace";
import { useProfileShareCounts } from "@/hooks/use-profile-share-counts";

/** Public-facing YVITY Score — same activity model as dashboard and Score tab. */
export function usePublicYvityScore(): { score: number; loading: boolean } {
  const [career, , careerLoading] = useCareerData();
  const [services, , servicesLoading] = useServicesData();
  const [achievements, , achievementsLoading] = useAchievementsData();
  const [testimonials, , testimonialsLoading] = useTestimonialsData();
  const [gallery, , galleryLoading] = useGalleryData();
  const { settings, loading: settingsLoading } = useAdvisorSettings();
  const { user, advisor } = useAuth();
  const publicView = usePublicProfileView();
  const { limits } = useResolvedPlanLimits();
  const { recommendationCount, decayPenalty, decayActive, graceDaysRemaining, monthlyActivity, loading: recsLoading } =
    usePublicProfileStats();
  const { selfShareCount, loading: sharesLoading } = useProfileShareCounts();

  const photoUrl =
    resolveProfilePhotoUrl(publicView?.selfie_url) ||
    resolveProfilePhotoUrl(user?.selfie_url);

  const profileApproved = publicView
    ? isAdvisorProfileApproved(publicView.profile)
    : isAdvisorProfileApproved(advisor);

  const underReview = publicView
    ? publicView.profile.account_status === "under_review"
    : advisor?.account_status === "under_review";

  const irdaiCertificateUploaded = publicView
    ? Boolean(publicView.profile.iridai_certificate_url?.trim() &&
        publicView.profile.iridai_certificate_url !== "pending")
    : hasIrdaiCertificateUploaded(advisor);

  const loading =
    careerLoading ||
    servicesLoading ||
    achievementsLoading ||
    testimonialsLoading ||
    galleryLoading ||
    settingsLoading ||
    recsLoading ||
    sharesLoading;

  const introVideoUrl = getPlanGatedIntroVideoUrl(settings, limits);

  const score = useMemo(() => {
    if (loading) return 0;
    return getYvityScoreTotal({
      photoUrl,
      introVideoUrl,
      publicProfileActive: settings.publicProfile.profileActive,
      career,
      services,
      achievements,
      testimonials,
      gallery,
      underReview,
      profileApproved,
      irdaiCertificateUploaded,
      verifiedRecommendationCount: profileApproved ? recommendationCount : 0,
      selfShareCount,
      decayPenalty,
      decayActive,
      decayGraceDaysRemaining: graceDaysRemaining,
      monthlyActivity: monthlyActivity ?? undefined,
    });
  }, [
    loading,
    photoUrl,
    introVideoUrl,
    settings.publicProfile.profileActive,
    career,
    services,
    achievements,
    testimonials,
    gallery,
    underReview,
    profileApproved,
    irdaiCertificateUploaded,
    recommendationCount,
    selfShareCount,
    decayPenalty,
    decayActive,
    graceDaysRemaining,
    monthlyActivity,
    limits,
  ]);

  return { score, loading };
}

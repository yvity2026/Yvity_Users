"use client";

import { useMemo } from "react";
import { buildYvityScoreModel } from "@/lib/advisor-score/build";
import type { YvityScoreModel } from "@/lib/advisor-score/types";
import { useAuth } from "@/context/AuthUserContext";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";
import { getEffectiveIntroVideoUrl } from "@/lib/intro-video";
import { useCareerData } from "@/lib/career-store";
import { useGalleryData } from "@/lib/gallery-store";
import { useAchievementsData, useServicesData, useTestimonialsData } from "@/lib/sections/stores";

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
  const profilePhotoUrl = resolveProfilePhotoUrl(user?.selfie_url);

  const loading =
    careerLoading ||
    servicesLoading ||
    achievementsLoading ||
    testimonialsLoading ||
    galleryLoading ||
    settingsLoading;

  const introVideoUrl = getEffectiveIntroVideoUrl(settings);

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
    });
  }, [
    loading,
    introVideoUrl,
    profilePhotoUrl,
    settings.publicProfile.profileActive,
    career,
    services,
    achievements,
    testimonials,
    gallery,
    underReview,
  ]);

  return { model, loading };
}

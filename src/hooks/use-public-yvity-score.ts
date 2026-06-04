"use client";

import { useMemo } from "react";
import { getYvityScoreTotal } from "@/lib/advisor-score/build";
import { useAuth } from "@/context/AuthUserContext";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { getEffectiveIntroVideoUrl } from "@/lib/intro-video";
import { useCareerData } from "@/lib/career-store";
import { useGalleryData } from "@/lib/gallery-store";
import { useAchievementsData, useServicesData, useTestimonialsData } from "@/lib/sections/stores";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";

/** Public-facing YVITY Score — same activity model as dashboard and Score tab. */
export function usePublicYvityScore(): { score: number; loading: boolean } {
  const [career, , careerLoading] = useCareerData();
  const [services, , servicesLoading] = useServicesData();
  const [achievements, , achievementsLoading] = useAchievementsData();
  const [testimonials, , testimonialsLoading] = useTestimonialsData();
  const [gallery, , galleryLoading] = useGalleryData();
  const { settings, loading: settingsLoading } = useAdvisorSettings();
  const { user, advisor } = useAuth();
  const photoUrl = resolveProfilePhotoUrl(user?.selfie_url);
  const underReview = advisor?.account_status === "under_review";

  const loading =
    careerLoading ||
    servicesLoading ||
    achievementsLoading ||
    testimonialsLoading ||
    galleryLoading ||
    settingsLoading;

  const introVideoUrl = getEffectiveIntroVideoUrl(settings);

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
  ]);

  return { score, loading };
}

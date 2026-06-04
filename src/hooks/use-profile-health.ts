"use client";

import { useMemo } from "react";
import {
  buildProfileHealth,
  profileCompletionPercent,
  profileStrengthLabel,
} from "@/lib/advisor-dashboard/build-model";
import type { ProfileHealthItem, ProfileStrengthLabel } from "@/lib/advisor-dashboard/types";
import type { ProfileHealthId } from "@/lib/advisor-dashboard/section-guidance";
import { useAuth } from "@/context/AuthUserContext";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { getEffectiveIntroVideoUrl } from "@/lib/intro-video";
import { useCareerData } from "@/lib/career-store";
import { useGalleryData } from "@/lib/gallery-store";
import { useAchievementsData, useServicesData, useTestimonialsData } from "@/lib/sections/stores";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";

export function useProfileHealth(): {
  items: ProfileHealthItem[];
  completionPercent: number;
  profileStrength: ProfileStrengthLabel;
  loading: boolean;
  getItem: (id: ProfileHealthId) => ProfileHealthItem | undefined;
  isComplete: (id: ProfileHealthId) => boolean;
} {
  const [career, , careerLoading] = useCareerData();
  const [services, , servicesLoading] = useServicesData();
  const [achievements, , achievementsLoading] = useAchievementsData();
  const [testimonials, , testimonialsLoading] = useTestimonialsData();
  const [gallery, , galleryLoading] = useGalleryData();
  const { settings, loading: settingsLoading } = useAdvisorSettings();
  const { user } = useAuth();
  const photoUrl = resolveProfilePhotoUrl(user?.selfie_url);
  const introVideoUrl = getEffectiveIntroVideoUrl(settings);

  const loading =
    careerLoading ||
    servicesLoading ||
    achievementsLoading ||
    testimonialsLoading ||
    galleryLoading ||
    settingsLoading;

  const value = useMemo(() => {
    if (loading) {
      return {
        items: [] as ProfileHealthItem[],
        completionPercent: 0,
        profileStrength: "Starter" as ProfileStrengthLabel,
        getItem: () => undefined,
        isComplete: () => false,
      };
    }
    const items = buildProfileHealth({
      photoUrl,
      introVideoUrl,
      career,
      services,
      achievements,
      testimonials,
      gallery,
    });
    const completionPercent = profileCompletionPercent(items);
    const profileStrength = profileStrengthLabel(completionPercent);
    const getItem = (id: ProfileHealthId) => items.find((i) => i.id === id);
    const isComplete = (id: ProfileHealthId) => getItem(id)?.complete ?? false;
    return { items, completionPercent, profileStrength, getItem, isComplete };
  }, [
    loading,
    photoUrl,
    introVideoUrl,
    career,
    services,
    achievements,
    testimonials,
    gallery,
  ]);

  return { ...value, loading };
}

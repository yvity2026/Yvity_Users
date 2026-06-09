"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import {
  resolveCareerExperienceDisplay,
  resolveProfileHeroStat,
  resolveServiceExperienceDisplay,
} from "@/lib/advisor/profession-experience";
import { buildDisplayProfileFromPublicView } from "@/context/public-profile-view-context";
import {
  applyAboutToDisplayProfile,
  buildAdvisorDisplayProfile,
  type AdvisorDisplayProfile,
} from "@/lib/advisor-display-profile";
import { buildPublicProfileBannerStats } from "@/lib/home/public-profile-banner-stats";
import { usePublicProfileStats } from "@/hooks/use-public-profile-stats";
import { useResolvedPublicAdvisorPayload } from "@/hooks/use-resolved-public-advisor-payload";
import { useCareerData } from "@/lib/career-store";
import {
  useAchievementsData,
  useServicesData,
  useTestimonialsData,
} from "@/lib/sections/stores";

export function useAdvisorDisplayProfile(
  designation?: string,
): AdvisorDisplayProfile {
  const { user, advisor } = useAuth();
  const publicAdvisor = useResolvedPublicAdvisorPayload();
  const [services] = useServicesData();
  const [testimonials] = useTestimonialsData();
  const [achievements] = useAchievementsData();
  const [career] = useCareerData();
  const { recommendationCount } = usePublicProfileStats();
  const profileApproved = publicAdvisor
    ? isAdvisorProfileApproved(publicAdvisor.profile)
    : isAdvisorProfileApproved(advisor);

  return useMemo(() => {
    let base: AdvisorDisplayProfile;

    if (publicAdvisor) {
      base = buildDisplayProfileFromPublicView(publicAdvisor);
    } else if (user?.id) {
      base = buildAdvisorDisplayProfile({
        user,
        advisor,
        designation,
      });
    } else {
      base = buildAdvisorDisplayProfile({ user, advisor, designation });
    }

    const isOwner = Boolean(user?.id && publicAdvisor?.userId === user.id);
    const aboutText = isOwner
      ? user?.about?.trim() || publicAdvisor?.about?.trim() || ""
      : publicAdvisor?.about?.trim() || user?.about?.trim() || "";
    base = applyAboutToDisplayProfile(base, aboutText);

    const experienceDisplay = resolveServiceExperienceDisplay(services, profileApproved);
    const journeyExperienceDisplay = resolveCareerExperienceDisplay(career);
    const profileHeroStat = resolveProfileHeroStat(services, profileApproved);

    const bannerStats = buildPublicProfileBannerStats({
      services,
      testimonials,
      achievements,
      career,
      profileApproved,
      experienceDisplay,
      journeyExperienceDisplay,
      profileHeroStat,
      recommendationCount,
      phone: base.phone,
    });

    return {
      ...base,
      experienceDisplay,
      clientsCount: profileHeroStat.value,
      profileHeroStat,
      profileCapacityId: profileHeroStat.capacityId,
      rating: bannerStats.avgRating,
      companyName: bannerStats.companyName,
      mdrtMember: bannerStats.mdrtMember,
      stats: bannerStats.sectionBannerStats,
      highlights: bannerStats.highlightLabels,
    };
  }, [
    user,
    advisor,
    designation,
    publicAdvisor,
    services,
    testimonials,
    achievements,
    career,
    profileApproved,
    recommendationCount,
  ]);
}

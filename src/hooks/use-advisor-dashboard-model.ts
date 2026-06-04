"use client";

import { useEffect, useMemo, useState } from "react";
import { buildDashboardOverviewModel } from "@/lib/advisor-dashboard/build-model";
import type { DashboardOverviewModel } from "@/lib/advisor-dashboard/types";
import type { Lead } from "@/lib/leads/types";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { getEffectiveIntroVideoUrl } from "@/lib/intro-video";
import { useCareerData } from "@/lib/career-store";
import { useGalleryData } from "@/lib/gallery-store";
import { useAchievementsData, useServicesData, useTestimonialsData } from "@/lib/sections/stores";
import { useAuth } from "@/context/AuthUserContext";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";

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
  const profilePhotoUrl = resolveProfilePhotoUrl(user?.selfie_url);
  const underReview = advisor?.account_status === "under_review";

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
    settingsLoading;

  const introVideoUrl = getEffectiveIntroVideoUrl(settings);

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
            publicProfileActive: settings.publicProfile.profileActive,
            subscriptionPlan: advisor?.subscription_plan,
            approvedAt: advisor?.approved_at,
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
      profilePhotoUrl,
      user?.name,
      advisor?.profile_slug,
      underReview,
      settings.publicProfile.profileActive,
      advisor?.subscription_plan,
      advisor?.approved_at,
    ],
  );

  return { model, loading, refreshLeads: loadLeads };
}

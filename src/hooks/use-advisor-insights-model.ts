"use client";

import { useEffect, useMemo, useState } from "react";
import { buildInsightsModel } from "@/lib/advisor-insights/build-model";
import type { InsightsModel } from "@/lib/advisor-insights/types";
import type { Lead } from "@/lib/leads/types";
import { useAuth } from "@/context/AuthUserContext";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { getEffectiveIntroVideoUrl } from "@/lib/intro-video";
import { resolveProfilePhotoUrl } from "@/lib/profile-photo";
import { useCareerData } from "@/lib/career-store";
import { useGalleryData } from "@/lib/gallery-store";
import { useAchievementsData, useServicesData, useTestimonialsData } from "@/lib/sections/stores";

export function useAdvisorInsightsModel(): {
  model: InsightsModel | null;
  loading: boolean;
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
  const photoUrl = resolveProfilePhotoUrl(user?.selfie_url);
  const underReview = advisor?.account_status === "under_review";

  useEffect(() => {
    let cancelled = false;
    setLeadsLoading(true);
    void fetch("/api/leads", { cache: "no-store", credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json: { data?: Lead[] }) => {
        if (!cancelled) setLeads(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setLeads([]);
      })
      .finally(() => {
        if (!cancelled) setLeadsLoading(false);
      });

    const onLeads = () => {
      void fetch("/api/leads", { cache: "no-store", credentials: "same-origin" })
        .then((res) => (res.ok ? res.json() : { data: [] }))
        .then((json: { data?: Lead[] }) => setLeads(json.data ?? []))
        .catch(() => setLeads([]));
    };
    window.addEventListener("yvity-leads-updated", onLeads);
    return () => {
      cancelled = true;
      window.removeEventListener("yvity-leads-updated", onLeads);
    };
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
        : buildInsightsModel({
            career,
            services,
            achievements,
            testimonials,
            gallery,
            leads,
            introVideoUrl,
            photoUrl,
            underReview,
            publicProfileActive: settings.publicProfile.profileActive,
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
      photoUrl,
      underReview,
      settings.publicProfile.profileActive,
    ],
  );

  return { model, loading };
}

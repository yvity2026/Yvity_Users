"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Briefcase,
  ImageIcon,
  Quote,
  UserRound,
  Video,
} from "lucide-react";
import { ReviewWorkspaceSection } from "@/components/advisor/review/review-workspace-section";
import { AdvisorReviewBanner } from "@/components/advisor/review/advisor-review-banner";
import { AdvisorDashboardOverview } from "@/components/advisor/dashboard/advisor-dashboard-overview";
import { AdvisorCareerProfile } from "@/components/career/advisor-career-profile";
import { IntroVideoUploadModal } from "@/components/intro-video/intro-video-upload-modal";
import { GalleryShowcase } from "@/components/gallery/gallery-showcase";
import { AchievementsShowcase } from "@/components/sections/achievements-showcase";
import { ServicesShowcase } from "@/components/sections/services-showcase";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { useCareerData } from "@/lib/career-store";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { getAdvisorIntroVideoUrl } from "@/lib/intro-video";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { buildProfileHealth, profileCompletionPercent } from "@/lib/advisor-dashboard/build-model";
import { useAchievementsData, useServicesData, useTestimonialsData } from "@/lib/sections/stores";
import { useGalleryData } from "@/lib/gallery-store";
import type { AdvisorProfileSection, AdvisorTopSection } from "@/lib/advisor-nav";

export function AdvisorReviewFillWorkspace({
  onNavigateTop,
  onNavigateProfile,
  onOpenRequestTestimonial,
}: {
  onNavigateTop?: (section: AdvisorTopSection) => void;
  onNavigateProfile?: (section: AdvisorProfileSection) => void;
  onOpenRequestTestimonial?: () => void;
} = {}) {
  const [career, setCareer] = useCareerData();
  const [services, , servicesLoading] = useServicesData();
  const [achievements, , achievementsLoading] = useAchievementsData();
  const [testimonials, , testimonialsLoading] = useTestimonialsData();
  const [gallery, , galleryLoading] = useGalleryData();
  const { settings } = useAdvisorSettings();
  const { limits, introVideoEnabled } = usePlanLimits();
  const [introVideoModalOpen, setIntroVideoModalOpen] = useState(false);

  const introVideoUrl = getAdvisorIntroVideoUrl(settings, limits);

  const health = useMemo(
    () =>
      buildProfileHealth({
        introVideoUrl,
        introVideoEnabled,
        career,
        services,
        achievements,
        testimonials,
        gallery,
      }),
    [introVideoUrl, introVideoEnabled, career, services, achievements, testimonials, gallery],
  );

  const completion = profileCompletionPercent(health);
  const incomplete = health.filter((item) => !item.complete && item.id !== "services");

  const careerComplete = health.find((h) => h.id === "career")?.complete ?? false;
  const educationComplete = health.find((h) => h.id === "education")?.complete ?? false;
  const achievementsComplete = health.find((h) => h.id === "achievements")?.complete ?? false;
  const testimonialsComplete = health.find((h) => h.id === "testimonials")?.complete ?? false;
  const galleryComplete = health.find((h) => h.id === "gallery")?.complete ?? false;
  const introComplete = health.find((h) => h.id === "intro-video")?.complete ?? false;

  const dataLoading =
    servicesLoading || achievementsLoading || testimonialsLoading || galleryLoading;

  const sectionAnchor: Record<string, string> = {
    career: "review-section-career",
    education: "review-section-career",
    testimonials: "review-section-testimonials",
    achievements: "review-section-achievements",
    gallery: "review-section-gallery",
    "intro-video": "review-section-intro-video",
    services: "review-section-services",
  };

  const scrollTo = (healthId: string) => {
    const id = sectionAnchor[healthId];
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navigateTop = onNavigateTop ?? (() => {});
  const navigateProfile = onNavigateProfile ?? (() => {});
  const openTestimonial = onOpenRequestTestimonial ?? (() => {});

  return (
    <div className="space-y-5 sm:space-y-6">
      <AdvisorReviewBanner
        completion={completion}
        incomplete={incomplete}
        onJumpTo={scrollTo}
      />

      <AdvisorDashboardOverview
        underReview
        onNavigateTop={navigateTop}
        onNavigateProfile={navigateProfile}
        onOpenRequestTestimonial={openTestimonial}
      />

      {dataLoading ? (
        <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading workspace">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          <ReviewWorkspaceSection
            id="review-section-services"
            title="Your services"
            subtitle="Submitted for verification — locked until admin approves. Preview how they will appear publicly."
            icon={Briefcase}
            status="locked"
            complete={services.length > 0}
          >
            <ServicesShowcase embedded reviewReadOnly />
          </ReviewWorkspaceSection>

          <ReviewWorkspaceSection
            id="review-section-career"
            title="Professional journey"
            subtitle="Add work experience with highlights — clients trust advisors who show real career depth."
            icon={UserRound}
            status={careerComplete && educationComplete ? "complete" : "empty"}
            complete={careerComplete && educationComplete}
          >
            <AdvisorCareerProfile data={career} setData={setCareer} />
          </ReviewWorkspaceSection>

          <ReviewWorkspaceSection
            id="review-section-achievements"
            title="Achievements & awards"
            subtitle="MDRT, COT, club memberships, and industry recognition build instant credibility."
            icon={Award}
            status={achievementsComplete ? "complete" : "empty"}
            complete={achievementsComplete}
          >
            <AchievementsShowcase editable embedded />
          </ReviewWorkspaceSection>

          <ReviewWorkspaceSection
            id="review-section-testimonials"
            title="Client testimonials"
            subtitle="Aim for at least two verified testimonials — social proof is one of the strongest trust signals."
            icon={Quote}
            status={testimonialsComplete ? "complete" : "empty"}
            complete={testimonialsComplete}
          >
            <TestimonialsShowcase editable embedded />
          </ReviewWorkspaceSection>

          <ReviewWorkspaceSection
            id="review-section-gallery"
            title="Gallery"
            subtitle="Upload photos from events, awards, and client moments — three or more images recommended."
            icon={ImageIcon}
            status={galleryComplete ? "complete" : "empty"}
            complete={galleryComplete}
          >
            <GalleryShowcase editable embedded />
          </ReviewWorkspaceSection>

          {introVideoEnabled ? (
          <ReviewWorkspaceSection
            id="review-section-intro-video"
            title="Introduction video"
            subtitle={
              limits.introVideoHeroPlacement
                ? "Gold profiles show your intro prominently in the hero — up to 2 minutes."
                : "Silver profiles can add a short intro (up to 30 seconds) on the public profile."
            }
            icon={Video}
            status={introComplete ? "complete" : "empty"}
            complete={introComplete}
          >
            {introComplete ? (
              <p className="rounded-xl border border-[oklch(0.82_0.16_162/0.3)] bg-[oklch(0.82_0.16_162/0.08)] px-4 py-3 text-sm text-[oklch(0.82_0.16_162)]">
                Your intro video is added. You can replace it anytime from Settings after approval.
              </p>
            ) : (
              <div className="glass-strong rounded-2xl border border-dashed border-white/15 p-8 text-center">
                <Video className="mx-auto size-10 text-muted-foreground" aria-hidden />
                <p className="mt-3 text-base font-semibold">No intro video yet</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  {limits.introVideoHeroPlacement
                    ? "Upload up to a 2-minute welcome clip — it appears prominently on your public profile."
                    : "Record or upload a short welcome clip (up to 30 seconds) for your public profile."}
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                  onClick={() => setIntroVideoModalOpen(true)}
                >
                  Add intro video
                </button>
              </div>
            )}
          </ReviewWorkspaceSection>
          ) : null}
        </div>
      )}

      {introVideoEnabled ? (
        <IntroVideoUploadModal
          open={introVideoModalOpen}
          onClose={() => setIntroVideoModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

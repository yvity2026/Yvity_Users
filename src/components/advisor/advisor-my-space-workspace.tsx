"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { AdvisorWorkspaceHeader } from "@/components/advisor/advisor-workspace-header";
import { AdvisorMySpaceHub } from "@/components/advisor/advisor-my-space-hub";
import { MySpaceSectionBoundary } from "@/components/advisor/my-space-section-boundary";
import {
  type MySpaceSectionKey,
  parseMySpaceSectionKey,
  getMySpaceSectionCard,
} from "@/lib/my-space-sections";
import {
  ADVISOR_PROFILE_NAV,
  ADVISOR_TOP_NAV,
  DEFAULT_PROFILE_SECTION,
  DEFAULT_TOP_SECTION,
  type AdvisorProfileSection,
  type AdvisorTopSection,
} from "@/lib/advisor-nav";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { cn } from "@/lib/utils";
import { AdvisorDashboardOverview } from "@/components/advisor/dashboard/advisor-dashboard-overview";
import { AdvisorInsightsModule } from "@/components/advisor/insights/advisor-insights-module";
import { AdvisorMembershipModule } from "@/components/advisor/membership/advisor-membership-module";
import { AdvisorSettingsModule } from "@/components/advisor/settings/advisor-settings-module";
import { AdvisorLeadsModule } from "@/components/advisor/leads/advisor-leads-module";
import { AdvisorSectionPlaceholder } from "@/components/advisor/advisor-section-placeholder";
import {
  PublicProfilePreviewModule,
  type PublicProfileViewMode,
} from "@/components/advisor/public-profile/public-profile-preview-module";
import { AdvisorScoreModule } from "@/components/advisor/score/advisor-score-module";
import { GalleryShowcase } from "@/components/gallery/gallery-showcase";
import { ServicesShowcase } from "@/components/sections/services-showcase";
import { AchievementsShowcase } from "@/components/sections/achievements-showcase";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { useCareerData } from "@/lib/career-store";
import { useTestimonialSubmit } from "@/lib/testimonial-submit-store";
import { AdvisorCareerProfile } from "@/components/career/advisor-career-profile";
import { AdvisorReviewDashboard } from "@/components/advisor/review/advisor-review-dashboard";
import { IntroVideoUploadModal } from "@/components/intro-video/intro-video-upload-modal";
import { useShareProfileLink } from "@/hooks/use-share-profile-link";

export type AdvisorMySpaceWorkspaceProps = {
  reviewMode?: boolean;
};

function SectionLoading({ label }: { label: string }) {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label={`Loading ${label}`}>
      <div className="h-10 rounded-xl bg-white/5" />
      <div className="h-32 rounded-2xl bg-white/5" />
      <div className="h-48 rounded-2xl bg-white/5" />
    </div>
  );
}

export function AdvisorMySpaceWorkspace({ reviewMode = false }: AdvisorMySpaceWorkspaceProps) {
  const [data, setData, careerLoading] = useCareerData();
  const { openRequestTestimonial } = useTestimonialSubmit();

  const [activeKey, setActiveKey] = useState<MySpaceSectionKey | null>(null);
  const [topSection, setTopSection] = useState<AdvisorTopSection>(DEFAULT_TOP_SECTION);
  const [profileSection, setProfileSection] =
    useState<AdvisorProfileSection>(DEFAULT_PROFILE_SECTION);
  const [publicViewMode, setPublicViewMode] = useState<PublicProfileViewMode>("mobile");
  const [introVideoModalOpen, setIntroVideoModalOpen] = useState(false);
  const display = useAdvisorDisplayProfile();
  const { share: shareProfile } = useShareProfileLink();

  const navigateProfile = (section: AdvisorProfileSection) => {
    setTopSection("profile");
    setProfileSection(section);
  };

  const handleOpenSection = (key: MySpaceSectionKey) => {
    setActiveKey(key);
    const parsed = parseMySpaceSectionKey(key);
    if (parsed.topSection) setTopSection(parsed.topSection);
    if (parsed.profileSection) {
      setTopSection("profile");
      setProfileSection(parsed.profileSection);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHub = () => {
    setActiveKey(null);
    setTopSection(DEFAULT_TOP_SECTION);
    setProfileSection(DEFAULT_PROFILE_SECTION);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeTop = ADVISOR_TOP_NAV.find((s) => s.id === topSection)!;
  const activeProfileItem = ADVISOR_PROFILE_NAV.find((s) => s.id === profileSection)!;
  const activeCard = activeKey ? getMySpaceSectionCard(activeKey) : null;
  const sectionLabel = activeCard?.label ?? activeTop.label;

  const breadcrumb: string[] =
    topSection === "profile" ? ["Profile Management", activeProfileItem.label] : [activeTop.label];

  const isPublicDesktop = topSection === "public-profile" && publicViewMode === "desktop";

  const renderSectionBody = (): ReactNode => {
    if (topSection === "overview") {
      if (reviewMode) {
        return (
          <AdvisorReviewDashboard
            onNavigateTop={(section) => {
              setActiveKey(`top:${section}` as MySpaceSectionKey);
              setTopSection(section);
            }}
            onNavigateProfile={navigateProfile}
            onOpenRequestTestimonial={openRequestTestimonial}
          />
        );
      }
      return (
        <AdvisorDashboardOverview
          onNavigateTop={(section) => {
            setActiveKey(`top:${section}` as MySpaceSectionKey);
            setTopSection(section);
          }}
          onNavigateProfile={navigateProfile}
          onOpenRequestTestimonial={openRequestTestimonial}
        />
      );
    }
    if (topSection === "public-profile") {
      return (
        <PublicProfilePreviewModule
          viewMode={publicViewMode}
          onViewModeChange={setPublicViewMode}
          compactEmbed
        />
      );
    }
    if (topSection === "profile") {
      if (profileSection === "profile" && careerLoading) {
        return <SectionLoading label="My Career" />;
      }
      switch (profileSection) {
        case "profile":
          return <AdvisorCareerProfile data={data} setData={setData} />;
        case "services":
          return reviewMode ? (
            <ServicesShowcase embedded reviewReadOnly />
          ) : (
            <ServicesShowcase editable embedded />
          );
        case "achievements":
          return <AchievementsShowcase editable embedded />;
        case "testimonials":
          return <TestimonialsShowcase editable embedded />;
        case "gallery":
          return <GalleryShowcase editable embedded />;
        case "score":
          return (
            <AdvisorScoreModule
              onNavigateProfileSection={navigateProfile}
              onShareProfile={() => void shareProfile()}
              onOpenIntroVideoModal={() => setIntroVideoModalOpen(true)}
            />
          );
      }
    }
    if (topSection === "leads") return <AdvisorLeadsModule />;
    if (topSection === "insights") {
      return (
        <AdvisorInsightsModule
          onNavigateTop={(section) => {
            setActiveKey(`top:${section}` as MySpaceSectionKey);
            setTopSection(section);
          }}
          onNavigateProfile={navigateProfile}
        />
      );
    }
    if (topSection === "membership") return <AdvisorMembershipModule />;
    if (topSection === "settings") return <AdvisorSettingsModule />;

    return (
      <AdvisorSectionPlaceholder
        icon={activeTop.icon}
        title={activeTop.label}
        description={activeTop.description}
      />
    );
  };

  return (
    <div className="flex min-h-0 flex-col overflow-x-clip">
      {activeKey !== null && !isPublicDesktop ? (
        <AdvisorWorkspaceHeader advisorName={display.name} breadcrumb={breadcrumb} />
      ) : null}

      <div
        className={cn(
          "mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8",
          activeKey !== null && "pb-24 max-lg:pb-28",
          isPublicDesktop && "max-w-[1600px] px-2 py-2 md:px-3 md:py-2",
        )}
      >
        {activeKey === null ? (
          <AdvisorMySpaceHub onOpenSection={handleOpenSection} />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            <button
              type="button"
              onClick={handleBackToHub}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-white/30 hover:bg-white/[0.06]"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to My Space</span>
            </button>

            {activeCard ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:px-5 sm:py-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {activeCard.group || "Workspace section"}
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
                  {activeCard.label}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{activeCard.description}</p>
              </div>
            ) : null}

            <MySpaceSectionBoundary sectionLabel={sectionLabel}>
              <div
                key={`body-${topSection}-${profileSection}`}
                className="animate-in fade-in duration-300"
              >
                {renderSectionBody()}
              </div>
            </MySpaceSectionBoundary>
          </div>
        )}
      </div>

      <IntroVideoUploadModal
        open={introVideoModalOpen}
        onClose={() => setIntroVideoModalOpen(false)}
      />
    </div>
  );
}

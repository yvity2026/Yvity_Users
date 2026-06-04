"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AdvisorDashboardOverview } from "@/components/advisor/dashboard/advisor-dashboard-overview";
import { AdvisorInsightsModule } from "@/components/advisor/insights/advisor-insights-module";
import { AdvisorMembershipModule } from "@/components/advisor/membership/advisor-membership-module";
import { AdvisorSettingsModule } from "@/components/advisor/settings/advisor-settings-module";
import { AdvisorLeadsModule } from "@/components/advisor/leads/advisor-leads-module";
import { AdvisorSectionPlaceholder } from "@/components/advisor/advisor-section-placeholder";
import { AdvisorMobileBottomNav } from "@/components/advisor/advisor-mobile-bottom-nav";
import { AdvisorSidebar, SIDEBAR_CONTENT_OFFSET } from "@/components/advisor/advisor-sidebar";
import { AdvisorWorkspaceHeader } from "@/components/advisor/advisor-workspace-header";
import { ProfileManagementSheet } from "@/components/advisor/profile/profile-management-sheet";
import {
  PublicProfilePreviewModule,
  type PublicProfileViewMode,
} from "@/components/advisor/public-profile/public-profile-preview-module";
import { AdvisorScoreModule } from "@/components/advisor/score/advisor-score-module";
import { GalleryShowcase } from "@/components/gallery/gallery-showcase";
import { ServicesShowcase } from "@/components/sections/services-showcase";
import { AchievementsShowcase } from "@/components/sections/achievements-showcase";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { LogOut, Eye } from "lucide-react";
import { YvityLogo } from "@/components/brand/yvity-logo";
import { useAuth } from "@/lib/auth-store";
import { useCareerData } from "@/lib/career-store";
import { useTestimonialSubmit } from "@/lib/testimonial-submit-store";
import { AdvisorCareerProfile } from "@/components/career/advisor-career-profile";
import { AdvisorReviewDashboard } from "@/components/advisor/review/advisor-review-dashboard";
import { Button } from "@/components/ui/button";
import {
  ADVISOR_PROFILE_NAV,
  ADVISOR_TOP_NAV,
  DEFAULT_PROFILE_SECTION,
  DEFAULT_TOP_SECTION,
  type AdvisorProfileSection,
  type AdvisorTopSection,
} from "@/lib/advisor-nav";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { getPublicProfileSharePath } from "@/lib/public-profile-url";
import { cn } from "@/lib/utils";

export type AdvisorDashboardProps = {
  /** Embedded inside YVITY My Space — skip standalone login gate. */
  embedMode?: boolean;
  /** Profile under admin review — lock service editing. */
  reviewMode?: boolean;
};

export function AdvisorDashboard({
  embedMode = false,
  reviewMode = false,
}: AdvisorDashboardProps = {}) {
  const router = useRouter();
  const { ready, isAuthed, logout } = useAuth();
  const { openRequestTestimonial } = useTestimonialSubmit();
  const [data, setData] = useCareerData();
  const [topSection, setTopSection] = useState<AdvisorTopSection>(DEFAULT_TOP_SECTION);
  const [profileSection, setProfileSection] =
    useState<AdvisorProfileSection>(DEFAULT_PROFILE_SECTION);
  // Mobile-only bottom-sheet picker for Profile Management. On desktop the
  // sidebar's expandable submenu replaces this entirely.
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  // Public Profile preview viewport. Defaults to "mobile" since the current
  // narrow-iframe layout reads as a phone preview; "desktop" mode hides the
  // workspace header so the iframe fills the entire content area.
  const [publicViewMode, setPublicViewMode] = useState<PublicProfileViewMode>("mobile");
  const display = useAdvisorDisplayProfile();

  useEffect(() => {
    if (!embedMode && ready && !isAuthed) router.replace("/login");
  }, [embedMode, ready, isAuthed, router]);

  const handleLogout = () => {
    if (embedMode) {
      void fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        window.location.href = "/";
      });
      return;
    }
    void logout().then(() => router.push("/"));
  };

  const navigateProfile = (section: AdvisorProfileSection) => {
    setTopSection("profile");
    setProfileSection(section);
  };

  // Mobile bottom-nav handler. Tapping "Profile" always opens the drawer so
  // users can pick (or switch between) the six sub-sections. Other tabs go
  // straight to the selected top section, matching the desktop sidebar.
  const handleMobileTopChange = (section: AdvisorTopSection) => {
    if (section === "profile") {
      setProfileSheetOpen(true);
      // Make sure Profile is the active top section so the sub-section
      // body is what the user sees once the sheet closes.
      setTopSection("profile");
      return;
    }
    setTopSection(section);
  };

  if (!embedMode && (!ready || !isAuthed)) {
    return (
      <main className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Checking session…
      </main>
    );
  }

  const activeTop = ADVISOR_TOP_NAV.find((s) => s.id === topSection)!;
  const activeProfileItem = ADVISOR_PROFILE_NAV.find((s) => s.id === profileSection)!;

  // Breadcrumb for the sticky workspace header. Profile Management's
  // active sub-section appears as a second segment.
  const breadcrumb: string[] =
    topSection === "profile" ? ["Profile Management", activeProfileItem.label] : [activeTop.label];

  // When the advisor switches the Public Profile preview to "Desktop view"
  // the iframe needs the full content area, so the dashboard temporarily
  // hides its workspace header and widens its container.
  const isPublicDesktop = topSection === "public-profile" && publicViewMode === "desktop";

  /**
   * Render the body for a given (top, profile) tuple. Used by both
   * desktop and mobile — only ONE section's body is rendered at a time
   * (no more vertically stacked accordion).
   */
  const renderSectionBody = (): ReactNode => {
    if (topSection === "dashboard") {
      if (reviewMode) {
        return (
          <AdvisorReviewDashboard
            onNavigateTop={setTopSection}
            onNavigateProfile={navigateProfile}
            onOpenRequestTestimonial={openRequestTestimonial}
          />
        );
      }
      return (
        <AdvisorDashboardOverview
          onNavigateTop={setTopSection}
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
        />
      );
    }
    if (topSection === "profile") {
      switch (profileSection) {
        case "profile":
          return <AdvisorCareerProfile data={data} setData={setData} />;
        case "services":
          return reviewMode ? (
            <div className="rounded-2xl border border-dashed border-amber-400/40 bg-amber-400/5 p-6 text-center">
              <p className="text-sm font-semibold text-foreground">Services locked during review</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your submitted services cannot be edited until admin approves your profile.
              </p>
            </div>
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
          return <AdvisorScoreModule onNavigateProfileSection={navigateProfile} />;
      }
    }
    if (topSection === "leads") return <AdvisorLeadsModule />;
    if (topSection === "insights") {
      return (
        <AdvisorInsightsModule onNavigateTop={setTopSection} onNavigateProfile={navigateProfile} />
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
    // `overflow-x-clip` contains decorative blur circles inside <main> that
    // would otherwise overflow horizontally on narrow phones and make the
    // document wider than the viewport — which in turn made the fixed
    // bottom-nav appear off-screen and the page scroll horizontally.
    // `clip` (vs `hidden`) preserves the sticky header below.
    <div
      className={cn(
        "flex flex-col overflow-x-clip",
        embedMode ? "min-h-[min(100dvh,720px)]" : "min-h-screen",
      )}
    >
      {/* Mobile header — hidden when embedded (YVITY dashboard shell provides top nav). */}
      {!embedMode ? (
      <header className="md:hidden sticky top-0 z-40 border-b yvity-workspace-chrome">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/advisor" className="flex items-center gap-2.5 shrink-0">
            <YvityLogo size={36} wordmarkClassName="text-sm tracking-[0.16em]" />
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href={getPublicProfileSharePath()} target="_blank" rel="noopener noreferrer">
                <Eye className="size-4" /> Preview profile
              </Link>
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="size-4" /> Logout
            </Button>
          </div>
        </div>
      </header>
      ) : null}

      {/* ─── Desktop sidebar ───
          Fixed, full-height. Renders nothing below `md`. */}
      <AdvisorSidebar
        topSection={topSection}
        profileSection={profileSection}
        onTopChange={setTopSection}
        onProfileChange={navigateProfile}
        onLogout={handleLogout}
        embedMode={embedMode}
      />

      {/* ─── Main content area ───
          Padded to clear the fixed sidebar on `md+` and the floating bottom
          nav on `< md`. Only the ACTIVE section's body is rendered. */}
      <main
        className={cn(
          "flex-1 relative",
          embedMode
            ? "pb-[calc(env(safe-area-inset-bottom)+5.25rem)] md:pb-6"
            : "pb-10 max-md:pb-[calc(env(safe-area-inset-bottom)+5.25rem)]",
          SIDEBAR_CONTENT_OFFSET,
        )}
      >
        {/* Decorative blur halos. `overflow-hidden` keeps the oversized
            circles from leaking horizontally on narrow phones. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] -z-10 opacity-70 overflow-hidden">
          <div className="absolute -top-32 left-1/4 size-[480px] rounded-full bg-primary/30 blur-[120px]" />
          <div className="absolute -top-32 right-1/4 size-[420px] rounded-full bg-accent/20 blur-[120px]" />
        </div>

        {/* Sticky personalised workspace header — visible across every
            section EXCEPT public-profile in desktop view, where the iframe
            should fill the entire content area like a real visitor's
            browser. */}
        {!isPublicDesktop && (
          <AdvisorWorkspaceHeader advisorName={display.name} breadcrumb={breadcrumb} />
        )}

        <div
          className={cn(
            // Default workspace container — comfortable reading width.
            !isPublicDesktop && "mx-auto max-w-5xl px-4 md:px-8 py-6 md:py-8",
            // Public-profile desktop view — much wider container, tight
            // padding so the iframe spans the entire visible area.
            isPublicDesktop && "mx-auto max-w-[1600px] px-3 md:px-4 py-3 md:py-4",
          )}
        >
          {/* Active section body. Keyed by the active (top, profile) tuple so
              React fully unmounts the previous module — that prevents lazy
              media (gallery, services modal) from holding stale state when
              jumping between sub-sections. */}
          <div
            key={`body-${topSection}-${profileSection}`}
            className="animate-in fade-in duration-300"
          >
            {renderSectionBody()}
          </div>
        </div>
      </main>

      {/* ─── Mobile bottom nav ───
          Hidden on `md+`. Profile tab opens the bottom-sheet picker. */}
      <AdvisorMobileBottomNav
        topSection={topSection}
        onChange={handleMobileTopChange}
        onLogout={handleLogout}
      />

      {/* ─── Mobile Profile picker ───
          Hidden on `md+`. */}
      <ProfileManagementSheet
        open={profileSheetOpen}
        activeSection={profileSection}
        onClose={() => setProfileSheetOpen(false)}
        onSelect={(section) => {
          setProfileSheetOpen(false);
          navigateProfile(section);
          window.scrollTo({ top: 0, behavior: "auto" });
        }}
      />
    </div>
  );
}

"use client";

import { PublicProfileSectionRedirect } from "@/components/public-profile-section-redirect";
import { PublicSectionUnavailable } from "@/components/advisor/settings/public-section-unavailable";
import { AchievementsShowcase } from "@/components/sections/achievements-showcase";
import { SectionAdvisorCta } from "@/components/sections/section-advisor-cta";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";

export default function AchievementsPage() {
  const homeHref = usePublicProfileNavHome();
  const { settings, loading } = useAdvisorSettings();

  // Redirect visitors to slug-prefixed URL
  if (homeHref && homeHref !== "/profile") {
    return <PublicProfileSectionRedirect section="achievements" />;
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!settings.visibility.achievements) {
    return (
      <main className="min-h-[calc(100vh-4rem)] pb-28 md:pb-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
          <PublicSectionUnavailable title="Achievements hidden" />
          <SectionAdvisorCta className="mt-8 sm:mt-10" />
        </div>
      </main>
    );
  }

  return <AchievementsShowcase />;
}

"use client";

import { PublicSectionUnavailable } from "@/components/advisor/settings/public-section-unavailable";
import { AchievementsShowcase } from "@/components/sections/achievements-showcase";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";

export default function AchievementsPage() {
  const { settings, loading } = useAdvisorSettings();

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
        </div>
      </main>
    );
  }

  return <AchievementsShowcase />;
}

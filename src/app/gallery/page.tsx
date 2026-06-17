"use client";

import { ImageIcon } from "lucide-react";
import { PublicSectionUnavailable } from "@/components/advisor/settings/public-section-unavailable";
import { GalleryShowcase } from "@/components/gallery/gallery-showcase";
import { SectionAdvisorCta } from "@/components/sections/section-advisor-cta";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useGalleryData } from "@/lib/gallery-store";

export default function GalleryPage() {
  const { settings, loading: settingsLoading } = useAdvisorSettings();
  const [items, , galleryLoading] = useGalleryData();

  if (settingsLoading || galleryLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </main>
    );
  }

  if (!settings.visibility.gallery) {
    return (
      <main className="min-h-[calc(100vh-4rem)] pb-28 md:pb-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
          <PublicSectionUnavailable title="Gallery hidden" />
          <SectionAdvisorCta className="mt-8 sm:mt-10" />
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100vh-4rem)] pb-28 md:pb-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16">
          <EmptyState
            icon={ImageIcon}
            title="No photos yet"
            description="This advisor hasn't added any gallery photos yet. Check back later."
          />
          <SectionAdvisorCta className="mt-8 sm:mt-10" />
        </div>
      </main>
    );
  }

  return <GalleryShowcase />;
}

"use client";

import { AdvisorDashboardOverview } from "@/components/advisor/dashboard/advisor-dashboard-overview";
import type { AdvisorProfileSection, AdvisorTopSection } from "@/lib/advisor-nav";

/**
 * Dashboard tab while services are under review: overview only (no section
 * guidance here — that lives on each My Space section).
 */
export function AdvisorReviewDashboard({
  onNavigateTop,
  onNavigateProfile,
  onOpenRequestTestimonial,
}: {
  onNavigateTop: (section: AdvisorTopSection) => void;
  onNavigateProfile: (section: AdvisorProfileSection) => void;
  onOpenRequestTestimonial: () => void;
}) {
  return (
    <AdvisorDashboardOverview
      underReview
      onNavigateTop={onNavigateTop}
      onNavigateProfile={onNavigateProfile}
      onOpenRequestTestimonial={onOpenRequestTestimonial}
    />
  );
}

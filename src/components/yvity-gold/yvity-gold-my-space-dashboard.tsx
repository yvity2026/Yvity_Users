"use client";

import { AdvisorMySpaceWorkspace } from "@/components/advisor/advisor-my-space-workspace";
import { AdvisorDashboard } from "@/components/advisor-dashboard";

type YvityGoldMySpaceDashboardProps = {
  reviewMode?: boolean;
};

/**
 * My Space embed: hub + drill-in on mobile; full sidebar workspace on desktop (lg+).
 */
export default function YvityGoldMySpaceDashboard({
  reviewMode = false,
}: YvityGoldMySpaceDashboardProps) {
  return (
    <div className="yvity-gold-embed relative isolate w-full overflow-x-clip bg-background text-foreground">
      {/* Mobile / tablet — section cards, then full-page section with Back */}
      <div className="lg:hidden">
        <AdvisorMySpaceWorkspace reviewMode={reviewMode} />
      </div>

      {/* Desktop — sidebar navigation (same as /advisor workspace) */}
      <div className="hidden lg:block">
        <AdvisorDashboard embedMode reviewMode={reviewMode} />
      </div>
    </div>
  );
}

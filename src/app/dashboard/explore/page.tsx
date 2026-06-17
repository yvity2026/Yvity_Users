export const dynamic = "force-dynamic";
export const revalidate = 0;

import DashboardExploreView from "@/components/dashboard/DashboardExploreView";
import IdentityDashboardShell from "@/components/identity/IdentityDashboardShell";
import { getPublicAdvisors } from "@/lib/advisors";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Find Advisors | YVITY",
  description: "Search verified insurance advisors on YVITY",
};

function ExploreFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center font-poppins text-sm text-[#6B7280]">
      Loading advisors...
    </div>
  );
}

export default async function DashboardExplorePage() {
  let advisors: PublicAdvisorCard[] = [];

  try {
    advisors = await getPublicAdvisors();
  } catch (error) {
    console.error("Dashboard explore fetch failed:", error);
  }

  return (
    <IdentityDashboardShell>
      <Suspense fallback={<ExploreFallback />}>
        <DashboardExploreView advisors={advisors} />
      </Suspense>
    </IdentityDashboardShell>
  );
}

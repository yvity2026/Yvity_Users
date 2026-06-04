import AdvisorSearchFilter from "@/components/features/user/landing/HeroSection";
import IdentityDashboardShell from "@/components/identity/IdentityDashboardShell";
import { getPublicAdvisors } from "@/lib/advisors";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Explore | YVITY Dashboard",
  description: "Find verified advisors on YVITY",
};

function ExploreFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center font-poppins text-sm text-[#6B7280]">
      Loading explore...
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
        <AdvisorSearchFilter advisors={advisors} mode="explore" />
      </Suspense>
    </IdentityDashboardShell>
  );
}

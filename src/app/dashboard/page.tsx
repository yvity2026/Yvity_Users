import { Suspense } from "react";
import DashboardHome from "@/components/dashboard/DashboardHome";
import IdentityDashboardShell from "@/components/identity/IdentityDashboardShell";
import { getPublicAdvisors } from "@/lib/advisors";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | YVITY Dashboard",
  description: "Discover trusted professionals on YVITY",
};

export default async function DashboardPage() {
  let advisors: PublicAdvisorCard[] = [];

  try {
    advisors = await getPublicAdvisors();
  } catch (error) {
    console.error("Dashboard home advisor fetch failed:", error);
  }

  return (
    <IdentityDashboardShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1200px] animate-pulse px-3 py-8">
            <div className="h-48 rounded-[28px] bg-[#E4E2DB]" />
          </div>
        }
      >
        <DashboardHome advisors={advisors} />
      </Suspense>
    </IdentityDashboardShell>
  );
}

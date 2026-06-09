"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdvisorCardWithSave from "@/components/advisor/AdvisorCardWithSave";
import {
  DashboardPageEmpty,
  DashboardPageLoading,
} from "@/components/dashboard/dashboard-page-states";
import { useFetchSavedProfiles } from "@/hooks/useSavedProfiles";
import { Bookmark } from "lucide-react";

export default function DashboardSavedProfiles() {
  const { profiles, isLoading, error, fetchProfiles } = useFetchSavedProfiles();

  useEffect(() => {
    void fetchProfiles(1, 12);
  }, [fetchProfiles]);

  const isEmpty = !isLoading && !error && profiles.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8">
      <Link
        href="/dashboard/activity"
        className="mb-4 inline-flex items-center gap-1.5 font-poppins text-xs font-medium text-[#6B7280] hover:text-[#0A4A4A]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to activity
      </Link>

      <div className="mb-6">
        <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
          Saved <span className="text-[#F59E0B] italic">profiles</span>
        </h1>
        <p className="mt-2 font-poppins text-sm text-[#6B7280] sm:text-base">
          Advisors you bookmarked from search and explore.
        </p>
      </div>

      <div className="rounded-[2rem] border border-[#E4E2DB] bg-white p-6 shadow-sm min-h-[280px]">
        {isLoading ? (
          <DashboardPageLoading className="px-0 py-0" label="Loading saved profiles" />
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center font-poppins text-sm text-[#DC2626]">
            <p className="font-medium">Unable to load saved profiles.</p>
            <p className="mt-2 text-[#6B7280]">{error}</p>
          </div>
        ) : isEmpty ? (
          <DashboardPageEmpty
            icon={Bookmark}
            title="No saved profiles yet"
            description="Browse advisors on Home or Explore and save profiles to see them here."
            action={
              <Link
                href="/dashboard/explore"
                className="inline-flex rounded-xl bg-[#0A4A4A] px-5 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B]"
              >
                Explore advisors
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {profiles.map((advisor) => (
              <div key={advisor.id} className="mx-auto w-full max-w-[520px]">
                <AdvisorCardWithSave advisor={advisor} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdvisorCardWithSave from "@/components/advisor/AdvisorCardWithSave";
import { useFetchSavedProfiles } from "@/hooks/useSavedProfiles";

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
          <div className="flex min-h-[220px] items-center justify-center font-poppins text-sm text-[#6B7280]">
            Loading saved profiles...
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center font-poppins text-sm text-[#DC2626]">
            <p className="font-medium">Unable to load saved profiles.</p>
            <p className="mt-2 text-[#6B7280]">{error}</p>
          </div>
        ) : isEmpty ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <h2 className="font-poppins text-lg font-medium text-[#374151]">
              No saved profiles yet
            </h2>
            <p className="mt-2 max-w-sm font-poppins text-sm text-[#6B7280]">
              Browse advisors on Home or Explore and save profiles to see them here.
            </p>
            <Link
              href="/dashboard/explore"
              className="mt-5 rounded-xl bg-[#0A4A4A] px-5 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B]"
            >
              Explore advisors
            </Link>
          </div>
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

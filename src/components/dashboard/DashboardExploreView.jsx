"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdvisorCardWithSave from "@/components/advisor/AdvisorCardWithSave";
import DashboardHomeDiscovery, {
  FALLBACK_SERVICE_CHIPS,
} from "@/components/dashboard/DashboardHomeDiscovery";
import { filterHomeAdvisors } from "@/lib/dashboard/homeAdvisors";
import { useAuth } from "@/context/AuthUserContext";

/**
 * @param {{ advisors?: import("@/lib/advisors/mock-public-advisors").PublicAdvisorCard[] }} props
 */
export default function DashboardExploreView({ advisors = [] }) {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("name") || "");
  const [searchCity, setSearchCity] = useState(
    searchParams.get("city") || "",
  );
  const [searchService, setSearchService] = useState(
    searchParams.get("service") || "",
  );
  const [searchCompany, setSearchCompany] = useState(
    searchParams.get("company") || "",
  );
  const [activeQuickFilter, setActiveQuickFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef(null);

  const serviceOptions = useMemo(
    () =>
      [
        ...new Set(
          advisors.flatMap((a) => a.serviceTypes ?? []).filter(Boolean),
        ),
      ].sort(),
    [advisors],
  );

  const serviceChips = useMemo(
    () => (serviceOptions.length > 0 ? serviceOptions : FALLBACK_SERVICE_CHIPS),
    [serviceOptions],
  );

  const allServiceOptions = useMemo(
    () => [...new Set([...serviceOptions, ...FALLBACK_SERVICE_CHIPS])].sort(),
    [serviceOptions],
  );

  const effectiveCity = searchCity || user?.city || "";

  const currentFilters = useMemo(
    () => ({
      query: searchQuery,
      city: effectiveCity,
      service: searchService || activeQuickFilter,
      company: searchCompany,
    }),
    [searchQuery, effectiveCity, searchService, activeQuickFilter, searchCompany],
  );

  const results = useMemo(
    () => filterHomeAdvisors(advisors, currentFilters),
    [advisors, currentFilters],
  );

  const handleSubmitSearch = useCallback(() => {
    setHasSearched(true);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSearchCity("");
    setSearchService("");
    setSearchCompany("");
    setActiveQuickFilter("");
    setHasSearched(false);
  }, []);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(searchCity.trim()) ||
    Boolean(searchService) ||
    Boolean(searchCompany.trim()) ||
    Boolean(activeQuickFilter);

  const displayedAdvisors = hasActiveFilters ? results : advisors;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8">
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
          Find{" "}
          <span className="text-[#F59E0B] italic">Advisors</span>
        </h1>
        <p className="mt-1 font-poppins text-sm text-[#6B7280]">
          Search verified insurance advisors across India.
        </p>
      </div>

      <div className="mb-8 rounded-[2rem] border border-[#E4E2DB] bg-white p-5 shadow-sm sm:p-6">
        <DashboardHomeDiscovery
          searchInputRef={searchInputRef}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchCity={searchCity}
          onSearchCityChange={setSearchCity}
          searchService={searchService}
          onSearchServiceChange={setSearchService}
          searchCompany={searchCompany}
          onSearchCompanyChange={setSearchCompany}
          activeQuickFilter={activeQuickFilter}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          serviceChips={serviceChips}
          allServiceOptions={allServiceOptions}
          onSubmitSearch={handleSubmitSearch}
          onApplyFilters={handleSubmitSearch}
          onClearFilters={handleClearFilters}
          onQuickFilter={(filter) => {
            const next = activeQuickFilter === filter ? "" : filter;
            setActiveQuickFilter(next);
            setSearchService(next);
            setHasSearched(true);
          }}
          hasSearched={false}
        />
      </div>

      {displayedAdvisors.length > 0 ? (
        <>
          <p className="mb-4 font-poppins text-xs font-medium text-[#6B7280]">
            {hasActiveFilters
              ? `${displayedAdvisors.length} advisor${displayedAdvisors.length === 1 ? "" : "s"} matched`
              : `${displayedAdvisors.length} advisor${displayedAdvisors.length === 1 ? "" : "s"} on YVITY`}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {displayedAdvisors.map((advisor) => (
              <div key={advisor.id} className="mx-auto w-full max-w-[380px]">
                <AdvisorCardWithSave advisor={advisor} variant="compact" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#E4E2DB] bg-gradient-to-br from-white via-[#F8F6F1] to-[#E8F4F4]/60 px-6 py-16 text-center">
          <p className="font-poppins text-sm text-[#6B7280]">
            {hasActiveFilters
              ? "No advisors matched your search. Try adjusting your filters."
              : "No advisors are listed yet. Check back soon."}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-4 inline-flex rounded-full bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-6 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.22)] transition active:scale-[0.98]"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

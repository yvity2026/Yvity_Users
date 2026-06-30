"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK_SERVICE_CHIPS = [
  "Life Insurance",
  "Health Insurance",
  "Term Insurance",
  "Investment Planning",
  "Retirement Planning",
];

const fieldClass =
  "w-full rounded-xl border border-[#E4E2DB] bg-[#F8F6F1]/90 px-3 py-2.5 text-sm font-medium text-[#0A4A4A] outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-[#9CA3AF] focus:border-[#0A4A4A] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.18)]";

function FilterField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function DashboardHomeDiscovery({
  searchInputRef,
  searchQuery,
  onSearchQueryChange,
  searchCity,
  searchCityPlaceholder = "e.g. Hyderabad",
  onSearchCityChange,
  searchService,
  onSearchServiceChange,
  searchCompany,
  onSearchCompanyChange,
  activeQuickFilter,
  showFilters,
  onToggleFilters,
  serviceChips = [],
  allServiceOptions = [],
  onSubmitSearch,
  onApplyFilters,
  onClearFilters,
  onQuickFilter,
  hasSearched = false,
}) {
  const chips =
    serviceChips.length > 0 ? serviceChips : FALLBACK_SERVICE_CHIPS;

  const handleClear = () => {
    onClearFilters();
  };

  return (
    <section
      id="home-discovery"
      className="home-discovery-section mb-10 scroll-mt-24"
      aria-label="Search and filter professionals"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitSearch();
        }}
        className="space-y-5"
      >
        <div className="flex items-stretch gap-2.5 sm:gap-3">
          <div
            className={cn(
              "flex min-h-[48px] min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-[#E4E2DB]",
              "bg-white px-3.5 shadow-[0_2px_14px_rgba(10,74,74,0.07)]",
              "transition-[border-color,box-shadow] duration-200",
              "focus-within:border-[#0A4A4A]/35 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.16)]",
              "sm:gap-3 sm:px-4",
            )}
          >
            <Search
              size={20}
              strokeWidth={2}
              className="shrink-0 text-[#0A4A4A]/70"
              aria-hidden
            />
            <input
              ref={searchInputRef}
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search professionals, services or city"
              className="min-w-0 flex-1 bg-transparent font-poppins text-sm text-[#0A4A4A] outline-none placeholder:text-[#9CA3AF] sm:text-[15px]"
              aria-label="Search professionals, services or city"
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-4 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.25)] transition active:scale-[0.98] sm:rounded-full sm:px-5"
          >
            Search
          </button>

          <button
            type="button"
            onClick={onToggleFilters}
            aria-label="Open advanced filters"
            aria-expanded={showFilters}
            className={cn(
              "inline-flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-2xl border border-[#E4E2DB] bg-white",
              "text-[#0A4A4A] shadow-[0_2px_10px_rgba(10,74,74,0.06)] transition",
              "hover:border-[#0A4A4A]/20 active:scale-[0.98]",
              showFilters && "border-[#0A4A4A]/30 bg-[#F8F6F1] ring-2 ring-[#F59E0B]/20",
            )}
          >
            <SlidersHorizontal size={20} strokeWidth={2} aria-hidden />
          </button>
        </div>

        {hasSearched ? (
          <p className="font-poppins text-[11px] text-[#9CA3AF]">
            Showing up to 5 matches — use Explore for the full directory.
          </p>
        ) : null}

        {showFilters ? (
          <div className="home-discovery-advanced rounded-[24px] border border-[#E4E2DB]/90 bg-white/90 p-4 shadow-[0_8px_32px_rgba(10,74,74,0.08)] backdrop-blur-md sm:p-5">
            <p className="mb-4 font-poppins text-xs font-semibold uppercase tracking-[0.14em] text-[#0A4A4A]/60">
              Advanced filters
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FilterField label="City / Location">
                <input
                  type="text"
                  value={searchCity}
                  onChange={(event) => onSearchCityChange(event.target.value)}
                  placeholder={searchCityPlaceholder}
                  className={fieldClass}
                />
              </FilterField>
              <FilterField label="Service">
                <select
                  value={searchService}
                  onChange={(event) => onSearchServiceChange(event.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="">All services</option>
                  {allServiceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="Company">
                <input
                  type="text"
                  value={searchCompany}
                  onChange={(event) => onSearchCompanyChange(event.target.value)}
                  placeholder="e.g. LIC"
                  className={fieldClass}
                />
              </FilterField>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onApplyFilters}
                className="rounded-full bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-6 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.25)] transition active:scale-[0.98]"
              >
                Apply filters
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full border border-[#E4E2DB] bg-white/80 px-6 py-2.5 font-poppins text-sm font-semibold text-[#6B7280] transition hover:border-[#0A4A4A]/20 active:scale-[0.98]"
              >
                Clear
              </button>
            </div>
          </div>
        ) : null}
      </form>

      <div className="mt-5">
        <p className="mb-3 font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
          Popular services
        </p>
        <div className="no-scrollbar -mx-3 flex flex-wrap gap-2 overflow-x-auto px-3 pb-0.5 sm:-mx-0 sm:gap-2.5 sm:px-0">
          {chips.map((service) => {
            const active = activeQuickFilter === service;

            return (
              <button
                key={service}
                type="button"
                onClick={() => onQuickFilter(service)}
                className={cn(
                  "touch-manipulation shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2",
                  "font-poppins text-xs font-medium transition active:scale-[0.98] sm:text-[13px] sm:px-4 sm:py-2.5",
                  active
                    ? "border-[#0A4A4A] bg-[#0A4A4A] text-[#F59E0B] shadow-[0_4px_14px_rgba(10,74,74,0.22)]"
                    : "border-[#E4E2DB] bg-white text-[#0A4A4A] shadow-[0_1px_6px_rgba(10,74,74,0.05)] hover:border-[#0A4A4A]/25 hover:bg-[#F8F6F1]",
                )}
                aria-pressed={active}
              >
                {service}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { FALLBACK_SERVICE_CHIPS };

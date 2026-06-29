"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { AdvisorProfileCard } from "../home-features/advisor-profile-card";
import { AdvisorProfileCardV2 } from "../home-features/advisor-profile-card-v2";
import { AdvisorProfileGateModal } from "../home-features/advisor-profile-gate-modal";
import { toAdvisorCardGoldProps } from "@/yvity-landing/lib/advisor/cardGoldProps";
import LandingSectionHeader from "./LandingSectionHeader";
import LandingSnapScroll, { LandingSnapItem } from "./LandingSnapScroll";
import { LANDING_INNER, LANDING_SECTION_ANCHOR, LANDING_SECTION_PY } from "./landingLayout";
import { filterAdvisors } from "@/lib/advisors/publicAdvisorFilters";
import { cn } from "@/lib/utils";

const QUICK_SERVICES = [
  "Life Insurance",
  "Health Insurance",
  "General Insurance",
  "Mutual Funds",
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

export default function FindAdvisorsClient({
  featuredAdvisors = [],
  allAdvisors = [],
  featuredIdList = [],
  isLoggedIn = false,
}) {
  const featuredIds = useMemo(() => new Set(featuredIdList), [featuredIdList]);

  // Main search bar
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const searchRef = useRef(null);

  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterService, setFilterService] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [activeQuick, setActiveQuick] = useState("");

  // Gate modal
  const [gateModal, setGateModal] = useState({ open: false, profileUrl: "" });

  // Derived: are any search/filter criteria active?
  const hasFilters =
    Boolean(committedQuery.trim()) ||
    Boolean(filterCity.trim()) ||
    Boolean(filterService) ||
    Boolean(filterCompany.trim()) ||
    Boolean(activeQuick);

  const serviceOptions = useMemo(
    () => [...new Set(allAdvisors.flatMap((a) => a.serviceTypes ?? []).filter(Boolean))].sort(),
    [allAdvisors],
  );

  const searchResults = useMemo(() => {
    if (!hasFilters) return null;
    return filterAdvisors(allAdvisors, {
      query: committedQuery,
      city: filterCity,
      service: filterService || activeQuick,
      company: filterCompany,
    });
  }, [hasFilters, allAdvisors, committedQuery, filterCity, filterService, filterCompany, activeQuick]);

  const displayedAdvisors = hasFilters
    ? (searchResults ?? []).slice(0, 15)
    : featuredAdvisors.slice(0, 6);

  const handleSearch = () => {
    setCommittedQuery(query.trim());
  };

  const handleQuickService = (service) => {
    const next = activeQuick === service ? "" : service;
    setActiveQuick(next);
    setFilterService("");
  };

  const clearAll = () => {
    setQuery("");
    setCommittedQuery("");
    setFilterCity("");
    setFilterService("");
    setFilterCompany("");
    setActiveQuick("");
    setShowFilters(false);
    searchRef.current?.focus();
  };

  const openGate = (profileUrl) => setGateModal({ open: true, profileUrl });
  const closeGate = () => setGateModal({ open: false, profileUrl: "" });

  return (
    <section
      id="find-advisors"
      className={`w-full overflow-x-hidden bg-[#F8F6F1] ${LANDING_SECTION_PY} ${LANDING_SECTION_ANCHOR}`}
    >
      <div className={LANDING_INNER}>
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 lg:mb-8"
        >
          <LandingSectionHeader
            eyebrow="Find Advisors"
            accent="Discover"
            title={
              <>
                Verified Advisors
                <br className="lg:hidden" /> Near You
              </>
            }
            description="Search from YVITY verified insurance advisors across India."
          />
        </motion.div>

        {/* Search panel */}
        <div className="mb-5 font-poppins lg:mb-6">
          {/* Main search bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="mb-4"
          >
            <div className="flex items-stretch gap-2.5 sm:gap-3">
              <div
                className={cn(
                  "flex min-h-[52px] min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-[#E4E2DB]",
                  "bg-white px-3.5 shadow-[0_2px_14px_rgba(10,74,74,0.07)]",
                  "transition-[border-color,box-shadow] duration-200",
                  "focus-within:border-[#0A4A4A]/35 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.16)]",
                  "sm:gap-3 sm:px-4",
                )}
              >
                <Search size={20} strokeWidth={2} className="shrink-0 text-[#0A4A4A]/70" aria-hidden />
                <input
                  ref={searchRef}
                  type="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (!e.target.value.trim()) setCommittedQuery("");
                  }}
                  placeholder="Search by name, city or service…"
                  className="min-w-0 flex-1 bg-transparent font-poppins text-sm text-[#0A4A4A] outline-none placeholder:text-[#9CA3AF] sm:text-[15px]"
                  aria-label="Search advisors by name, city or service"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setCommittedQuery(""); }}
                    className="shrink-0 text-[#9CA3AF] hover:text-[#0A4A4A] transition"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>

              <button
                type="submit"
                className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-5 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.25)] transition active:scale-[0.98]"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-label="Advanced filters"
                aria-expanded={showFilters}
                className={cn(
                  "inline-flex min-h-[52px] min-w-[52px] shrink-0 items-center justify-center rounded-2xl border border-[#E4E2DB] bg-white",
                  "text-[#0A4A4A] shadow-[0_2px_10px_rgba(10,74,74,0.06)] transition",
                  "hover:border-[#0A4A4A]/20 active:scale-[0.98]",
                  showFilters && "border-[#0A4A4A]/30 bg-[#F8F6F1] ring-2 ring-[#F59E0B]/20",
                )}
              >
                <SlidersHorizontal size={20} strokeWidth={2} aria-hidden />
              </button>
            </div>

            {/* Advanced filters panel */}
            {showFilters ? (
              <div className="mt-3 rounded-[20px] border border-[#E4E2DB]/90 bg-white/90 p-4 shadow-[0_8px_32px_rgba(10,74,74,0.08)] backdrop-blur-md sm:p-5">
                <p className="mb-3.5 font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0A4A4A]/60">
                  Advanced filters
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FilterField label="City / Location">
                    <input
                      type="text"
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      placeholder="e.g. Hyderabad"
                      className={fieldClass}
                    />
                  </FilterField>
                  <FilterField label="Service">
                    <select
                      value={filterService}
                      onChange={(e) => { setFilterService(e.target.value); setActiveQuick(""); }}
                      className={`${fieldClass} cursor-pointer`}
                    >
                      <option value="">All services</option>
                      {serviceOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </FilterField>
                  <FilterField label="Company">
                    <input
                      type="text"
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value)}
                      placeholder="e.g. LIC"
                      className={fieldClass}
                    />
                  </FilterField>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="rounded-full bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-6 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.25)] transition active:scale-[0.98]"
                  >
                    Apply filters
                  </button>
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="rounded-full border border-[#E4E2DB] bg-white/80 px-6 py-2.5 font-poppins text-sm font-semibold text-[#6B7280] transition hover:border-[#0A4A4A]/20 active:scale-[0.98]"
                    >
                      Clear all
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </form>

          {/* Quick service chips */}
          <div>
            <p className="mb-2.5 font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
              Popular services
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SERVICES.map((service) => {
                const active = activeQuick === service;
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleQuickService(service)}
                    aria-pressed={active}
                    className={cn(
                      "touch-manipulation shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5",
                      "font-poppins text-xs font-medium transition active:scale-[0.98] sm:text-[13px] sm:px-4 sm:py-2",
                      active
                        ? "border-[#0A4A4A] bg-[#0A4A4A] text-[#F59E0B] shadow-[0_4px_14px_rgba(10,74,74,0.22)]"
                        : "border-[#E4E2DB] bg-white text-[#0A4A4A] shadow-[0_1px_6px_rgba(10,74,74,0.05)] hover:border-[#0A4A4A]/25 hover:bg-[#F8F6F1]",
                    )}
                  >
                    {service}
                  </button>
                );
              })}
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="shrink-0 whitespace-nowrap rounded-full border border-[#F59E0B]/40 bg-[#FEF3C7] px-3.5 py-1.5 font-poppins text-xs font-semibold text-[#92400E] transition active:scale-[0.98] sm:px-4 sm:py-2 sm:text-[13px]"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          </div>

          {/* Results count */}
          {hasFilters && searchResults !== null ? (
            <p className="mt-3 font-poppins text-[11px] text-[#6B7280]">
              {searchResults.length === 0
                ? "No advisors matched your search."
                : `${searchResults.length} advisor${searchResults.length !== 1 ? "s" : ""} found`}
            </p>
          ) : null}
        </div>

        {/* Advisor cards */}
        <div className="mb-12 w-full lg:mb-12">
          {/* Mobile horizontal scroll — new design card always first */}
          <LandingSnapScroll ariaLabel="Advisor profiles" className="py-2 lg:hidden">
            <LandingSnapItem className="w-[82vw] max-w-[380px] overflow-visible sm:w-[340px]">
              <div className="w-full overflow-visible py-1">
                <AdvisorProfileCardV2 />
              </div>
            </LandingSnapItem>
            {displayedAdvisors.map((advisor, index) => {
              const cardProps = toAdvisorCardGoldProps(advisor);
              const isFeatured = featuredIds.has(advisor.id) || cardProps.isFeatured;
              return (
                <LandingSnapItem
                  key={`advisor-${advisor.id ?? index}`}
                  className="w-[82vw] max-w-[380px] overflow-visible sm:w-[340px]"
                >
                  <div className="landing-hero-card-glow w-full overflow-visible py-1">
                    <AdvisorProfileCard
                      {...cardProps}
                      isFeatured={isFeatured}
                      isLoggedIn={isLoggedIn}
                      onGatedClick={() => openGate(cardProps.profileUrl)}
                    />
                  </div>
                </LandingSnapItem>
              );
            })}
          </LandingSnapScroll>

          <p className="mt-1 text-center font-poppins text-[10px] text-[#6B7280] lg:hidden">
            Swipe for more advisors
          </p>

          {/* Desktop grid — new design card always first */}
          <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3 xl:gap-5">
            <div className="w-full max-w-[460px] overflow-visible py-1 lg:mx-auto">
              <AdvisorProfileCardV2 />
            </div>
            {displayedAdvisors.map((advisor, index) => {
              const cardProps = toAdvisorCardGoldProps(advisor);
              const isFeatured = featuredIds.has(advisor.id) || cardProps.isFeatured;
              return (
                <div
                  key={`advisor-grid-${advisor.id ?? index}`}
                  className="landing-hero-card-glow w-full max-w-[520px] overflow-visible py-1 lg:mx-auto"
                >
                  <AdvisorProfileCard
                    {...cardProps}
                    isFeatured={isFeatured}
                    isLoggedIn={isLoggedIn}
                    onGatedClick={() => openGate(cardProps.profileUrl)}
                  />
                </div>
              );
            })}
          </div>

          {hasFilters && displayedAdvisors.length === 0 ? (
            <p className="mt-3 text-center font-poppins text-sm text-[#6B7280]">
              No advisors matched your search. Try a different city, service, or name.
            </p>
          ) : null}

          {!isLoggedIn && hasFilters ? (
            <p className="mt-4 text-center font-poppins text-[12px] text-[#6B7280]">
              Featured advisor profiles open directly.{" "}
              <span className="text-[#0A4A4A] font-semibold">Login</span>{" "}
              to access all advisor profiles.
            </p>
          ) : null}
        </div>
      </div>

      {/* Profile gate modal */}
      <AdvisorProfileGateModal
        open={gateModal.open}
        profileUrl={gateModal.profileUrl}
        onClose={closeGate}
      />
    </section>
  );
}

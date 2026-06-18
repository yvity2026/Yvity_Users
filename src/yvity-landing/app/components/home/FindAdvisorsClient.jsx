"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AdvisorProfileCard } from "../home-features/advisor-profile-card";
import { AdvisorProfileGateModal } from "../home-features/advisor-profile-gate-modal";
import { toAdvisorCardGoldProps } from "@/yvity-landing/lib/advisor/cardGoldProps";
import LandingSectionHeader from "./LandingSectionHeader";
import LandingSnapScroll, { LandingSnapItem } from "./LandingSnapScroll";
import { LANDING_INNER, LANDING_SECTION_ANCHOR, LANDING_SECTION_PY } from "./landingLayout";
import { filterAdvisors } from "@/lib/advisors/publicAdvisorFilters";

const fieldClass =
  "w-full rounded-lg border border-gray-200/90 bg-[#F8F6F1] px-2.5 py-2 text-[13px] font-medium text-[#0A4A4A] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#0A4A4A] lg:py-2.5 lg:text-[14px]";

function FilterField({ label, className = "", children }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Props:
 *   featuredAdvisors  — 6 admin-selected advisors shown by default
 *   allAdvisors       — full list used for client-side search filtering
 *   featuredIds       — Set<string> of advisor IDs that are featured (no gate)
 *   isLoggedIn        — boolean
 */
export default function FindAdvisorsClient({
  featuredAdvisors = [],
  allAdvisors = [],
  featuredIdList = [],   // array — Set can't cross RSC boundary
  isLoggedIn = false,
}) {
  // Convert array to Set once for O(1) lookups
  const featuredIds = useMemo(() => new Set(featuredIdList), [featuredIdList]);
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [searchName, setSearchName] = useState("");

  // Gate modal state
  const [gateModal, setGateModal] = useState({ open: false, profileUrl: "" });

  const hasFilters =
    Boolean(searchState.trim()) ||
    Boolean(searchCity.trim()) ||
    Boolean(searchService) ||
    Boolean(searchCompany.trim()) ||
    Boolean(searchName.trim());

  // Client-side filter — no API call, no login required
  const searchResults = useMemo(() => {
    if (!hasFilters) return null;
    return filterAdvisors(allAdvisors, {
      state: searchState,
      city: searchCity,
      service: searchService,
      company: searchCompany,
      name: searchName,
    });
  }, [hasFilters, allAdvisors, searchState, searchCity, searchService, searchCompany, searchName]);

  const displayedAdvisors = hasFilters
    ? (searchResults ?? []).slice(0, 15)
    : featuredAdvisors.slice(0, 6);

  const stateOptions = useMemo(
    () => [...new Set(allAdvisors.map((a) => a.state).filter(Boolean))].sort(),
    [allAdvisors],
  );

  const companyOptions = useMemo(
    () => [...new Set(allAdvisors.flatMap((a) => a.companies ?? []).filter(Boolean))].sort(),
    [allAdvisors],
  );

  const serviceOptions = useMemo(
    () => [...new Set(allAdvisors.flatMap((a) => a.serviceTypes ?? []).filter(Boolean))].sort(),
    [allAdvisors],
  );

  const clearAllFilters = () => {
    setSearchState("");
    setSearchCity("");
    setSearchService("");
    setSearchCompany("");
    setSearchName("");
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
            description="Search from 500+ YVITY verified insurance advisors across India."
          />
        </motion.div>

        {/* Search panel */}
        <div className="mb-5 rounded-xl border border-[#D7D7D7]/80 bg-white p-3 font-poppins shadow-[0_2px_12px_rgba(10,74,74,0.06)] lg:mb-6 lg:rounded-2xl lg:p-4">
          <div className="mb-2.5 flex items-center justify-between gap-2 lg:mb-3">
            <p className="text-xs font-semibold text-[#0A4A4A] lg:text-sm">
              Search advisors
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-[#F59E0B] lg:text-xs"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
            <FilterField label="State">
              <input
                type="text"
                list="advisor-state-options"
                placeholder="e.g. Telangana"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                className={fieldClass}
              />
              <datalist id="advisor-state-options">
                {stateOptions.map((s) => <option key={s} value={s} />)}
              </datalist>
            </FilterField>

            <FilterField label="City">
              <input
                type="text"
                placeholder="e.g. Hyderabad"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className={fieldClass}
              />
            </FilterField>

            <FilterField label="Company">
              <input
                type="text"
                list="advisor-company-options"
                placeholder="e.g. LIC"
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                className={fieldClass}
              />
              <datalist id="advisor-company-options">
                {companyOptions.map((c) => <option key={c} value={c} />)}
              </datalist>
            </FilterField>

            <FilterField label="Name">
              <input
                type="text"
                placeholder="Advisor name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className={fieldClass}
              />
            </FilterField>
          </div>

          {serviceOptions.length > 0 ? (
            <FilterField label="Service" className="mt-2.5">
              <div className="flex flex-wrap gap-2 pt-0.5">
                {serviceOptions.map((service) => {
                  const active = searchService === service;
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => setSearchService(active ? "" : service)}
                      className={`rounded-full border px-3 py-1 font-poppins text-[12px] font-semibold transition-all duration-150 ${
                        active
                          ? "border-[#0A4A4A] bg-[#0A4A4A] text-[#F59E0B]"
                          : "border-[#D1D5DB] bg-white text-[#374151] hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </FilterField>
          ) : null}

          {hasFilters && searchResults !== null ? (
            <p className="mt-3 text-center font-poppins text-[11px] text-[#6B7280]">
              {searchResults.length === 0
                ? "No advisors matched your search."
                : `${searchResults.length} advisor${searchResults.length !== 1 ? "s" : ""} found`}
            </p>
          ) : null}
        </div>

        {/* Advisor cards */}
        <div className="mb-12 w-full lg:mb-12">
          {displayedAdvisors.length ? (
            <>
              {/* Mobile horizontal scroll */}
              <LandingSnapScroll ariaLabel="Advisor profiles" className="py-2 lg:hidden">
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

              {/* Desktop grid */}
              <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3 xl:gap-5">
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

              {!isLoggedIn && hasFilters && (
                <p className="mt-4 text-center font-poppins text-[12px] text-[#6B7280]">
                  Featured advisor profiles open directly.{" "}
                  <span className="text-[#0A4A4A] font-semibold">Login</span>{" "}
                  to access all advisor profiles.
                </p>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-[#D7D7D7] bg-white px-5 py-10 text-center font-poppins text-sm text-[#374151] shadow-sm lg:rounded-[28px] lg:px-6 lg:py-12">
              {hasFilters
                ? "No advisors matched your search. Try a different city, service, or name."
                : "No advisors are featured yet. Check back soon."}
            </div>
          )}
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

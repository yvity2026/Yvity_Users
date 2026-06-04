"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AdvisorCardGold } from "../home-features/advisor-card-gold";
import { toAdvisorCardGoldProps } from "@/yvity-landing/lib/advisor/cardGoldProps";
import LandingSectionHeader from "./LandingSectionHeader";
import LandingSnapScroll, {
  LandingSnapItem,
} from "./LandingSnapScroll";
import { LANDING_INNER, LANDING_SECTION_ANCHOR, LANDING_SECTION_PY } from "./landingLayout";

const SERVICE_FILTER_OPTIONS = ["Life Insurance", "Health Insurance"];

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

export default function FindAdvisorsClient({ advisors }) {
  const [results, setResults] = useState(null);
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [searchName, setSearchName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const stateOptions = useMemo(
    () =>
      [
        ...new Set(
          advisors.map((advisor) => advisor.state).filter(Boolean),
        ),
      ].sort(),
    [advisors],
  );

  const companyOptions = useMemo(
    () =>
      [
        ...new Set(
          advisors.flatMap((advisor) => advisor.companies ?? []).filter(Boolean),
        ),
      ].sort(),
    [advisors],
  );

  const serviceOptions = useMemo(() => {
    const fromAdvisors = advisors.flatMap(
      (advisor) => advisor.serviceTypes ?? [],
    );
    return [
      ...new Set([...SERVICE_FILTER_OPTIONS, ...fromAdvisors].filter(Boolean)),
    ].sort();
  }, [advisors]);

  const runSearch = useCallback(
    async ({
      state = "",
      city = "",
      service = "",
      company = "",
      name = "",
      signal,
    } = {}) => {
      const params = new URLSearchParams();

      if (state.trim()) params.set("state", state.trim());
      if (city.trim()) params.set("city", city.trim());
      if (service) params.set("service", service);
      if (company.trim()) params.set("company", company.trim());
      if (name.trim()) params.set("name", name.trim());

      setIsSearching(true);
      setSearchError("");

      try {
        const response = await fetch(
          `/api/advisors/search?${params.toString()}`,
          { signal },
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Search failed");
        }

        setResults(payload.advisors ?? []);
      } catch (error) {
        if (error.name === "AbortError") return;
        setSearchError(error.message || "Search failed");
        setResults([]);
      } finally {
        if (!signal?.aborted) setIsSearching(false);
      }
    },
    [],
  );

  const hasSearchInputs =
    Boolean(searchState.trim()) ||
    Boolean(searchCity.trim()) ||
    Boolean(searchService) ||
    Boolean(searchCompany.trim()) ||
    Boolean(searchName.trim());

  useEffect(() => {
    if (!hasSearchInputs) return undefined;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      runSearch({
        state: searchState,
        city: searchCity,
        service: searchService,
        company: searchCompany,
        name: searchName,
        signal: controller.signal,
      });
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [
    hasSearchInputs,
    runSearch,
    searchState,
    searchCity,
    searchService,
    searchCompany,
    searchName,
  ]);

  const clearAllFilters = () => {
    setSearchState("");
    setSearchCity("");
    setSearchService("");
    setSearchCompany("");
    setSearchName("");
    setResults(null);
    setSearchError("");
  };

  const advisorsToDisplay = hasSearchInputs ? results ?? [] : advisors;
  const displayedAdvisors = hasSearchInputs
    ? advisorsToDisplay.slice(0, 15)
    : advisorsToDisplay.slice(0, 9);

  const resetField = () => {
    setSearchError("");
    setIsSearching(false);
  };

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
            accent="Discover Verified"
            title={
              <>
                Advisors
                <br className="lg:hidden" /> Near You
              </>
            }
            description="Search from 500+ YVITY verified insurance advisors across India."
          />
        </motion.div>

        <div className="mb-5 rounded-xl border border-[#D7D7D7]/80 bg-white p-3 font-poppins shadow-[0_2px_12px_rgba(10,74,74,0.06)] lg:mb-6 lg:rounded-2xl lg:p-4">
          <div className="mb-2.5 flex items-center justify-between gap-2 lg:mb-3">
            <p className="text-xs font-semibold text-[#0A4A4A] lg:text-sm">
              Search advisors
            </p>
            {hasSearchInputs ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-[#F59E0B] lg:text-xs"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2 lg:grid-cols-5 lg:gap-3">
            <FilterField label="State">
              <input
                type="text"
                list="advisor-state-options"
                placeholder="e.g. Telangana"
                value={searchState}
                onChange={(e) => {
                  setSearchState(e.target.value);
                  resetField();
                }}
                className={fieldClass}
              />
              <datalist id="advisor-state-options">
                {stateOptions.map((state) => (
                  <option key={state} value={state} />
                ))}
              </datalist>
            </FilterField>

            <FilterField label="City">
              <input
                type="text"
                placeholder="e.g. Hyderabad"
                value={searchCity}
                onChange={(e) => {
                  setSearchCity(e.target.value);
                  resetField();
                }}
                className={fieldClass}
              />
            </FilterField>

            <FilterField label="Service">
              <select
                value={searchService}
                onChange={(e) => {
                  setSearchService(e.target.value);
                  resetField();
                }}
                className={`${fieldClass} cursor-pointer appearance-none`}
              >
                <option value="">All services</option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Company">
              <input
                type="text"
                list="advisor-company-options"
                placeholder="e.g. LIC"
                value={searchCompany}
                onChange={(e) => {
                  setSearchCompany(e.target.value);
                  resetField();
                }}
                className={fieldClass}
              />
              <datalist id="advisor-company-options">
                {companyOptions.map((company) => (
                  <option key={company} value={company} />
                ))}
              </datalist>
            </FilterField>

            <FilterField
              label="Name"
              className="min-[400px]:col-span-2 lg:col-span-1"
            >
              <input
                type="text"
                placeholder="Advisor name"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  resetField();
                }}
                className={fieldClass}
              />
            </FilterField>
          </div>

          <button
            type="button"
            onClick={() =>
              runSearch({
                state: searchState,
                city: searchCity,
                service: searchService,
                company: searchCompany,
                name: searchName,
              })
            }
            disabled={!hasSearchInputs || isSearching}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-[#0A4A4A] px-4 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B] transition-opacity disabled:cursor-not-allowed disabled:opacity-45 lg:hidden"
          >
            {isSearching ? "Searching…" : "Search advisors"}
          </button>

          {hasSearchInputs && searchError ? (
            <p className="mt-2.5 text-xs text-[#B91C1C] lg:text-sm">{searchError}</p>
          ) : null}
          {hasSearchInputs && isSearching ? (
            <p className="mt-2.5 text-xs text-[#6B7280] lg:text-sm">Searching…</p>
          ) : null}
        </div>

        <div className="mb-12 w-full lg:mb-12">
          {displayedAdvisors.length ? (
            <>
              <LandingSnapScroll
                ariaLabel="Advisor profiles"
                className="py-2 lg:hidden"
              >
                {displayedAdvisors.map((advisor, index) => (
                  <LandingSnapItem
                    key={`advisor-${advisor.id ?? index}`}
                    className="w-[82vw] max-w-[380px] overflow-visible sm:w-[340px]"
                  >
                    <div className="landing-hero-card-glow w-full overflow-visible py-1">
                      <AdvisorCardGold {...toAdvisorCardGoldProps(advisor)} />
                    </div>
                  </LandingSnapItem>
                ))}
              </LandingSnapScroll>
              <p className="mt-1 text-center font-poppins text-[10px] text-[#6B7280] lg:hidden">
                Swipe for more advisors
              </p>
              <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3 xl:gap-5">
                {displayedAdvisors.map((advisor, index) => (
                  <div
                    key={`advisor-grid-${advisor.id ?? index}`}
                    className="landing-hero-card-glow w-full max-w-[520px] overflow-visible py-1 lg:mx-auto"
                  >
                    <AdvisorCardGold {...toAdvisorCardGoldProps(advisor)} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-[#D7D7D7] bg-white px-5 py-10 text-center font-poppins text-sm text-[#374151] shadow-sm lg:rounded-[28px] lg:px-6 lg:py-12">
              {hasSearchInputs
                ? "No public advisors matched your search."
                : "No advisors are featured yet. Check back soon."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

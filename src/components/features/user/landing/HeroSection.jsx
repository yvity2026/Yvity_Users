"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthUserContext";
import { AdvisorCardGold } from "@/yvity-landing/app/components/home-features/advisor-card-gold";
import { recordSearchImpressionsClient } from "@/lib/advisors/record-search-impressions";
import { toAdvisorCardGoldProps } from "@/lib/advisor/cardGoldProps";
import UserProfileAvatar from "@/components/user/UserProfileAvatar";
import AnimatedCounter from "@/yvity-landing/components/ui/AnimatedCounter";

const FILTER_OPTIONS = [
  { key: "all", label: "All Advisors" },
  { key: "verified", label: "Verified", icon: "verified" },
];

/**
 * @param {{
 *   onSearchChange?: (filters: Record<string, string>) => void;
 *   advisors?: import("@/lib/advisors/mock-public-advisors").PublicAdvisorCard[];
 *   mode?: "explore" | string;
 * }} props
 */
const AdvisorSearchFilter = ({ onSearchChange, advisors = [], mode = "explore" }) => {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchService, setSearchService] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [countData, setCountData] = useState([
    {
      count: 0,
      title: "Verified Advisors",
    },
    {
      count: 0,
      title: "Cities Covered",
    },
    {
      count: 0,
      title: "Verified Reviews",
    },
  ]);
  const serviceMenuRef = useRef(null);
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const sortMode = searchParams.get("sort") || "";

  useEffect(() => {
    setLocation(searchParams.get("city") || "");
    setSearchQuery(searchParams.get("name") || "");
    setSearchService(searchParams.get("service") || "");
  }, [searchParams]);

  const serviceOptions = useMemo(
    () =>
      [
        ...new Set(
          advisors
            .flatMap((advisor) => advisor.serviceTypes ?? [])
            .filter(Boolean),
        ),
      ].sort(),
    [advisors],
  );

  useEffect(() => {
    function handlePointerDown(event) {
      if (!serviceMenuRef.current?.contains(event.target)) {
        setIsServiceMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadLandingStats = async () => {
      try {
        const response = await fetch("/api/public/landing-stats", {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result?.success || ignore) {
          return;
        }

        setCountData([
          {
            count: Number(result.data?.verifiedAdvisors || 0),
            title: "Verified Advisors",
          },
          {
            count: Number(result.data?.citiesCovered || 0),
            title: "Cities Covered",
          },
          {
            count: Number(result.data?.verifiedReviews || 0),
            title: "Verified Reviews",
          },
        ]);
      } catch (error) {
        console.error("Failed to load landing stats:", error);
      }
    };

    loadLandingStats();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredAdvisors = useMemo(() => {
    const filtered = advisors.filter((advisor) => {
      const advisorName = String(advisor?.name || "").toLowerCase();
      const advisorTitle = String(advisor?.title || "").toLowerCase();
      const advisorLocation = String(advisor?.location || "").toLowerCase();
      const advisorServiceTypes = Array.isArray(advisor?.serviceTypes)
        ? advisor.serviceTypes
        : [];
      const advisorTags = Array.isArray(advisor?.tags) ? advisor.tags : [];

      const matchesSearch =
        !searchQuery.trim() ||
        advisorName.includes(searchQuery.trim().toLowerCase()) ||
        advisorTitle.includes(searchQuery.trim().toLowerCase());

      const matchesLocation =
        !location.trim() ||
        advisorLocation.includes(location.trim().toLowerCase());

      const matchesService =
        !searchService || advisorServiceTypes.includes(searchService);

      let matchesFilter = true;

      if (activeFilter === "verified") {
        matchesFilter = advisor?.showVerifiedBadge === true;
      }

      return (
        matchesSearch && matchesLocation && matchesService && matchesFilter
      );
    });

    if (sortMode === "rating") {
      return [...filtered].sort(
        (left, right) =>
          Number(right.avgRating || 0) - Number(left.avgRating || 0),
      );
    }

    return filtered;
  }, [activeFilter, advisors, location, searchQuery, searchService, sortMode]);

  const hasActiveFilters =
    activeFilter !== "all" ||
    Boolean(location.trim()) ||
    Boolean(searchQuery.trim()) ||
    Boolean(searchService);

  const displayedAdvisors = hasActiveFilters
    ? filteredAdvisors.slice(0, 15)
    : filteredAdvisors.slice(0, 9);

  useEffect(() => {
    if (!hasActiveFilters || displayedAdvisors.length === 0) return;
    void recordSearchImpressionsClient(
      displayedAdvisors.map((advisor) => advisor.id),
      "dashboard_explore",
    );
  }, [hasActiveFilters, displayedAdvisors]);

  useEffect(() => {
    if (!onSearchChange) {
      return;
    }

    const timeoutId = setTimeout(() => {
      onSearchChange({
        location,
        searchQuery,
        searchService,
        activeFilter,
      });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [activeFilter, location, onSearchChange, searchQuery, searchService]);

  const getGreeting = () => {
    const now = new Date();
    const indiaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    const hour = indiaTime.getHours();

    if (hour < 12) return ["Good morning", "\u2600\uFE0F"];
    if (hour < 17) return ["Good afternoon", "\u{1F324}\uFE0F"];
    if (hour < 21) return ["Good evening", "\u{1F307}"];
    return ["Good night", "\u{1F319}"];
  };

  const wave = getGreeting();

  return (
    <div className="w-full mx-auto bg-[#0D4D4D] text-white overflow-hidden font-poppins">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 pb-[39px]">
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 flex items-start justify-between gap-4 pt-4 sm:pt-6">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {mode === "explore" ? (
              <>
                <p className="font-poppins text-sm font-medium text-[#B4B1AA] sm:text-base">
                  Explore
                </p>
                <h1 className="text-[#F8F6F1] text-[32px] font-bold font-cormorant sm:text-[38px]">
                  Find verified{" "}
                  <span className="text-[#F59E0B] italic leading-normal">
                    advisors
                  </span>{" "}
                  on YVITY
                </h1>
              </>
            ) : (
              <>
                <p className="flex items-center gap-2 text-base font-normal text-[#B4B1AA]">
                  {wave[0]}, {user?.name}{" "}
                  <span role="img" aria-label="wave">
                    {wave[1]}
                  </span>
                </p>
                <h1 className="text-[#F8F6F1] text-[38px] font-bold font-cormorant">
                  Find Your{" "}
                  <span className="text-[#F59E0B] italic leading-normal">
                    Trusted
                  </span>{" "}
                  <br />
                  Insurance Advisor on YVITY
                </h1>
              </>
            )}
          </div>

          <UserProfileAvatar
            src={user?.selfie_url}
            name={user?.name}
            size={72}
            className="hidden shrink-0 ring-2 ring-[#F59E0B] sm:flex"
          />
        </div>

        <div className="bg-white p-1 rounded-3xl md:rounded-full border border-gray-400 shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] mb-8 flex flex-col md:flex-row items-center md:items-center md:divide-x font-poppins">
          <div className="w-full md:flex-[0.5] py-3 md:py-4 pl-4 md:pl-5 flex items-center gap-1 text-[#374151] lg:ml-8 border-r-gray-600">
            <img
              src="/svgs/home/advisor_card/boxicons_location.svg"
              alt="location"
              className="mr-1"
            />
            <input
              type="text"
              placeholder="City (e.g. Nellore, Hyderabad)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full outline-none text-[13px] md:text-[12px] xl:text-[13px] placeholder-gray bg-transparent text-[#374151] truncate font-medium"
            />
          </div>

          <div
            ref={serviceMenuRef}
            className="relative w-full md:w-auto py-3 md:py-4 px-4 md:px-5 flex items-center gap-1 text-gray-400 border-t md:border-t-0 border-gray-600"
          >
            <img
              src="/svgs/home/advisor_card/charm_square-tick.svg"
              alt="services"
              className="w-4 h-4 flex-shrink-0"
            />

            <button
              type="button"
              onClick={() => setIsServiceMenuOpen((open) => !open)}
              className="w-full md:w-36 flex items-center justify-between gap-2 text-left outline-none text-[13px] md:text-[12px] font-medium bg-transparent cursor-pointer text-[#374151]"
            >
              <span className="truncate">
                {searchService || "All Services"}
              </span>
              <svg
                className={`h-4 w-4 flex-shrink-0 text-[#6B7280] transition-transform ${
                  isServiceMenuOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.512a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isServiceMenuOpen ? (
              <div className="absolute left-0 top-full z-30 mt-2 w-[220px] overflow-hidden rounded-2xl border border-[#D7D7D7] bg-white shadow-[0_16px_40px_rgba(17,24,39,0.12)]">
                <button
                  type="button"
                  onClick={() => {
                    setSearchService("");
                    setIsServiceMenuOpen(false);
                  }}
                  className={`flex w-full items-center px-4 py-3 text-left text-[13px] font-medium font-poppins transition-colors ${
                    searchService === ""
                      ? "bg-[#0A4A4A] text-white"
                      : "text-[#374151] hover:bg-[#F8F6F1]"
                  }`}
                >
                  All Services
                </button>
                {serviceOptions.map((service) => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => {
                      setSearchService(service);
                      setIsServiceMenuOpen(false);
                    }}
                    className={`flex w-full items-center px-4 py-3 text-left text-[13px] font-medium font-poppins transition-colors ${
                      searchService === service
                        ? "bg-[#0A4A4A] text-white"
                        : "text-[#374151] hover:bg-[#F8F6F1]"
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="w-full md:flex-[1.5] p-4 md:p-0 md:py-4 md:px-5 flex items-center border-t md:border-t-0 border-gray-600">
            <div className="w-full flex items-center flex-grow overflow-hidden text-gray-400">
              <img
                src="/svgs/home/advisor_card/mdi_search.svg"
                alt="Search"
                className="mr-1"
              />
              <input
                type="text"
                placeholder="Search by name.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none text-[13px] md:text-[12px] placeholder-gray bg-transparent text-[#111827] truncate font-medium"
              />
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden items-center gap-3 mb-10 font-nunito">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`cursor-pointer whitespace-nowrap px-5 py-2.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 shadow-sm tracking-wide border ${
                activeFilter === filter.key
                  ? "bg-[#115e59] text-white"
                  : "bg-white text-[#374151] border-gray-200"
              }`}
            >
              {filter.icon === "verified" ? (
                <img
                  src="/svgs/home/advisor_card/material-icon-theme_verified.svg"
                  alt="Verified"
                  className="w-4 h-4"
                />
              ) : filter.icon ? (
                <span className="text-[#f59e0b] text-[15px] leading-none">
                  {filter.icon}
                </span>
              ) : null}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full border-t border-white/5 bg-[#083D3D]/60 md:px-[120px]">
        <div className="mx-auto py-3">
          <div className="no-scrollbar flex items-center gap-3 overflow-x-auto px-3 text-center md:grid md:grid-cols-3 md:gap-y-0 md:px-0 md:text-left xl:px-[150px]">
            {countData.map((item, index) => (
              <div
                key={item.title}
                className={`min-w-[170px] flex-shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 md:min-w-0 md:rounded-none md:border-0 md:bg-transparent md:py-0 ${
                  index === 0
                    ? "md:border-r border-white/10"
                    : index === 1
                      ? "md:justify-center md:border-r border-white/10"
                      : "md:justify-end"
                }`}
              >
                <AnimatedCounter
                  value={item.count}
                  className="text-[clamp(18px,3vw,24px)] font-bold text-[#F59E0B] text-center font-poppins"
                />
                <span className="text-[clamp(10px,1vw,14px)] font-normal text-[#F8F6F1] font-poppins">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-5 lg:px-6 xl:px-8 2xl:px-10 pt-[62px] pb-[54px] flex flex-col gap-10 bg-[#FFFFFF] w-full">
        <span className="flex items-center justify-between">
          <span className="text-[clamp(32px,5vw,48px)] leading-[50px] font-bold font-cormorant text-[#0A4A4A] flex items-center gap-3">
            Featured
            <p className="text-[clamp(32px,5vw,48px)] font-bold italic text-[#F59E0B] font-cormorant">
              Advisors
            </p>
          </span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 xl:gap-6">
          {displayedAdvisors.map((advisor, index) => (
            <div
              key={advisor.id || index}
              className="w-full max-w-[520px] mx-auto"
            >
              <AdvisorCardWithSave advisor={advisor} showSave={Boolean(user?.id)} />
            </div>
          ))}
        </div>

        {!displayedAdvisors.length ? (
          <div className="rounded-[28px] border border-[#D7D7D7] bg-white px-6 py-12 text-center font-poppins text-[#374151] shadow-sm">
            No public advisors matched your search.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdvisorSearchFilter;

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardOnboardingGuidance from "@/components/dashboard/DashboardOnboardingGuidance";
import DashboardWelcomeBanner from "@/components/dashboard/DashboardWelcomeBanner";
import DashboardHomeDiscovery, {
  FALLBACK_SERVICE_CHIPS,
} from "@/components/dashboard/DashboardHomeDiscovery";
import DashboardHomeInlineResults from "@/components/dashboard/home/DashboardHomeInlineResults";
import DashboardHomeStickySearch from "@/components/dashboard/home/DashboardHomeStickySearch";
import DashboardHomeTrustStrip from "@/components/dashboard/home/DashboardHomeTrustStrip";
import DashboardHomeEmptyState from "@/components/dashboard/home/DashboardHomeEmptyState";
import { DashboardPageLoading } from "@/components/dashboard/dashboard-page-states";
import {
  DashboardHomeFeatured,
  DashboardHomeRecentReviews,
  DashboardHomeRecommended,
  DashboardHomeTopRated,
  DashboardHomeTrustFooter,
} from "@/components/dashboard/home/DashboardHomeBelowFold";
import { useAuth } from "@/context/AuthUserContext";
import { getAdvisorWorkspaceSetupState } from "@/lib/advisor/workspaceSetupStatus";
import { recordSearchImpressionsClient } from "@/lib/advisors/record-search-impressions";
import { filterHomeAdvisors } from "@/lib/dashboard/homeAdvisors";
import {
  getMySpaceNavHref,
  markOnboardingCtaCompleteLocal,
  persistOnboardingCtaComplete,
  shouldShowOnboardingCta,
} from "@/lib/dashboard/onboardingCta";

const RECENT_SERVICE_KEY = "yvity_home_recent_service";

function buildExploreUrl(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (String(value || "").trim()) {
      search.set(key, String(value).trim());
    }
  });
  const query = search.toString();
  return query ? `/dashboard/explore?${query}` : "/dashboard/explore";
}

function readRecentService(userId) {
  if (!userId || typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(`${RECENT_SERVICE_KEY}_${userId}`) || "";
  } catch {
    return "";
  }
}

function writeRecentService(userId, service) {
  if (!userId || !service || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${RECENT_SERVICE_KEY}_${userId}`, service);
  } catch {
    // ignore
  }
}

/**
 * @param {{ advisors?: import("@/lib/advisors/mock-public-advisors").PublicAdvisorCard[] }} props
 */
export default function DashboardHome({ advisors = [] }) {
  const router = useRouter();
  const { user, advisor, setUser, loading: authLoading } = useAuth();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [inlineVisible, setInlineVisible] = useState(false);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [recentServiceChip, setRecentServiceChip] = useState("");

  const searchInputRef = useRef(null);
  const discoveryRef = useRef(null);

  const setupState = useMemo(
    () => getAdvisorWorkspaceSetupState(user, advisor),
    [user, advisor],
  );

  const workspaceSetupHref = `${getMySpaceNavHref(user, advisor)}?setup=profile`;

  const serviceOptions = useMemo(
    () =>
      [
        ...new Set(
          advisors.flatMap((entry) => entry.serviceTypes ?? []).filter(Boolean),
        ),
      ].sort(),
    [advisors],
  );

  const serviceChips = useMemo(() => {
    if (serviceOptions.length > 0) return serviceOptions;
    return FALLBACK_SERVICE_CHIPS;
  }, [serviceOptions]);

  const allServiceOptions = useMemo(
    () =>
      [...new Set([...serviceOptions, ...FALLBACK_SERVICE_CHIPS])].sort(),
    [serviceOptions],
  );

  const effectiveCity = searchCity || user?.city || "";

  const recentService = useMemo(() => {
    if (recentServiceChip) return recentServiceChip;
    return readRecentService(user?.id);
  }, [recentServiceChip, user?.id]);

  const currentFilters = useMemo(
    () => ({
      query: searchQuery,
      city: effectiveCity,
      service: searchService || activeQuickFilter,
      company: searchCompany,
    }),
    [searchQuery, effectiveCity, searchService, activeQuickFilter, searchCompany],
  );

  const inlineResults = useMemo(() => {
    if (!inlineVisible) return [];
    return filterHomeAdvisors(advisors, currentFilters).slice(0, 5);
  }, [advisors, currentFilters, inlineVisible]);

  useEffect(() => {
    if (!inlineVisible || inlineResults.length === 0) return;
    void recordSearchImpressionsClient(
      inlineResults.map((advisor) => advisor.id),
      "dashboard_home",
    );
  }, [inlineResults, inlineVisible]);

  const exploreHref = useMemo(
    () =>
      buildExploreUrl({
        name: currentFilters.query,
        city: currentFilters.city,
        service: currentFilters.service,
        company: currentFilters.company,
      }),
    [currentFilters],
  );

  const runExploreSearch = useCallback(
    (overrides = {}) => {
      router.push(
        buildExploreUrl({
          name: overrides.name ?? searchQuery,
          city: overrides.city ?? effectiveCity,
          service: overrides.service ?? searchService ?? activeQuickFilter,
          company: overrides.company ?? searchCompany,
        }),
      );
    },
    [router, searchQuery, effectiveCity, searchService, activeQuickFilter, searchCompany],
  );

  const runInlineSearch = useCallback(() => {
    setInlineVisible(true);
  }, []);

  const handleQuickFilter = useCallback(
    (filter) => {
      const next = activeQuickFilter === filter ? "" : filter;
      setActiveQuickFilter(next);
      setSearchService(next);

      if (next) {
        writeRecentService(user?.id, next);
        setRecentServiceChip(next);
        setInlineVisible(true);
      } else {
        setInlineVisible(false);
      }
    },
    [activeQuickFilter, user?.id],
  );

  const handleClearFilters = () => {
    setSearchCity("");
    setSearchService("");
    setSearchCompany("");
    setSearchQuery("");
    setActiveQuickFilter("");
    setInlineVisible(false);
  };

  const showOnboarding =
    !authLoading &&
    !onboardingDismissed &&
    shouldShowOnboardingCta(user);

  const dismissOnboarding = () => {
    if (!user?.id) return;

    setOnboardingDismissed(true);
    markOnboardingCtaCompleteLocal(user.id);
    setUser((current) =>
      current ? { ...current, onboarding_cta_completed: true } : current,
    );

    if (user.onboarding_cta_completed !== true) {
      void persistOnboardingCtaComplete();
    }
  };

  const focusHomeSearchBar = () => {
    const input = searchInputRef.current;
    if (!input) return;

    discoveryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    window.setTimeout(() => {
      input.focus();
      if (typeof input.select === "function") {
        input.select();
      }
    }, 280);
  };

  const handleStartSearching = () => {
    dismissOnboarding();
    window.setTimeout(focusHomeSearchBar, 60);
  };

  const handleGoToMySpace = async () => {
    const href = getMySpaceNavHref(user, advisor);
    dismissOnboarding();
    try {
      const res = await fetch("/api/auth/advisor-intent", { method: "POST", credentials: "same-origin" });
      if (res.ok) {
        const result = await res.json();
        const nextRoles = result?.data?.roles;
        if (Array.isArray(nextRoles)) {
          setUser((current) => (current ? { ...current, roles: nextRoles } : current));
        }
      }
    } catch {
      // still navigate — My Space can prompt setup
    }
    router.push(href);
  };

  useEffect(() => {
    let ignore = false;

    fetch("/api/dashboard/home-reviews", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((result) => {
        if (ignore || !result?.success) return;
        setReviews(result.data ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setReviewsLoaded(true);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const node = discoveryRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickySearch(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (authLoading) {
    return <DashboardPageLoading label="Loading your dashboard" />;
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 pb-8 pt-4 sm:px-4 sm:pt-6">
      <DashboardHomeStickySearch
        visible={showStickySearch}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSubmitSearch={runInlineSearch}
        onOpenFilters={() => {
          setShowStickySearch(false);
          discoveryRef.current?.scrollIntoView({ behavior: "smooth" });
          window.setTimeout(() => setShowFilters(true), 320);
        }}
      />

      {showOnboarding ? (
        <DashboardOnboardingGuidance
          user={user}
          onStartSearching={handleStartSearching}
          onGoToMySpace={handleGoToMySpace}
        />
      ) : (
        <DashboardWelcomeBanner
          user={user}
          workspaceNeedsSetup={
            setupState.isAdvisorRole && setupState.showSetupWorkspace
          }
          workspaceSetupHref={workspaceSetupHref}
        />
      )}

      <div ref={discoveryRef}>
        <DashboardHomeDiscovery
          searchInputRef={searchInputRef}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchCity={searchCity || user?.city || ""}
          onSearchCityChange={setSearchCity}
          searchService={searchService}
          onSearchServiceChange={setSearchService}
          searchCompany={searchCompany}
          onSearchCompanyChange={setSearchCompany}
          activeQuickFilter={activeQuickFilter}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((open) => !open)}
          serviceChips={serviceChips}
          allServiceOptions={allServiceOptions}
          onSubmitSearch={() => {
            runInlineSearch();
          }}
          onApplyFilters={() => {
            runInlineSearch();
          }}
          onClearFilters={handleClearFilters}
          onQuickFilter={handleQuickFilter}
          hasSearched={inlineVisible}
        />
      </div>

      <DashboardHomeTrustStrip />

      {inlineVisible ? (
        inlineResults.length > 0 ? (
          <DashboardHomeInlineResults
            results={inlineResults}
            exploreHref={exploreHref}
            onViewAll={() => runExploreSearch()}
          />
        ) : (
          <div className="mb-8">
            <DashboardHomeEmptyState
              message="No advisors match your search yet. Try another city, service, or browse everyone on Explore."
              actionHref={exploreHref}
              actionLabel="View all on Explore"
            />
          </div>
        )
      ) : null}

      <DashboardHomeFeatured advisors={advisors} loading={authLoading} />
      <DashboardHomeTopRated advisors={advisors} loading={authLoading} />
      <DashboardHomeRecentReviews
        reviews={reviews}
        reviewsLoaded={reviewsLoaded}
      />
      <DashboardHomeRecommended
        advisors={advisors}
        userCity={user?.city}
        activeService={activeQuickFilter || searchService}
        recentService={recentService}
        loading={authLoading}
      />

      <div className="mt-10">
        <DashboardHomeTrustFooter />
      </div>
    </div>
  );
}

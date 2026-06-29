"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { toAdvisorCardGoldProps } from "@/lib/advisor/cardGoldProps";
import { AdvisorProfileCard } from "@/yvity-landing/app/components/home-features/advisor-profile-card";

export default function DashboardHomeInlineResults({
  results = [],
  exploreHref = "/dashboard/explore",
  onViewAll,
}) {
  if (!results.length) return null;

  return (
    <section
      className="home-inline-results mb-8 animate-[home-discovery-panel-in_0.35s_cubic-bezier(0.22,1,0.36,1)]"
      aria-label="Search preview"
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Quick preview
          </p>
          <h2 className="font-cormorant text-xl font-bold text-[#0A4A4A]">
            Showing {results.length} result{results.length === 1 ? "" : "s"}
          </h2>
          <p className="mt-0.5 font-poppins text-xs text-[#9CA3AF]">
            See all matches on Explore
          </p>
        </div>

        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex shrink-0 items-center gap-0.5 font-poppins text-sm font-semibold text-[#0A4A4A] transition hover:text-[#F59E0B]"
          >
            View all <ChevronRight size={18} strokeWidth={2.25} />
          </button>
        ) : (
          <Link
            href={exploreHref}
            className="inline-flex shrink-0 items-center gap-0.5 font-poppins text-sm font-semibold text-[#0A4A4A] transition hover:text-[#F59E0B]"
          >
            View all <ChevronRight size={18} strokeWidth={2.25} />
          </Link>
        )}
      </div>

      {/* Compact cards — horizontal scroll on mobile, up to 3-col grid on desktop */}
      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
        {results.slice(0, 3).map((advisor) => {
          const cardProps = toAdvisorCardGoldProps(advisor);
          return (
            <div
              key={advisor.id ?? cardProps.name}
              className="w-[300px] shrink-0 overflow-visible py-4 sm:w-auto"
            >
              <AdvisorProfileCard
                {...cardProps}
                variant="compact"
                isFeatured
                isLoggedIn
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

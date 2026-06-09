"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Star } from "lucide-react";
import { toAdvisorCardGoldProps } from "@/lib/advisor/cardGoldProps";

function InlineAdvisorRow({ advisor }) {
  const props = toAdvisorCardGoldProps(advisor);
  const initials = (props.name || "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const inner = (
    <>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#0A4A4A]/8 ring-1 ring-[#0A4A4A]/10">
        {props.avatarUrl ? (
          <img src={props.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#0A4A4A] font-poppins text-xs font-bold text-[#F59E0B]">
            {initials}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-poppins text-sm font-semibold text-[#0A4A4A]">
          {props.name}
        </p>
        <p className="truncate font-poppins text-xs text-[#6B7280]">{props.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-0.5 font-poppins text-[11px] text-[#6B7280]">
            <MapPin size={11} aria-hidden />
            {props.location}
          </span>
          <span className="inline-flex items-center gap-0.5 font-poppins text-[11px] font-semibold text-[#F59E0B]">
            <Star size={11} fill="currentColor" aria-hidden />
            {props.avgRating}
          </span>
        </div>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-[#0A4A4A]/35 transition group-hover:translate-x-0.5 group-hover:text-[#F59E0B]"
        aria-hidden
      />
    </>
  );

  const className =
    "home-inline-result-row group flex items-center gap-3 rounded-2xl border border-[#E4E2DB]/90 bg-white/95 px-3 py-3 shadow-[0_2px_14px_rgba(10,74,74,0.06)] transition hover:border-[#0A4A4A]/15 hover:shadow-[0_6px_22px_rgba(10,74,74,0.1)]";

  if (props.profileUrl) {
    return (
      <Link href={props.profileUrl} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

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
      <div className="mb-3 flex items-end justify-between gap-3">
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
            View all
            <ChevronRight size={18} strokeWidth={2.25} />
          </button>
        ) : (
          <Link
            href={exploreHref}
            className="inline-flex shrink-0 items-center gap-0.5 font-poppins text-sm font-semibold text-[#0A4A4A] transition hover:text-[#F59E0B]"
          >
            View all
            <ChevronRight size={18} strokeWidth={2.25} />
          </Link>
        )}
      </div>

      <ul className="space-y-2.5">
        {results.map((advisor) => (
          <li key={advisor.id}>
            <InlineAdvisorRow advisor={advisor} />
          </li>
        ))}
      </ul>
    </section>
  );
}

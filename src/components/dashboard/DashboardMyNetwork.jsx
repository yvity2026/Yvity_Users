"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  Bookmark,
  Compass,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import AdvisorCardWithSave from "@/components/advisor/AdvisorCardWithSave";
import { useFetchSavedProfiles } from "@/hooks/useSavedProfiles";

const COMING_SOON = ["My community", "Following & connections", "Messages between members"];

const QUICK_LINKS = [
  {
    icon: Compass,
    title: "Explore advisors",
    description: "Search verified professionals by city and service.",
    href: "/dashboard/explore",
  },
  {
    icon: Bookmark,
    title: "All saved profiles",
    description: "Every advisor you bookmarked in one place.",
    href: "/dashboard/saved",
  },
  {
    icon: ShieldCheck,
    title: "Identity & trust",
    description: "Annual verification and account safety.",
    href: "/dashboard/identity-refresh",
  },
];

export default function DashboardMyNetwork() {
  const { profiles, isLoading, error, fetchProfiles } = useFetchSavedProfiles();

  useEffect(() => {
    void fetchProfiles(1, 6);
  }, [fetchProfiles]);

  const savedCount = profiles.length;
  const hasSaved = !isLoading && !error && savedCount > 0;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8">
      <div className="mb-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F4F4] text-[#0A4A4A]">
          <Users size={24} strokeWidth={1.75} />
        </div>
        <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
          My Network
        </h1>
        <p className="mt-2 font-poppins text-sm text-[#6B7280] sm:text-base">
          Save advisors you trust, then revisit them here. Community and messaging
          are on the roadmap.
        </p>
      </div>

      <section className="mb-6 rounded-[2rem] border border-[#E4E2DB] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-cormorant text-2xl font-bold text-[#0A4A4A]">
              Saved <span className="italic text-[#F59E0B]">profiles</span>
            </h2>
            <p className="mt-1 font-poppins text-sm text-[#6B7280]">
              {isLoading
                ? "Loading your saves…"
                : hasSaved
                  ? `${savedCount} advisor${savedCount === 1 ? "" : "s"} saved`
                  : "No saves yet — tap the heart on any advisor card"}
            </p>
          </div>
          <Link
            href="/dashboard/saved"
            className="inline-flex shrink-0 items-center gap-1 font-poppins text-xs font-semibold text-[#0A4A4A] hover:text-[#F59E0B]"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {error ? (
          <p className="font-poppins text-sm text-[#DC2626]">{error}</p>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((key) => (
              <div
                key={key}
                className="h-[320px] animate-pulse rounded-3xl bg-[#F3F4F6]"
              />
            ))}
          </div>
        ) : hasSaved ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {profiles.map((advisor) => (
              <AdvisorCardWithSave key={advisor.id} advisor={advisor} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E4E2DB] bg-[#F8F6F1] px-6 py-10 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-[#F59E0B]" />
            <p className="mt-3 font-poppins text-sm text-[#374151]">
              Browse Home or Explore and save advisors with the heart icon.
            </p>
            <Link
              href="/dashboard/explore"
              className="mt-4 inline-flex rounded-xl bg-[#0A4A4A] px-5 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B]"
            >
              Explore advisors
            </Link>
          </div>
        )}
      </section>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[#E4E2DB] bg-white p-4 shadow-sm transition hover:border-[#0A4A4A]/20 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F4F4] text-[#0A4A4A]">
                <Icon size={20} />
              </div>
              <h3 className="font-cormorant text-lg font-bold text-[#0A4A4A]">
                {item.title}
              </h3>
              <p className="mt-1 font-poppins text-xs text-[#6B7280] sm:text-sm">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[#E4E2DB] bg-[#F8F6F1] p-5">
        <div className="mb-3 flex items-center gap-2 text-[#0A4A4A]">
          <MessageSquare className="h-5 w-5 text-[#F59E0B]" />
          <h3 className="font-cormorant text-xl font-bold">Coming soon</h3>
        </div>
        <ul className="space-y-2">
          {COMING_SOON.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 font-poppins text-sm text-[#374151]"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

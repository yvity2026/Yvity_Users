"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  Bookmark,
  Compass,
  MessageCircle,
  ShieldCheck,
  Users,
  Handshake,
  Bell,
  Star,
  Network,
  UserPlus,
  Share2,
} from "lucide-react";
import AdvisorCardWithSave from "@/components/advisor/AdvisorCardWithSave";
import { useFetchSavedProfiles } from "@/hooks/useSavedProfiles";
import { useAuth } from "@/context/AuthUserContext";
import { isAdvisorRole } from "@/lib/dashboard/welcomeBanner";

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

const ADVISOR_FEATURES = [
  {
    icon: UserPlus,
    title: "Client Introductions",
    description:
      "Clients will be able to send you a direct introduction request through YVITY — no cold calls, no middlemen.",
    tag: "For advisors",
  },
  {
    icon: Network,
    title: "Peer Advisor Network",
    description:
      "Connect with fellow YVITY advisors, share referrals for services you don't offer, and grow together.",
    tag: "For advisors",
  },
  {
    icon: Share2,
    title: "Referral Tracking",
    description:
      "Know exactly which clients found you through YVITY's network and track your referral chain over time.",
    tag: "For advisors",
  },
  {
    icon: Bell,
    title: "Activity Alerts",
    description:
      "Get notified when a client saves your profile, views your YVITY Score, or shares your page.",
    tag: "For advisors",
  },
];

const CUSTOMER_FEATURES = [
  {
    icon: MessageCircle,
    title: "Direct Introductions",
    description:
      "Request a no-pressure introduction to any advisor you've saved — they'll respond through YVITY.",
    tag: "For you",
  },
  {
    icon: Star,
    title: "Community Reviews",
    description:
      "See what other verified YVITY members say about advisors before you reach out.",
    tag: "For you",
  },
  {
    icon: Bell,
    title: "Follow & Get Updates",
    description:
      "Follow advisors you trust and get notified when they earn new credentials or achievements.",
    tag: "For you",
  },
  {
    icon: Handshake,
    title: "Trusted Referrals",
    description:
      "Members in your city can recommend advisors they've worked with — community-powered trust.",
    tag: "For you",
  },
];

function FeaturePreviewCard({ icon: Icon, title, description, tag }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-[#E4E2DB]/80 bg-white p-4 shadow-[0_2px_12px_rgba(10,74,74,0.05)] sm:p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E8F4F4] to-[#F8F6F1] text-[#0A4A4A]">
        <Icon size={20} strokeWidth={1.75} aria-hidden />
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-cormorant text-[17px] font-bold text-[#0A4A4A]">
            {title}
          </h3>
          <span className="rounded-full bg-[#FFF9E8] px-2 py-0.5 font-poppins text-[9px] font-bold uppercase tracking-wide text-[#92400E] ring-1 ring-[#F59E0B]/30">
            {tag}
          </span>
        </div>
        <p className="mt-1 font-poppins text-[13px] leading-snug text-[#6B7280]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function DashboardMyNetwork() {
  const { user } = useAuth();
  const { profiles, isLoading, error, fetchProfiles } = useFetchSavedProfiles();
  const isAdvisor = isAdvisorRole(user);

  useEffect(() => {
    void fetchProfiles(1, 6);
  }, [fetchProfiles]);

  const savedCount = profiles.length;
  const hasSaved = !isLoading && !error && savedCount > 0;

  const features = isAdvisor ? ADVISOR_FEATURES : CUSTOMER_FEATURES;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8">

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F4F4] text-[#0A4A4A]">
          <Users size={24} strokeWidth={1.75} />
        </div>
        <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
          My Network
        </h1>
        <p className="mt-2 max-w-xl font-poppins text-sm leading-relaxed text-[#6B7280] sm:text-base">
          {isAdvisor
            ? "Your future client connections and peer advisor community — save profiles today, connect when it launches."
            : "Save advisors you trust and connect with them when network features launch."}
        </p>
      </div>

      {/* Saved profiles — functional now */}
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
                  : "No saves yet — tap the bookmark on any advisor card"}
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
              <div key={key} className="h-[320px] animate-pulse rounded-3xl bg-[#F3F4F6]" />
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
              Browse Home or Explore and save advisors with the bookmark icon.
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

      {/* Quick links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
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

      {/* Coming soon — role-aware, engaging */}
      <section
        aria-labelledby="network-coming-heading"
        className="overflow-hidden rounded-[2rem] border border-[#0A4A4A]/12 bg-gradient-to-br from-[#0A4A4A] via-[#0D4D4D] to-[#083838]"
      >
        {/* Banner */}
        <div className="border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-[#F59E0B]/15 px-3 py-1 font-poppins text-[10px] font-bold uppercase tracking-[0.14em] text-[#F59E0B]">
                Building now · Phase 2
              </span>
              <h2
                id="network-coming-heading"
                className="mt-2 font-cormorant text-2xl font-bold text-white sm:text-3xl"
              >
                {isAdvisor
                  ? "Your client network is coming."
                  : "Connect with your advisors — coming soon."}
              </h2>
              <p className="mt-2 max-w-lg font-poppins text-sm leading-relaxed text-white/70">
                {isAdvisor
                  ? "You joined YVITY early. When My Network launches, you'll be ahead — already verified, already visible, already trusted by clients who saved your profile."
                  : "You're an early YVITY member. When My Network launches, you'll be able to reach out to advisors you've saved directly — no cold starts."}
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Network size={28} className="text-[#F59E0B]" strokeWidth={1.5} />
            </div>
          </div>

          {/* Early member badge */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-2">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#F59E0B]" />
            <span className="font-poppins text-[12px] font-semibold text-[#F59E0B]">
              You&apos;re an early member — you&apos;ll get access first
            </span>
          </div>
        </div>

        {/* Feature preview cards */}
        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <p className="mb-4 font-poppins text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
            {isAdvisor ? "What's building for you as an advisor" : "What's building for you"}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <FeaturePreviewCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>

        {/* Footer nudge */}
        <div className="border-t border-white/10 px-5 py-4 sm:px-7">
          <p className="font-poppins text-[12px] text-white/50">
            {isAdvisor
              ? "Meanwhile — complete your My Space profile so you're ready when clients can reach you."
              : "Meanwhile — explore and save advisors so your network is ready to go at launch."}
          </p>
          <Link
            href={isAdvisor ? "/dashboard/my-space" : "/dashboard/explore"}
            className="mt-3 inline-flex items-center gap-1.5 font-poppins text-sm font-semibold text-[#F59E0B] transition hover:text-[#FBBF24]"
          >
            {isAdvisor ? "Go to My Space" : "Explore advisors"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

    </div>
  );
}

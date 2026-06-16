"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import UserProfileAvatar from "@/components/user/UserProfileAvatar";
import SetupMyProfileModal from "@/components/advisor/setup-profile/SetupMyProfileModal";
import { MySpaceSetupBanner } from "@/components/advisor/my-space-setup-banner";
import YvityGoldMySpaceDashboard from "@/components/yvity-gold/yvity-gold-my-space-dashboard";
import { shouldShowGoldAdvisorWorkspace } from "@/lib/dashboard/goldWorkspace";
import { useAdvisorWorkspaceSetup } from "@/hooks/useAdvisorWorkspaceSetup";
import { useAuth } from "@/context/AuthUserContext";
import { isAdvisorRole } from "@/lib/dashboard/welcomeBanner";

/* ─── Customer My Space ─────────────────────────────────────── */

const CUSTOMER_LINKS = [
  {
    href: "/dashboard/profile",
    icon: UserRound,
    iconBg: "bg-[#F8F6F1]",
    iconColor: "text-[#0A4A4A]",
    title: "Profile & account",
    description: "Name, contact details, selfie, and account settings.",
  },
  {
    href: "/dashboard/identity-refresh",
    icon: ShieldCheck,
    iconBg: "bg-[#ECFDF5]",
    iconColor: "text-[#047857]",
    title: "Identity verification",
    description: "Refresh your live selfie when your YVITY anniversary is due.",
  },
  {
    href: "/dashboard/saved",
    icon: Bookmark,
    iconBg: "bg-[#FFF9E8]",
    iconColor: "text-[#92400E]",
    title: "Saved advisors",
    description: "Every advisor you bookmarked — revisit or compare them.",
  },
  {
    href: "/dashboard/explore",
    icon: Search,
    iconBg: "bg-[#E8F4F4]",
    iconColor: "text-[#0A4A4A]",
    title: "Explore advisors",
    description: "Search verified insurance professionals by city and service.",
  },
];

function CustomerMySpace({ user }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8">
      {/* Profile header */}
      <section className="yvity-on-dark mb-4 rounded-[28px] bg-[#124B48] p-5 text-white sm:p-6">
        <div className="flex items-center gap-4">
          <UserProfileAvatar
            src={user?.selfie_url}
            name={user?.name}
            size={64}
            className="shrink-0 ring-2 ring-[#F59E0B]"
          />
          <div className="min-w-0 flex-1">
            <p className="font-poppins text-sm text-[#89B5B7]">Your YVITY account</p>
            <h1 className="mt-0.5 font-cormorant text-xl font-bold leading-snug text-white sm:text-2xl">
              {user?.name || "YVITY member"}
            </h1>
            {user?.city ? (
              <p className="mt-1 font-poppins text-xs text-white/65">{user.city}</p>
            ) : null}
          </div>
          <Link
            href="/dashboard/profile"
            className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 font-poppins text-xs font-semibold text-white transition hover:bg-white/25"
          >
            Edit
          </Link>
        </div>
      </section>

      {/* Quick links grid */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CUSTOMER_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-[#E4E2DB] bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#0A4A4A]/30 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] sm:p-5"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden rounded-[inherit]">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-[#0A4A4A]/[0.03] to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none ${item.iconBg} ${item.iconColor}`}
              >
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-cormorant text-lg font-bold text-[#0A4A4A]">
                  {item.title}
                </h2>
                <p className="mt-0.5 font-poppins text-xs leading-snug text-[#6B7280] sm:text-sm">
                  {item.description}
                </p>
              </div>
              <ChevronRight size={16} className="mt-1 shrink-0 text-[#9CA3AF]" />
            </Link>
          );
        })}
      </div>

      {/* Soft advisor nudge */}
      <section className="rounded-2xl border border-[#E4E2DB]/80 bg-gradient-to-br from-[#F8F6F1] to-[#E8F4F4]/50 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0A4A4A] shadow-sm ring-1 ring-[#E4E2DB]">
            <BriefcaseBusiness size={20} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-cormorant text-lg font-bold text-[#0A4A4A]">
              Are you an insurance advisor?
            </h3>
            <p className="mt-1 font-poppins text-sm leading-relaxed text-[#6B7280]">
              Build a verified YVITY profile, showcase your credentials, and let clients find you by city and service.
            </p>
            <Link
              href="/dashboard/my-space?setup=profile"
              className="mt-3 inline-flex items-center gap-1.5 font-poppins text-sm font-semibold text-[#0A4A4A] transition hover:text-[#F59E0B]"
            >
              Start your advisor workspace
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── First-time advisor orientation ────────────────────────── */

const SETUP_STEPS = [
  {
    icon: UserRound,
    label: "Add your services",
    detail: "List the insurance and investment services you offer.",
  },
  {
    icon: ShieldCheck,
    label: "Upload IRDAI certificate",
    detail: "We verify your license — usually within 24–48 hours.",
  },
  {
    icon: Sparkles,
    label: "Go live on YVITY",
    detail: "Your public profile, YVITY Score, and sharing link activate.",
  },
];

function AdvisorOrientationView({ user, onBeginSetup }) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-3 py-8 sm:px-4 sm:py-12">
      {/* Welcome header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A4A4A] to-[#0D6060] shadow-[0_8px_24px_rgba(10,74,74,0.25)]">
          <BriefcaseBusiness size={28} className="text-[#F59E0B]" strokeWidth={1.75} />
        </div>
        <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
          Welcome to My Space
        </h1>
        <p className="mx-auto mt-3 max-w-sm font-poppins text-sm leading-relaxed text-[#6B7280] sm:text-base">
          This is your YVITY advisor workspace — your verified profile, YVITY Score, client
          testimonials, and sharing tools, all in one place.
        </p>
        {user?.name ? (
          <p className="mt-2 font-poppins text-sm font-semibold text-[#0A4A4A]">
            Let&apos;s set it up for you, {user.name.split(" ")[0]}.
          </p>
        ) : null}
      </div>

      {/* 3-step preview */}
      <div className="mb-8 rounded-[24px] border border-[#E4E2DB]/80 bg-white p-5 shadow-[0_4px_24px_rgba(10,74,74,0.07)] sm:p-6">
        <p className="mb-4 font-poppins text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
          3 quick steps
        </p>
        <div className="space-y-0">
          {SETUP_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === SETUP_STEPS.length - 1;
            return (
              <div key={step.label} className="relative flex gap-4">
                {/* Connector line */}
                {!isLast ? (
                  <div className="absolute left-[19px] top-10 h-[calc(100%-8px)] w-px bg-[#E4E2DB]" aria-hidden />
                ) : null}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F4F4] text-[#0A4A4A] ring-2 ring-white">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div className={`min-w-0 flex-1 ${!isLast ? "pb-5" : ""}`}>
                  <p className="font-poppins text-sm font-semibold text-[#0A4A4A]">
                    {step.label}
                  </p>
                  <p className="mt-0.5 font-poppins text-xs leading-snug text-[#6B7280]">
                    {step.detail}
                  </p>
                </div>
                <CircleDashed size={16} className="mt-2.5 shrink-0 text-[#D1D5DB]" aria-hidden />
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBeginSetup}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-6 py-3 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_6px_20px_rgba(10,74,74,0.30)] transition hover:opacity-90 active:scale-[0.98]"
      >
        Begin My Space Setup
        <ArrowRight size={16} />
      </button>
      <p className="mt-3 text-center font-poppins text-xs text-[#9CA3AF]">
        Takes about 5 minutes — you can save and continue later.
      </p>
    </div>
  );
}

/* ─── Post-submit transition screen ─────────────────────────── */

function PostSubmitTransition({ isPaidPlan, onContinue, user }) {
  if (isPaidPlan) {
    return (
      <div className="mx-auto w-full max-w-[680px] px-3 py-10 sm:px-4 sm:py-16">
        <div className="rounded-[28px] border border-[#E4E2DB]/80 bg-white p-7 shadow-[0_8px_40px_rgba(10,74,74,0.10)] sm:p-10">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200">
            <Clock size={30} className="text-amber-600" strokeWidth={1.75} />
          </div>
          <p className="font-poppins text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">
            Profile submitted
          </p>
          <h1 className="mt-2 font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
            Under review — we&apos;ll verify within 24–48 hours
          </h1>
          <p className="mt-3 font-poppins text-sm leading-relaxed text-[#6B7280]">
            Our team is reviewing your IRDAI license. While you wait, build out your profile — profile strength counts toward your YVITY Score immediately.
          </p>
          <ul className="mt-5 space-y-2.5">
            {[
              "Add your professional journey and work history",
              "Upload achievements, awards & certifications",
              "Add client testimonials to build instant trust",
              "Upload gallery photos from events or client moments",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 font-poppins text-sm text-[#374151]">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#0A4A4A]" strokeWidth={2} />
                {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onContinue}
            className="mt-8 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-6 py-3 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_6px_20px_rgba(10,74,74,0.25)] transition hover:opacity-90 active:scale-[0.98]"
          >
            Start building my profile
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Free plan — you're live!
  return (
    <div className="mx-auto w-full max-w-[680px] px-3 py-10 sm:px-4 sm:py-16">
      <div className="rounded-[28px] border border-[#E4E2DB]/80 bg-white p-7 shadow-[0_8px_40px_rgba(10,74,74,0.10)] sm:p-10">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F4F4] ring-1 ring-[#0A4A4A]/20">
          <Sparkles size={30} className="text-[#F59E0B]" strokeWidth={1.75} />
        </div>
        <p className="font-poppins text-[11px] font-bold uppercase tracking-[0.18em] text-[#0A4A4A]">
          You&apos;re live on YVITY
        </p>
        <h1 className="mt-2 font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
          Your advisor profile is active{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-3 font-poppins text-sm leading-relaxed text-[#6B7280]">
          Clients can now find and contact you on YVITY. Complete your workspace to build more credibility and improve your YVITY Score.
        </p>
        <ul className="mt-5 space-y-2.5">
          {[
            "Add your professional journey to show real career depth",
            "Upload achievements and awards to build instant trust",
            "Collect client testimonials — social proof matters",
            "Share your public profile link with existing clients",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 font-poppins text-sm text-[#374151]">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#0A4A4A]" strokeWidth={2} />
              {item}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onContinue}
          className="mt-8 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-6 py-3 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_6px_20px_rgba(10,74,74,0.25)] transition hover:opacity-90 active:scale-[0.98]"
        >
          Go to My Space
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export default function DashboardMySpace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, advisor, loading } = useAuth();
  const setup = useAdvisorWorkspaceSetup();
  const [setupProfileOpen, setSetupProfileOpen] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const { setupState } = setup;
  const { isUnderReview, showSetupWorkspace, irdaiPendingAdminReview, isIrdaiRejected, rejectedReason } = setupState;

  const showGoldWorkspace = shouldShowGoldAdvisorWorkspace(user, advisor);
  const isAdvisor = isAdvisorRole(user);

  // First-time advisor: has role but no advisor profile record yet
  const isFirstTimeAdvisor = showGoldWorkspace && showSetupWorkspace && !setupState.hasAdvisorProfile;

  useEffect(() => {
    const intent = searchParams.get("setup");
    if (!intent) return;

    if (intent === "submitted") {
      router.replace("/dashboard/my-space", { scroll: false });
      void setup.refreshAuthState().then(() => setShowTransition(true));
      return;
    }

    if (intent === "profile" || intent === "workspace") {
      // First-timers: clear URL, let the orientation view take over
      // Returning advisors (incomplete or rejected): open the modal directly
      if (!isFirstTimeAdvisor && (showSetupWorkspace || isIrdaiRejected)) {
        setSetupProfileOpen(true);
      }
      router.replace("/dashboard/my-space", { scroll: false });
    }
  }, [searchParams, showSetupWorkspace, isFirstTimeAdvisor, setup.refreshAuthState, router]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] animate-pulse px-3 py-5 sm:px-4">
        <div className="mb-6 h-10 w-56 rounded-lg bg-[#E4E2DB]" />
        <div className="h-32 rounded-[28px] bg-[#E4E2DB]" />
      </div>
    );
  }

  const openSetupProfile = async () => {
    try {
      const res = await fetch("/api/auth/advisor-intent", { method: "POST" });
      if (res.ok) await setup.refreshAuthState();
    } catch {
      // modal can still open
    }
    setSetupProfileOpen(true);
  };

  const handleSetupComplete = async () => {
    setSetupProfileOpen(false);
    await setup.refreshAuthState();
  };

  /* ── Post-submit transition ── */
  if (showTransition) {
    return (
      <PostSubmitTransition
        isPaidPlan={irdaiPendingAdminReview}
        onContinue={() => setShowTransition(false)}
        user={user}
      />
    );
  }

  /* ── Customer path ── */
  if (!isAdvisor && !showGoldWorkspace) {
    return <CustomerMySpace user={user} />;
  }

  /* ── First-time advisor: show orientation before the workspace ── */
  if (isFirstTimeAdvisor) {
    return (
      <>
        <SetupMyProfileModal
          isOpen={setupProfileOpen}
          onClose={() => setSetupProfileOpen(false)}
          onComplete={handleSetupComplete}
        />
        <AdvisorOrientationView user={user} onBeginSetup={openSetupProfile} />
      </>
    );
  }

  /* ── Advisor with existing profile (setup incomplete, under review, or active) ── */
  return (
    <>
      <SetupMyProfileModal
        isOpen={setupProfileOpen}
        onClose={() => setSetupProfileOpen(false)}
        onComplete={handleSetupComplete}
      />

      {isIrdaiRejected ? (
        <MySpaceSetupBanner variant="rejected" rejectedReason={rejectedReason} onSetup={openSetupProfile} />
      ) : showSetupWorkspace ? (
        <MySpaceSetupBanner variant="setup" onSetup={openSetupProfile} />
      ) : irdaiPendingAdminReview ? (
        <MySpaceSetupBanner variant="review" />
      ) : null}

      <YvityGoldMySpaceDashboard reviewMode={isUnderReview} />
    </>
  );
}

"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getTimeOfDayGreeting, getUserFirstName } from "@/lib/dashboard/greeting";
import { isAdvisorRole } from "@/lib/dashboard/welcomeBanner";

export default function DashboardWelcomeBanner({
  user,
  workspaceNeedsSetup = false,
  workspaceSetupHref = "/dashboard/my-space?setup=profile",
}) {
  const greeting = getTimeOfDayGreeting();
  const firstName = getUserFirstName(user?.name);
  const isAdvisor = isAdvisorRole(user);
  const city = String(user?.city || "").trim();

  /* Subtitle — role-aware, specific */
  let subtitle;
  if (workspaceNeedsSetup) {
    subtitle = "Complete your YVITY workspace so clients can discover and trust you.";
  } else if (city) {
    subtitle = `Discover trusted, identity-verified advisors near ${city} on YVITY.`;
  } else {
    subtitle = "Search trusted, identity-verified advisors on YVITY.";
  }

  /* Only show CTA when advisor still needs to complete setup */
  const showSetupCta = isAdvisor && workspaceNeedsSetup;

  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl border border-[#E4E2DB]/90 bg-gradient-to-br from-white via-[#F8F6F1] to-[#E8F4F4]/50 px-5 py-5 shadow-[0_4px_24px_rgba(10,74,74,0.07)] sm:rounded-[24px] sm:px-7 sm:py-6"
      aria-label="Welcome"
    >
      <p className="font-poppins text-sm text-[#6B7280] sm:text-base">
        {greeting}, {firstName} 👋
      </p>
      <h1 className="mt-2 font-cormorant text-[1.75rem] font-bold leading-tight text-[#0A4A4A] sm:text-[2.1rem]">
        Welcome to YVITY
      </h1>
      <p className="mt-2 max-w-2xl font-poppins text-sm leading-relaxed text-[#4B5563] sm:text-[15px]">
        {subtitle}
      </p>

      {showSetupCta ? (
        <Link
          href={workspaceSetupHref}
          className="mt-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-5 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.22)] transition hover:opacity-90 active:scale-[0.98]"
        >
          Complete My Space
          <ChevronRight size={16} aria-hidden />
        </Link>
      ) : null}
    </section>
  );
}

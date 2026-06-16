"use client";

import { isAdvisorRole } from "@/lib/dashboard/welcomeBanner";

export function looksLikeAdvisorProfession() {
  return false; // kept for external callers — logic moved to isAdvisorRole
}

function GuidanceCard({ title, description, buttonLabel, onClick, primary = false }) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border p-5 shadow-[0_2px_14px_rgba(10,74,74,0.06)] sm:rounded-[24px] sm:p-6 ${
        primary
          ? "border-[#0A4A4A]/20 bg-gradient-to-br from-[#0A4A4A] to-[#0D6060] text-white"
          : "border-[#E4E2DB] bg-white"
      }`}
    >
      <h2
        className={`font-cormorant text-xl font-bold leading-tight sm:text-2xl ${
          primary ? "text-white" : "text-[#0A4A4A]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-2 flex-1 font-poppins text-sm leading-relaxed sm:text-[15px] ${
          primary ? "text-white/80" : "text-[#6B7280]"
        }`}
      >
        {description}
      </p>
      <button
        type="button"
        onClick={onClick}
        className={`mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-5 py-3 font-poppins text-sm font-semibold transition active:scale-[0.98] ${
          primary
            ? "bg-[#F59E0B] text-[#0A4A4A] hover:bg-[#FBBF24]"
            : "border-2 border-[#0A4A4A] bg-white text-[#0A4A4A] hover:bg-[#F8F6F1]"
        }`}
      >
        {buttonLabel}
      </button>
    </article>
  );
}

export default function DashboardOnboardingGuidance({
  user,
  onStartSearching,
  onGoToMySpace,
}) {
  const advisorFirst = isAdvisorRole(user);

  const findCard = (
    <GuidanceCard
      key="find"
      primary={!advisorFirst}
      title="Find a Verified Advisor"
      description="Looking for expert guidance on insurance or investments? Search and connect with trusted, identity-verified advisors near you."
      buttonLabel="Start Searching"
      onClick={onStartSearching}
    />
  );

  const offerCard = (
    <GuidanceCard
      key="offer"
      primary={advisorFirst}
      title="Build Your Advisor Profile"
      description="Are you an insurance advisor? Set up your YVITY workspace, get verified, and become discoverable to thousands of clients."
      buttonLabel="Go To My Space"
      onClick={onGoToMySpace}
    />
  );

  const cards = advisorFirst ? [offerCard, findCard] : [findCard, offerCard];

  return (
    <section className="mb-6" aria-label="Getting started on YVITY">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        {cards}
      </div>
    </section>
  );
}

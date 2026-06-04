"use client";

import { ChevronRight } from "lucide-react";
import { MOBILE_LANDING_SECTIONS } from "./mobileLandingSections";
import { useLandingMobileNav } from "./LandingMobileNavContext";
import { LANDING_INNER } from "./landingLayout";

export default function LandingSectionHub() {
  const { openPanel } = useLandingMobileNav();

  return (
    <>
      <div className="landing-hero-hub-bridge lg:hidden" aria-hidden />
      <section
        aria-label="Explore YVITY sections"
        className="bg-[#F8F6F1] pb-8 pt-5 lg:hidden"
      >
      <div className={`${LANDING_INNER} flex flex-col gap-4`}>
        <div>
          <p className="font-poppins text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F59E0B]">
            Explore YVITY
          </p>
          <h2 className="mt-1 font-cormorant text-[22px] font-bold leading-tight text-[#0A4A4A]">
            Choose a section to learn more
          </h2>
          <p className="mt-1 font-poppins text-[13px] leading-relaxed text-[#4B5563]">
            Your home stays here — open any topic below when you are ready.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {MOBILE_LANDING_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => openPanel(section.id)}
                  className="group flex min-h-[72px] w-full items-center gap-3 rounded-2xl border border-[#0A4A4A]/10 bg-white/90 p-3.5 text-left shadow-[0_4px_16px_rgba(10,74,74,0.06)] transition-[transform,box-shadow,border-color] active:scale-[0.99] active:border-[#0A4A4A]/20"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F1EE] text-[#0A4A4A] ring-1 ring-[#0A4A4A]/8">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-poppins text-[14px] font-semibold leading-snug text-[#0A4A4A]">
                      {section.label}
                    </span>
                    <span className="mt-0.5 block font-poppins text-[11px] leading-snug text-[#6B7280]">
                      {section.description}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#F59E0B] transition-transform group-active:translate-x-0.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
    </>
  );
}

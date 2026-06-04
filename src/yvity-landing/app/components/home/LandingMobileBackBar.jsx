"use client";

import { ArrowLeft } from "lucide-react";
import { useLandingMobileNav } from "./LandingMobileNavContext";
import { getMobileSectionMeta } from "./mobileLandingSections";

export default function LandingMobileBackBar({ sectionId }) {
  const { goHome } = useLandingMobileNav();
  const meta = getMobileSectionMeta(sectionId);

  if (!meta) return null;

  return (
    <div className="sticky top-[3.75rem] z-30 border-b border-[#0A4A4A]/10 bg-[#F8F6F1]/95 backdrop-blur-md sm:top-16 lg:hidden">
      <div className="mx-auto flex max-w-384 items-center gap-3 px-4 py-2.5 sm:px-6">
        <button
          type="button"
          onClick={goHome}
          className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-full border border-[#0A4A4A]/12 bg-white px-3 py-2 font-poppins text-[13px] font-semibold text-[#0A4A4A] shadow-sm active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-[#F59E0B]" strokeWidth={2.25} />
          Home
        </button>
        <p className="min-w-0 flex-1 truncate font-poppins text-[14px] font-semibold text-[#0A4A4A]">
          {meta.label}
        </p>
      </div>
    </div>
  );
}

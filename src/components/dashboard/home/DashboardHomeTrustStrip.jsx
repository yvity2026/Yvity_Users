"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";

const TRUST_ITEMS = [
  "Verified profiles",
  "Identity verified",
  "Genuine reviews",
  "Secure platform",
];

export default function DashboardHomeTrustStrip() {
  return (
    <div
      className="home-trust-strip mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[#E4E2DB]/80 bg-white/70 px-4 py-3 shadow-[0_2px_12px_rgba(10,74,74,0.05)] backdrop-blur-sm sm:px-5"
      aria-label="Why trust YVITY"
    >
      <div className="flex items-center gap-2 font-poppins text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0A4A4A]/55">
        <ShieldCheck size={15} className="text-[#F59E0B]" aria-hidden />
        Trusted discovery
      </div>
      <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5">
        {TRUST_ITEMS.map((item) => (
          <li
            key={item}
            className="inline-flex items-center gap-1.5 font-poppins text-xs font-medium text-[#4B5563]"
          >
            <CheckCircle2 size={13} className="shrink-0 text-[#F59E0B]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

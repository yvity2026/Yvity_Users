"use client";

import { ShieldCheck } from "lucide-react";

/**
 * Premium profile header badge — services & credentials reviewed by YVITY.
 */
export function VerifiedServicesBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex h-[28px] shrink-0 items-center gap-1.5 rounded-2xl border border-[#0A4A4A]/15 bg-gradient-to-r from-[#E8F1EE] to-[#F0F8F8] px-2.5 py-1 text-[12px] font-semibold leading-none text-[#0A4A4A] shadow-[0_2px_8px_rgba(10,74,74,0.06)] ${className}`}
      title="Services and credentials reviewed by YVITY"
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#F59E0B]" strokeWidth={2.25} />
      Verified Services
    </span>
  );
}

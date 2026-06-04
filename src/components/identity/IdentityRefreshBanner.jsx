"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getBannerCopy } from "@/lib/identity/messages";

export default function IdentityRefreshBanner({ identityData, className = "" }) {
  if (!identityData) return null;

  const status = identityData.status;
  if (!status || status === "ok" || status === "unknown") return null;

  const copy = getBannerCopy(status);

  return (
    <div
      className={`mb-4 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 sm:px-5 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" />
          <div>
            <p className="font-poppins text-sm font-semibold text-[#92400E]">{copy.title}</p>
            <p className="mt-1 font-poppins text-xs leading-relaxed text-[#78350F] sm:text-sm">
              {copy.body}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/identity-refresh"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0A4A4A] px-4 py-2 font-poppins text-xs font-bold text-[#F59E0B] sm:text-sm"
        >
          Refresh now
        </Link>
      </div>
    </div>
  );
}

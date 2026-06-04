"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export default function DashboardHomeEmptyState({
  message = "No advisors match yet. Try adjusting your search or explore all professionals.",
  actionLabel = "Explore all advisors",
  actionHref = "/dashboard/explore",
}) {
  return (
    <div className="home-empty-state rounded-[24px] border border-dashed border-[#E4E2DB] bg-gradient-to-br from-white via-[#F8F6F1] to-[#E8F4F4]/60 px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_4px_16px_rgba(10,74,74,0.08)] ring-1 ring-[#0A4A4A]/8">
        <Compass className="h-7 w-7 text-[#F59E0B]" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="mx-auto max-w-md font-poppins text-sm leading-relaxed text-[#6B7280]">
        {message}
      </p>
      <Link
        href={actionHref}
        className="mt-5 inline-flex rounded-full bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-6 py-2.5 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.22)] transition active:scale-[0.98]"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

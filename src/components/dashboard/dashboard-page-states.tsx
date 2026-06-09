"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Ivory-themed loading block for user dashboard pages. */
export function DashboardPageLoading({
  className,
  label = "Loading…",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1200px] px-3 py-8 sm:px-4", className)}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div className="space-y-3 animate-pulse">
        <div className="h-10 w-48 rounded-xl bg-[#E4E2DB]" />
        <div className="h-48 rounded-[28px] bg-[#E4E2DB]" />
        <div className="h-32 rounded-[24px] bg-[#E4E2DB]/80" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Ivory-themed empty state for user dashboard pages. */
export function DashboardPageEmpty({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#E4E2DB] bg-white px-6 py-12 text-center shadow-sm",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F6F1] text-[#0A4A4A]">
          <Icon className="size-6" aria-hidden />
        </div>
      ) : null}
      <h2 className="font-cormorant text-2xl font-bold text-[#0A4A4A]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm font-poppins text-sm text-[#6B7280]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

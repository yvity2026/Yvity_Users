"use client";

export default function DashboardHomeSectionSkeleton({ rows = 2 }) {
  return (
    <div className="mb-10 animate-pulse" aria-hidden>
      <div className="mb-4 h-7 w-48 rounded-lg bg-[#E4E2DB]" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-[280px] w-[min(340px,88vw)] shrink-0 rounded-[24px] bg-[#E4E2DB]/80"
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardHomeStickySearch({
  visible = false,
  searchQuery = "",
  onSearchQueryChange,
  onSubmitSearch,
  onOpenFilters,
}) {
  return (
    <div
      className={cn(
        "home-sticky-search fixed inset-x-0 top-0 z-[120] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] lg:hidden",
        "transition-all duration-200 ease-out motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "-translate-y-full opacity-0 pointer-events-none",
      )}
      role="search"
      aria-label="Quick search"
      aria-hidden={!visible}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitSearch?.();
        }}
        className="home-sticky-search-inner mx-auto flex max-w-[1200px] items-stretch gap-2 rounded-2xl border border-[#E4E2DB]/90 bg-[#F8F6F1]/95 p-2 shadow-[0_8px_28px_rgba(10,74,74,0.14)] backdrop-blur-xl"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white/90 px-3">
          <Search size={18} className="shrink-0 text-[#0A4A4A]/70" aria-hidden />
          <input
            type="search"
            enterKeyHint="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange?.(event.target.value)}
            placeholder="Search advisors..."
            className="min-w-0 flex-1 bg-transparent font-poppins text-sm text-[#0A4A4A] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E4E2DB] bg-white text-[#0A4A4A] transition active:scale-95"
          aria-label="Open filters"
        >
          <SlidersHorizontal size={18} aria-hidden />
        </button>
      </form>
    </div>
  );
}

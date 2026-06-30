"use client";

import { ChevronDown, MessageCircle, Pencil, Shield } from "lucide-react";
import { testimonialTypeFilters } from "@/lib/sections/testimonials-config";
import type { TestimonialServiceFilterOption } from "@/lib/sections/testimonial-service-options";
import type { TestimonialItem, TestimonialService, TestimonialType } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export type TestimonialTypeFilter = TestimonialType | "all";
export type TestimonialServiceFilter = TestimonialService | "all";

export function TestimonialsFilters({
  typeFilter,
  serviceFilter,
  onTypeChange,
  onServiceChange,
  items,
  serviceOptions,
  showGiveTestimonial = true,
  showRequestTestimonial = false,
  onGiveTestimonial,
  onRequestTestimonial,
}: {
  typeFilter: TestimonialTypeFilter;
  serviceFilter: TestimonialServiceFilter;
  onTypeChange: (v: TestimonialTypeFilter) => void;
  onServiceChange: (v: TestimonialServiceFilter) => void;
  items: TestimonialItem[];
  serviceOptions: TestimonialServiceFilterOption[];
  showGiveTestimonial?: boolean;
  showRequestTestimonial?: boolean;
  onGiveTestimonial?: () => void;
  onRequestTestimonial?: () => void;
}) {
  const typeCounts: Record<TestimonialTypeFilter, number> = {
    all: items.length,
    text: items.filter((i) => i.type === "text").length,
    audio: items.filter((i) => i.type === "audio").length,
    video: items.filter((i) => i.type === "video").length,
  };

  return (
    <div className="glass-strong rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden mb-6 sm:mb-8">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between border-b border-white/10">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Filter by Type
          </p>
          <div className="flex flex-wrap gap-2">
            {testimonialTypeFilters.filter((f) => f.id === "all" || typeFilter === f.id || typeCounts[f.id] > 0).map((f) => {
              const Icon = f.icon;
              const active = typeFilter === f.id;
              const count = f.id !== "all" ? typeCounts[f.id] : undefined;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onTypeChange(f.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs sm:text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                      : "glass border-white/12 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5 sm:size-4" />
                  {f.label}
                  {count !== undefined && <span className="opacity-60">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {showRequestTestimonial && onRequestTestimonial && (
          <button
            type="button"
            onClick={onRequestTestimonial}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.52_0.14_155)] to-[oklch(0.42_0.11_160)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[oklch(0.52_0.14_155/0.35)] hover:opacity-95 active:scale-[0.98] transition"
          >
            <MessageCircle className="size-4" />
            Request Testimonial
          </button>
        )}

        {showGiveTestimonial && onGiveTestimonial && (
          <button
            type="button"
            onClick={onGiveTestimonial}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[oklch(0.38_0.09_185)] px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-95 active:scale-[0.98] transition"
          >
            <Pencil className="size-4" />
            Give Testimonial
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 sm:p-5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
          Filter by Service
        </p>
        <div className="relative flex-1 max-w-xs">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[oklch(0.82_0.13_205)] pointer-events-none" />
          <select
            value={serviceFilter}
            onChange={(e) => onServiceChange(e.target.value as TestimonialServiceFilter)}
            className={cn(
              "w-full appearance-none rounded-full border border-white/12 bg-white/[0.04] py-2.5 pl-10 pr-10 text-sm",
              "text-foreground focus:outline-none focus:ring-1 focus:ring-[oklch(0.82_0.13_205/0.5)]",
            )}
          >
            {serviceOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[oklch(0.18_0.035_235)]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
        <p className="text-xs text-muted-foreground sm:ml-auto">
          Showing{" "}
          <span className="text-foreground font-medium">
            {typeFilter === "all" ? "all types" : typeFilter}
          </span>
          {serviceFilter !== "all" && (
            <>
              {" "}
              ·{" "}
              <span className="text-foreground font-medium">
                {serviceOptions.find((o) => o.value === serviceFilter)?.label}
              </span>
            </>
          )}
          <span className="text-muted-foreground"> ({typeCounts[typeFilter]} reviews)</span>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Award, MessageSquareQuote } from "lucide-react";
import { AchievementDetailCard } from "@/components/sections/achievement-detail-card";
import { TestimonialDetailCard } from "@/components/sections/testimonial-detail-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAchievementsData, useTestimonialsData } from "@/lib/sections/stores";
import { cn } from "@/lib/utils";

function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold self-start",
        "text-[oklch(0.82_0.13_205)] transition hover:text-[oklch(0.85_0.16_78)]",
        // Keyboard focus needs a visible ring — previously the link only
        // had a colour-shift on hover which was invisible to keyboard
        // users.
        "rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.82_0.13_205/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {label}
      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export function LatestHighlightsSection() {
  const [achievements, , achievementsLoading] = useAchievementsData();
  const [testimonials, , testimonialsLoading] = useTestimonialsData();

  const latestAchievement = useMemo(
    () => (achievements.length > 0 ? achievements[achievements.length - 1] : null),
    [achievements],
  );

  const latestTestimonial = useMemo(
    () => (testimonials.length > 0 ? testimonials[0] : null),
    [testimonials],
  );

  const loading = achievementsLoading || testimonialsLoading;

  if (loading) return null;

  if (!latestAchievement && !latestTestimonial) return null;

  return (
    <section className="w-full" aria-labelledby="latest-highlights-heading">
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Proof of excellence
      </p>
      <h2
        id="latest-highlights-heading"
        className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.08]"
      >
        <span className="text-gradient-brand">Latest Highlights</span>
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
        A snapshot of recent recognition and client feedback — explore the full showcases for more.
      </p>

      <div
        className={cn(
          "mt-5 sm:mt-6 grid gap-5 sm:gap-6",
          latestAchievement && latestTestimonial ? "md:grid-cols-2" : "max-w-xl",
        )}
      >
        <div className="flex min-w-0 flex-col gap-4">
          {latestAchievement ? (
            <AchievementDetailCard item={latestAchievement} />
          ) : (
            <EmptyState
              icon={Award}
              title="No achievements yet"
              description="As soon as the advisor adds awards or milestones, they will surface here."
              size="sm"
              className="min-h-[280px] flex flex-col items-center justify-center"
            />
          )}
          <ViewAllLink href="/achievements" label="View All Achievements" />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {latestTestimonial ? (
            <TestimonialDetailCard item={latestTestimonial} index={0} />
          ) : (
            <EmptyState
              icon={MessageSquareQuote}
              title="No testimonials yet"
              description="Client feedback will appear here once visitors submit verified testimonials."
              size="sm"
              className="min-h-[280px] flex flex-col items-center justify-center"
            />
          )}
          <ViewAllLink href="/testimonials" label="View All Testimonials" />
        </div>
      </div>
    </section>
  );
}

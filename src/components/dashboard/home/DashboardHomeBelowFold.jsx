"use client";

import Link from "next/link";
import {
  Award,
  ChevronRight,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
} from "lucide-react";
import AdvisorCardWithSave from "@/components/advisor/AdvisorCardWithSave";
import {
  getFeaturedAdvisors,
  getRecommendedAdvisors,
  getTopRatedAdvisors,
} from "@/lib/dashboard/homeAdvisors";
import DashboardHomeEmptyState from "@/components/dashboard/home/DashboardHomeEmptyState";
import DashboardHomeSectionSkeleton from "@/components/dashboard/home/DashboardHomeSectionSkeleton";

function SectionHeader({ title, subtitle, seeAllHref }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-cormorant text-2xl font-bold text-[#0A4A4A] sm:text-[1.65rem]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 font-poppins text-sm text-[#6B7280]">{subtitle}</p>
        ) : null}
      </div>
      {seeAllHref ? (
        <Link
          href={seeAllHref}
          className="inline-flex shrink-0 items-center gap-0.5 font-poppins text-sm font-semibold text-[#0A4A4A] transition hover:text-[#F59E0B]"
        >
          See all
          <ChevronRight size={18} strokeWidth={2.25} />
        </Link>
      ) : null}
    </div>
  );
}

function SwipeHint() {
  return (
    <p className="home-swipe-hint mb-3 flex items-center gap-2 font-poppins text-[11px] font-medium text-[#9CA3AF]">
      <span className="inline-flex gap-0.5" aria-hidden>
        <span className="home-swipe-hint-dot" />
        <span className="home-swipe-hint-dot home-swipe-hint-dot--delay" />
        <span className="home-swipe-hint-dot home-swipe-hint-dot--delay-2" />
      </span>
      Swipe for more
    </p>
  );
}

function AdvisorScrollRow({
  advisors,
  emptyMessage,
  keyPrefix = "",
  showSwipeHint = false,
  useUnifiedEmpty = false,
}) {
  if (!advisors.length) {
    if (useUnifiedEmpty) {
      return (
        <DashboardHomeEmptyState
          message={emptyMessage}
          actionHref="/dashboard/explore"
        />
      );
    }

    return (
      <div className="rounded-2xl border border-[#E4E2DB] bg-white px-6 py-12 text-center font-poppins text-sm text-[#6B7280]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {showSwipeHint && advisors.length > 1 ? <SwipeHint /> : null}
      <div className="home-discovery-chips-track no-scrollbar -mx-3 flex gap-4 overflow-x-auto px-3 pb-2 snap-x snap-mandatory sm:-mx-0 sm:px-0">
        {advisors.map((advisor) => (
          <div
            key={`${keyPrefix}${advisor.id}`}
            className="w-[min(290px,78vw)] shrink-0 snap-start sm:w-[300px]"
          >
            <AdvisorCardWithSave advisor={advisor} variant="compact" />
          </div>
        ))}
      </div>
    </>
  );
}

function AvatarStack({ advisors, max = 4 }) {
  const visible = advisors.slice(0, max);

  if (!visible.length) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 ring-2 ring-white">
        <Star className="h-5 w-5 text-[#0A4A4A]/40" />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {visible.map((advisor, index) => {
        const initials = (advisor.name || "A")
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <div
            key={advisor.id}
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white"
            style={{ marginLeft: index === 0 ? 0 : -12, zIndex: max - index }}
          >
            {advisor.avatarUrl ? (
              <img
                src={advisor.avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0A4A4A] font-poppins text-xs font-bold text-[#F59E0B]">
                {initials}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReviewStars({ rating = 5 }) {
  return (
    <div className="flex items-center gap-0.5 text-[#F59E0B]" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          fill={index < rating ? "currentColor" : "none"}
          className={index < rating ? "" : "text-[#D1D5DB]"}
        />
      ))}
    </div>
  );
}

export function DashboardHomeFeatured({ advisors, loading = false }) {
  const featured = getFeaturedAdvisors(advisors);

  if (loading && !advisors.length) {
    return <DashboardHomeSectionSkeleton rows={2} />;
  }

  return (
    <section className="mb-10" aria-labelledby="home-featured-heading">
      <SectionHeader
        title="Featured Advisors"
        subtitle="Hand-picked professionals on YVITY"
        seeAllHref="/dashboard/explore"
      />
      <AdvisorScrollRow
        advisors={featured}
        keyPrefix="featured-"
        showSwipeHint
        useUnifiedEmpty
        emptyMessage="Featured advisors will appear here as professionals join YVITY."
      />
    </section>
  );
}

export function DashboardHomeTopRated({ advisors, loading = false }) {
  const topRated = getTopRatedAdvisors(advisors, 6);
  const spotlight = topRated[0];

  if (loading && !advisors.length) {
    return <DashboardHomeSectionSkeleton rows={1} />;
  }

  return (
    <section className="mb-10" aria-labelledby="home-top-rated-heading">
      <SectionHeader
        title="Top Rated Advisors"
        seeAllHref="/dashboard/explore?sort=rating"
      />

      <Link
        href="/dashboard/explore?sort=rating"
        className="group block overflow-hidden rounded-[24px] border border-[#E4E2DB]/80 bg-gradient-to-br from-[#E8F4F4] via-[#F8F6F1] to-[#F5EDE0] p-5 shadow-[0_4px_24px_rgba(10,74,74,0.08)] transition hover:shadow-[0_8px_32px_rgba(10,74,74,0.12)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-poppins text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0A4A4A]/55">
              Customer favourites
            </p>
            <h3
              id="home-top-rated-heading"
              className="mt-1 font-cormorant text-xl font-bold text-[#0A4A4A] sm:text-2xl"
            >
              Highly rated by customers
            </h3>
            <p className="mt-2 max-w-sm font-poppins text-sm leading-relaxed text-[#6B7280]">
              Discover advisors with the strongest ratings and verified profiles
              on YVITY.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <AvatarStack advisors={topRated} max={4} />
              {topRated.length > 4 ? (
                <span className="font-poppins text-xs font-semibold text-[#0A4A4A]/70">
                  +{topRated.length - 4} more
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 shadow-[0_4px_16px_rgba(10,74,74,0.1)] ring-1 ring-[#0A4A4A]/8 transition group-hover:scale-105">
            <Award className="h-7 w-7 text-[#F59E0B]" strokeWidth={1.75} />
          </div>
        </div>
      </Link>

      {spotlight ? (
        <div className="mt-4 max-w-[300px]">
          <AdvisorCardWithSave advisor={spotlight} variant="compact" />
        </div>
      ) : (
        <div className="mt-4">
          <DashboardHomeEmptyState
            message="Top rated advisors will appear as members leave reviews."
            actionHref="/dashboard/explore?sort=rating"
            actionLabel="Browse advisors"
          />
        </div>
      )}
    </section>
  );
}

export function DashboardHomeRecentReviews({ reviews, reviewsLoaded }) {
  return (
    <section className="mb-10" aria-labelledby="home-reviews-heading">
      <SectionHeader
        title="Recent Reviews"
        subtitle="See what customers say"
        seeAllHref="/dashboard/explore"
      />

      <div className="mb-4 flex items-center justify-between gap-4 overflow-hidden rounded-[24px] border border-[#E4E2DB]/80 bg-gradient-to-br from-[#ECFDF5] via-[#F8F6F1] to-[#E8F4F4] p-5 shadow-[0_4px_24px_rgba(10,74,74,0.06)] sm:p-6">
        <div className="min-w-0">
          <h3
            id="home-reviews-heading"
            className="font-cormorant text-xl font-bold text-[#0A4A4A] sm:text-2xl"
          >
            Genuine feedback
          </h3>
          <p className="mt-1 font-poppins text-sm text-[#6B7280]">
            Real reviews linked to verified advisor profiles
          </p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-[#0A4A4A]/8">
          <MessageCircle className="h-7 w-7 text-[#0A4A4A]" strokeWidth={1.75} />
        </div>
      </div>

      {!reviewsLoaded ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-2xl bg-[#E4E2DB]/80"
              aria-hidden
            />
          ))}
        </div>
      ) : reviews.length ? (
        <div className="no-scrollbar -mx-3 flex gap-4 overflow-x-auto px-3 pb-1 snap-x snap-mandatory sm:-mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {reviews.map((review, index) => {
            const reviewerInitials = (review.reviewerName || "C")
              .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            const avatarColors = [
              "from-[#0A4A4A] to-[#0D6060]",
              "from-[#1a5c5c] to-[#0f7a7a]",
              "from-[#083838] to-[#0a5050]",
            ];
            const avatarColor = avatarColors[index % avatarColors.length];

            const card = (
              <article className="flex h-full flex-col rounded-2xl border border-[#E4E2DB]/70 bg-white p-5 shadow-[0_2px_16px_rgba(10,74,74,0.06)] transition-all duration-300 hover:border-[#0A4A4A]/20 hover:shadow-[0_8px_28px_rgba(10,74,74,0.12)] hover:-translate-y-0.5">
                {/* Header: avatar + stars */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${avatarColor} font-poppins text-xs font-bold text-[#F59E0B] shadow-sm`}>
                    {reviewerInitials}
                  </div>
                  <ReviewStars rating={Math.max(1, Math.round(Number(review.rating || 5)))} />
                </div>

                {/* Review text */}
                <p className="mb-4 line-clamp-4 flex-1 font-poppins text-sm leading-relaxed text-[#374151]">
                  <span className="mr-0.5 font-cormorant text-xl font-bold text-[#F59E0B] leading-none">&ldquo;</span>
                  {review.text}
                  <span className="ml-0.5 font-cormorant text-xl font-bold text-[#F59E0B] leading-none">&rdquo;</span>
                </p>

                {/* Reviewer name */}
                <p className="font-poppins text-xs font-semibold text-[#374151]">
                  {review.reviewerName || "YVITY member"}
                </p>

                {/* Divider + advisor info */}
                <div className="mt-3 border-t border-[#E4E2DB]/80 pt-3">
                  <p className="font-poppins text-[11px] text-[#6B7280]">Reviewed</p>
                  <p className="mt-0.5 font-poppins text-xs font-semibold text-[#0A4A4A]">
                    {review.advisorName}
                  </p>
                  <p className="font-poppins text-[11px] text-[#6B7280]">{review.advisorTitle}</p>
                  {review.advisorCity ? (
                    <p className="mt-1 inline-flex items-center gap-1 font-poppins text-[10px] text-[#9CA3AF]">
                      <MapPin size={10} aria-hidden />
                      {review.advisorCity}
                    </p>
                  ) : null}
                </div>
              </article>
            );

            if (review.profileUrl) {
              return (
                <Link
                  key={review.id}
                  href={review.profileUrl}
                  className="w-[min(300px,88vw)] shrink-0 snap-start sm:w-auto"
                >
                  {card}
                </Link>
              );
            }

            return (
              <div
                key={review.id}
                className="w-[min(300px,88vw)] shrink-0 snap-start sm:w-auto"
              >
                {card}
              </div>
            );
          })}
        </div>
      ) : (
        <DashboardHomeEmptyState
          message="Recent reviews will appear here as members share feedback."
          actionHref="/dashboard/explore"
          actionLabel="Find advisors"
        />
      )}
    </section>
  );
}

export function DashboardHomeRecommended({
  advisors,
  userCity = "",
  activeService = "",
  recentService = "",
  loading = false,
}) {
  const recommended = getRecommendedAdvisors(advisors, {
    userCity,
    activeService,
    recentService,
  });

  if (loading && !advisors.length) {
    return <DashboardHomeSectionSkeleton rows={2} />;
  }

  return (
    <section className="mb-10" aria-labelledby="home-recommended-heading">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#F59E0B]" aria-hidden />
            <h2
              id="home-recommended-heading"
              className="font-cormorant text-2xl font-bold text-[#0A4A4A] sm:text-[1.65rem]"
            >
              Recommended For You
            </h2>
          </div>
          <p className="font-poppins text-sm text-[#6B7280]">
            {userCity
              ? `Tailored near ${userCity}${activeService ? ` · ${activeService}` : ""}`
              : "Based on your interests"}
          </p>
        </div>
        <Link
          href="/dashboard/explore"
          className="inline-flex shrink-0 items-center gap-0.5 font-poppins text-sm font-semibold text-[#0A4A4A] transition hover:text-[#F59E0B]"
        >
          See all
          <ChevronRight size={18} strokeWidth={2.25} />
        </Link>
      </div>

      <AdvisorScrollRow
        advisors={recommended}
        keyPrefix="recommended-"
        useUnifiedEmpty
        emptyMessage="Personalized recommendations will appear as you explore YVITY."
      />
    </section>
  );
}

export function DashboardHomeTrustFooter() {
  const points = [
    "Verified Profiles",
    "Identity Verified",
    "Genuine Reviews",
    "Secure Platform",
  ];

  return (
    <section className="yvity-on-dark rounded-[24px] border border-[#E4E2DB]/90 bg-gradient-to-br from-[#0A4A4A] via-[#0D4D4D] to-[#083838] px-5 py-6 text-white sm:px-7 sm:py-7">
      <h2 className="font-cormorant text-xl font-bold text-white sm:text-2xl">
        Why Trust YVITY
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        {points.map((point) => (
          <li
            key={point}
            className="rounded-xl bg-white/8 px-3 py-2.5 font-poppins text-xs sm:text-sm"
          >
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}

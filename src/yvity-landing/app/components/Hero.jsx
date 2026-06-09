"use client";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";
import { AdvisorCardGold } from "./home-features/advisor-card-gold";
import { toAdvisorCardGoldProps } from "@/yvity-landing/lib/advisor/cardGoldProps";
import { openRegistrationModal } from "@/yvity-landing/lib/ui/openRegistrationModal";
import AnimatedCounter from "@/yvity-landing/components/ui/AnimatedCounter";
import { LANDING_INNER, LANDING_SECTION_ANCHOR } from "@/yvity-landing/app/components/home/landingLayout";
import { usePrefersReducedMotion } from "@/yvity-landing/hooks/usePrefersReducedMotion";
import { useLandingMobileNavOptional } from "@/yvity-landing/app/components/home/LandingMobileNavContext";
import { scrollToSection } from "@/yvity-landing/lib/landing/scrollToSection";
import { usePathname, useRouter } from "next/navigation";

const HERO_PREVIEW_ADVISOR = {
  name: "Krishna Mohan Noti",
  title: "Chief Life Planner",
  location: "Guntur, Telangana",
  score: 40,
  exp: "15",
  reviews: "2",
  avgRating: "4.5",
  recs: "0",
  clients: "127",
  clientsLabel: "Clients",
  serviceTypes: ["Life Insurance", "Health Insurance", "General Insurance"],
  achievementTags: ["MDRT"],
  profileUrl: "/krishna-mohan-noti-167ec15f",
  profileSlug: "krishna-mohan-noti-167ec15f",
  showVerifiedBadge: true,
  showIdentityVerified: true,
};

const HERO_ADVISOR_POINTS = [
  "Verified, scored & shareable profile",
  "Showcase who you are",
  "Highlight what you've achieved",
  "Prove why clients trust you — all in one place",
];

const HERO_CUSTOMER_POINTS = [
  "Compare YVITY scores, reviews, and verification",
  "See credentials, experience, and client feedback",
  "Connect with licensed, identity-verified advisors",
  "Browse by city, service type, or insurer",
];

const HERO_COPY = {
  customer: {
    line1: "Find Verified Insurance Advisors",
    line2: "You Can Trust.",
    points: HERO_CUSTOMER_POINTS,
    primaryCta: "find",
    secondaryCta: "register",
  },
  advisor: {
    line1: "Build a Credible Profile.",
    line2: "That Speaks Before You Do.",
    points: HERO_ADVISOR_POINTS,
    primaryCta: "register",
    secondaryCta: "find",
  },
};

/**
 * @param {{ advisor?: import("@/lib/advisors/mock-public-advisors").PublicAdvisorCard[] }} props
 */
const Hero = ({ advisor = [] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const mobileNav = useLandingMobileNavOptional();
  const reducedMotion = usePrefersReducedMotion();
  const [audience, setAudience] = useState("customer");
  const heroAdvisors = Array.isArray(advisor) ? advisor : [];
  const displayAdvisor = toAdvisorCardGoldProps(
    heroAdvisors[0] ?? HERO_PREVIEW_ADVISOR,
  );
  const heroCopy = HERO_COPY[audience];

  const goToFindAdvisors = useCallback(() => {
    const isMobilePanel =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches;

    if (pathname === "/" && isMobilePanel && mobileNav) {
      mobileNav.openPanel("find-advisors");
      return;
    }

    if (pathname === "/") {
      scrollToSection("find-advisors");
      return;
    }

    router.push("/#find-advisors");
  }, [mobileNav, pathname, router]);

  const [countData, setCountData] = useState([
    {
      count: 0,
      title: "Verified Advisors",
    },
    {
      count: 0,
      title: "Cities Covered",
    },
    {
      count: 0,
      title: "Verified Reviews",
    },
  ]);
  useEffect(() => {
    let ignore = false;

    const loadLandingStats = async () => {
      try {
        const response = await fetch("/api/public/landing-stats", {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok || !result?.success || ignore) {
          return;
        }

        setCountData([
          {
            count: Number(result.data?.verifiedAdvisors || 0),
            title: "Verified Advisors",
          },
          {
            count: Number(result.data?.citiesCovered || 0),
            title: "Cities Covered",
          },
          {
            count: Number(result.data?.verifiedReviews || 0),
            title: "Verified Reviews",
          },
        ]);
      } catch (error) {
        console.error("Failed to load landing stats:", error);
      }
    };

    loadLandingStats();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section
      id="home"
      className={`landing-hero-luxury flex h-full flex-col overflow-x-hidden pb-8 pt-[calc(3.75rem+0.75rem)] sm:pt-[calc(4rem+0.75rem)] md:pb-10 lg:pt-[calc(4.375rem+0.5rem)] xl:pt-[4.75rem] ${LANDING_SECTION_ANCHOR}`}
    >
      <div
        className={`${LANDING_INNER} grid h-full grid-cols-1 items-stretch gap-8 md:gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10`}
      >
        {/* Left side Panel */}
        <motion.div
          className="relative z-10 flex h-full min-w-0 flex-col items-center justify-start gap-5 text-center md:gap-6 lg:col-span-6 lg:items-start lg:text-left xl:col-span-7"
          {...(reducedMotion
            ? {}
            : {
                initial: { x: -100, opacity: 0 },
                whileInView: { x: 0, opacity: 1 },
                transition: { duration: 0.8, ease: "easeOut" },
                viewport: { once: true, margin: "-100px" },
              })}
        >
          <span className="landing-hero-badge flex max-w-full items-center justify-center gap-2 rounded-[30px] px-3 py-1.5 lg:justify-start">
            {reducedMotion ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#F59E0B]" />
            ) : (
            <motion.span
              className="h-2 w-2 shrink-0 rounded-full bg-[#F59E0B]"
              animate={{ scale: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            )}
            <p className="font-poppins text-[11px] font-semibold leading-snug text-[#0A4A4A] sm:text-[12px] lg:text-[14px]">
              India&apos;s first credibility platform for insurance — advisors &amp; clients
            </p>
          </span>

          {/* Audience toggle — single segmented control (no separate "I am" label) */}
          <div
            className="landing-hero-audience-toggle"
            role="tablist"
            aria-label="Choose your path"
          >
            <button
              type="button"
              role="tab"
              aria-selected={audience === "customer"}
              onClick={() => setAudience("customer")}
              className={`landing-hero-audience-pill font-poppins text-[11px] font-semibold sm:text-[12px] ${
                audience === "customer" ? "is-active" : ""
              }`}
            >
              Looking for an advisor
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={audience === "advisor"}
              onClick={() => setAudience("advisor")}
              className={`landing-hero-audience-pill font-poppins text-[11px] font-semibold sm:text-[12px] ${
                audience === "advisor" ? "is-active" : ""
              }`}
            >
              I&apos;m an advisor
            </button>
          </div>

          <span className="flex w-full min-w-0 flex-col gap-1 text-[26px] font-cormorant font-bold leading-[1.18] sm:text-[40px] sm:leading-[1.12] md:text-[52px] md:gap-2 lg:text-[56px] lg:leading-[1.1] xl:text-[64px]">
            <p className="landing-hero-headline-accent w-full text-balance">
              {heroCopy.line1}
            </p>
            <p className="landing-hero-headline-primary w-full text-balance">
              {heroCopy.line2}
            </p>
          </span>
          <ul className="mx-auto flex w-full max-w-md flex-col gap-2.5 text-left sm:max-w-lg lg:mx-0 lg:max-w-xl">
            {heroCopy.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 sm:gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/12 ring-1 ring-[#F59E0B]/45 sm:h-[22px] sm:w-[22px]"
                  aria-hidden
                >
                  <Check
                    className="h-3 w-3 text-[#F59E0B] sm:h-3.5 sm:w-3.5"
                    strokeWidth={2.75}
                  />
                </span>
                <span className="landing-hero-bullet-text font-poppins text-[13px] leading-snug sm:text-[14px] md:text-[15px] md:leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>

          {/* Dual CTAs — compact width so they don't overlap the card column */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            {heroCopy.primaryCta === "find" ? (
              <button
                type="button"
                onClick={goToFindAdvisors}
                className="landing-hero-cta-find font-poppins inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-all duration-300 active:scale-[0.98] md:text-[14px]"
              >
                <span>Find Advisors</span>
                <FaArrowRight className="text-xs" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openRegistrationModal()}
                className="landing-hero-cta font-poppins inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-all duration-300 active:scale-[0.98] md:text-[14px]"
              >
                <span>Build Your Profile</span>
                <FaArrowRight className="text-xs" />
              </button>
            )}

            {heroCopy.secondaryCta === "find" ? (
              <button
                type="button"
                onClick={goToFindAdvisors}
                className="landing-hero-cta-outline font-poppins inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-bold transition-all duration-300 active:scale-[0.98] md:text-[14px]"
              >
                Find Advisors
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openRegistrationModal()}
                className="landing-hero-cta-outline font-poppins inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-bold transition-all duration-300 active:scale-[0.98] md:text-[14px]"
              >
                Build Your Profile
              </button>
            )}
          </div>
        </motion.div>
        {/* Right side pannel */}
        {/* <div className="xl:pr-25 md:mx-auto h-full lg:col-span-5"> */}
        {/* <div className="h-full z-0 relative">   Dup*/}
        {/* <AdvisorCard {...advisors[0]} /> */}
        {/* </div>  Dup */}
        {/* </div> */}
        {/* Right side pannel */}
<motion.div
    className="flex h-full w-full min-w-0 items-center justify-center overflow-visible p-0 lg:col-span-6 xl:col-span-5"
    {...(reducedMotion
      ? {}
      : {
          initial: { x: 100, opacity: 0 },
          whileInView: { x: 0, opacity: 1 },
          transition: { duration: 0.8, ease: "easeOut", delay: 0.2 },
          viewport: { once: true, margin: "-100px" },
        })}
  >
    <div className="relative mx-auto w-full max-w-md px-2 sm:px-4 lg:px-6 landing-hero-card-glow">
      <div className="relative flex min-h-0 items-center justify-center md:min-h-[500px]">
        <AdvisorCardGold {...displayAdvisor} key={displayAdvisor.name} />
      </div>
    </div>
  </motion.div>

      </div>
      {/* Count Bar — hidden when all stats are zero (e.g. empty local DB) */}
      {countData.some((item) => item.count > 0) ? (
      <div className="landing-hero-stats mt-16 w-full sm:mt-14 md:mt-20">
        <div className={`${LANDING_INNER} grid grid-cols-3 py-4 md:py-5`}>
          {countData.map((item, index) => (
            <div
              key={item.title}
              className={`flex flex-col items-center justify-center gap-1 px-2 text-center sm:flex-row sm:gap-3 sm:px-4 ${
                index < countData.length - 1
                  ? "border-r landing-hero-stats-divider"
                  : ""
              }`}
            >
              <AnimatedCounter
                value={item.count}
                className="text-2xl font-bold leading-none text-[#0A4A4A] sm:text-3xl"
              />
              <p className="landing-hero-stats-label font-poppins text-[10px] leading-snug sm:max-w-[8rem] sm:text-left md:text-xs lg:text-sm">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
      ) : null}

    </section>
  );
};

export default Hero;

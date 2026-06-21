export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Hero from "@/yvity-landing/app/components/Hero";
import Navbar from "@/yvity-landing/app/components/Navbar";
import Footer from "@/yvity-landing/app/components/Footer";
import Pricing from "@/yvity-landing/app/components/Pricing";
import Getstarted from "@/yvity-landing/app/components/Getstarted";
import HowItWorks from "@/yvity-landing/app/components/home/HowItWorks";
import FindAdvisors from "@/yvity-landing/app/components/home/FindAdvisors";
import Testimonials from "@/yvity-landing/app/components/home/Testimonials";
import FAQ from "@/yvity-landing/app/components/home/FAQ";
import LandingMobileShell from "@/yvity-landing/app/components/home/LandingMobileShell";
import LandingMobileExperience from "@/yvity-landing/app/components/home/LandingMobileExperience";
import LandingMobileSectionSlot from "@/yvity-landing/app/components/home/LandingMobileSectionSlot";
import { getPublicAdvisors } from "@/lib/advisors";
import { buildPlatformHomeMetadata } from "@/lib/social/platform-public-metadata";
import {
  pickHeroAdvisors,
  pickLandingFeaturedAdvisors,
} from "@/lib/advisors/landing-featured";
import { getSessionUser } from "@/lib/server/session";
import { getSiteOrigin } from "@/lib/social/site-origin";
import { COMPANY_NAME } from "@/lib/brand";
import { getAdminPlanPrices } from "@/lib/server/feature-controls-store";

function SectionFallback() {
  return <div className="min-h-12 w-full" aria-hidden />;
}

export const metadata: Metadata = buildPlatformHomeMetadata();

type LandingSection = { id: string; content: ReactNode };

/** Marketing landing — ported from YVITY/src/app/page.js */
export default async function LandingPage() {
  const origin = getSiteOrigin();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY_NAME,
    url: origin,
    logo: `${origin}/brand/yvity-logo.png`,
    description:
      "India's first credibility platform for insurance advisors and their clients. Build a verified, IRDAI-ready profile or find trusted advisors near you.",
    foundingDate: "2024",
    areaServed: "IN",
    sameAs: [],
  };

  const [advisors, session, adminPlanPrices] = await Promise.all([
    getPublicAdvisors(),
    getSessionUser(),
    getAdminPlanPrices(),
  ]);
  const heroAdvisors = pickHeroAdvisors(advisors);
  const landingAdvisors = pickLandingFeaturedAdvisors(advisors);
  const isLoggedIn = Boolean(session);
  // Array — Set is not serializable across the RSC boundary
  const featuredIdList: string[] = landingAdvisors.map((a) => a.id).filter(Boolean);

  const landingSections: LandingSection[] = [
    {
      id: "how-it-works",
      content: (
        <Suspense fallback={<SectionFallback />}>
          <HowItWorks />
        </Suspense>
      ),
    },
    {
      id: "find-advisors",
      content: (
        <Suspense fallback={<SectionFallback />}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <FindAdvisors
            {...({
              featuredAdvisors: landingAdvisors,
              allAdvisors: advisors,
              featuredIdList,
              isLoggedIn,
            } as any)}
          />
        </Suspense>
      ),
    },
    {
      id: "testimonials",
      content: (
        <Suspense fallback={<SectionFallback />}>
          <Testimonials />
        </Suspense>
      ),
    },
    {
      id: "pricing",
      content: (
        <Suspense fallback={<SectionFallback />}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Pricing {...({ livePrices: adminPlanPrices, showOriginalPrice: true } as any)} />
        </Suspense>
      ),
    },
    {
      id: "get-started",
      content: (
        <Suspense fallback={<SectionFallback />}>
          <Getstarted />
        </Suspense>
      ),
    },
    {
      id: "faq",
      content: (
        <Suspense fallback={<SectionFallback />}>
          <FAQ />
        </Suspense>
      ),
    },
  ];

  return (
    <div className="min-h-full w-full bg-[#F8F6F1]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Navbar />
      <LandingMobileShell>
        <LandingMobileExperience
          home={<Hero advisor={heroAdvisors} />}
          footer={
            <Suspense fallback={<SectionFallback />}>
              <Footer />
            </Suspense>
          }
        >
          {landingSections.map((section) => (
            <LandingMobileSectionSlot key={section.id} sectionId={section.id}>
              {section.content}
            </LandingMobileSectionSlot>
          ))}
        </LandingMobileExperience>
      </LandingMobileShell>
    </div>
  );
}

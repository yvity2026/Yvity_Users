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
import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";
import { getPublicAdvisors } from "@/lib/advisors";

function SectionFallback() {
  return <div className="min-h-12 w-full" aria-hidden />;
}

export const metadata: Metadata = {
  title: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
  description:
    "Build a verified, scored and shareable profile for insurance advisors. Credibility that connects advisors and clients.",
};

type LandingSection = { id: string; content: ReactNode };

/** Marketing landing — ported from YVITY/src/app/page.js */
export default async function LandingPage() {
  const advisors = await getPublicAdvisors();

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
          <FindAdvisors advisors={advisors} />
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
          <Pricing />
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
      <Navbar />
      <LandingMobileShell>
        <LandingMobileExperience
          home={<Hero advisor={advisors} />}
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

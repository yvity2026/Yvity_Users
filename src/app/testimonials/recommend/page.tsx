import type { Metadata } from "next";
import { Suspense } from "react";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { RecommendAutoOpen } from "@/components/testimonials/recommend-auto-open";
import { buildRecommendSubmitMetadata } from "@/lib/social/recommend-submit-metadata";

type PageProps = {
  searchParams: Promise<{ advisor?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return await buildRecommendSubmitMetadata(params.advisor);
}

/** Canonical share URL — opens Recommend Advisor form with rich link previews. */
export default function RecommendSubmitPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RecommendAutoOpen />
      </Suspense>
      <TestimonialsShowcase />
    </>
  );
}

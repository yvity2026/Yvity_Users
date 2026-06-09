import type { Metadata } from "next";
import { Suspense } from "react";
import { TestimonialsShowcase } from "@/components/sections/testimonials-showcase";
import { TestimonialsAutoOpen } from "@/components/testimonials/testimonials-auto-open";
import { buildTestimonialSubmitMetadata } from "@/lib/testimonials/social-metadata";

type PageProps = {
  searchParams: Promise<{ advisor?: string; submit?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  if (params.submit === "1" && params.advisor?.trim()) {
    return await buildTestimonialSubmitMetadata(params.advisor);
  }
  return { title: "Testimonials" };
}

export default function TestimonialsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <TestimonialsAutoOpen />
      </Suspense>
      <TestimonialsShowcase />
    </>
  );
}

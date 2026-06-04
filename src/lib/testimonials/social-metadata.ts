import type { Metadata } from "next";
import { advisorProfile } from "@/lib/advisor-profile";
import {
  getTestimonialSubmitShortPath,
  getTestimonialSubmitUrl,
} from "@/lib/testimonials/submit-utils";

export const testimonialShareCopy = {
  ogTitle: "Share Your Experience",
  ogDescription:
    "Your feedback helps others choose trusted insurance guidance. Share a quick verified testimonial — text, audio, or video.",
  pageTitle: "Share Your Experience",
} as const;

export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function buildTestimonialSubmitMetadata(advisorSlug?: string): Metadata {
  const slug = advisorSlug ?? advisorProfile.slug;
  const origin = getSiteOrigin();
  const canonicalPath = getTestimonialSubmitShortPath(slug);
  const pageUrl = getTestimonialSubmitUrl(origin, slug);
  const ogImagePath = "/testimonials/submit/opengraph-image";

  const title = testimonialShareCopy.ogTitle;
  const description = `${testimonialShareCopy.ogDescription} — ${advisorProfile.name}, ${advisorProfile.title}.`;

  return {
    metadataBase: new URL(origin),
    title: `${title} · ${advisorProfile.name}`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: "YVITY",
      title: `${title} · ${advisorProfile.name}`,
      description,
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: `${title} — ${advisorProfile.name} on YVITY`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${advisorProfile.name}`,
      description,
      images: [ogImagePath],
    },
  };
}

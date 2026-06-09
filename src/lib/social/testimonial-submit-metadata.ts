import type { Metadata } from "next";
import { COMPANY_NAME } from "@/lib/brand";
import {
  ADVISOR_ACTION_OG_IMAGE_SIZE,
  loadAdvisorOgShareContext,
  testimonialSubmitOgImagePath,
} from "@/lib/social/advisor-og-share";
import { getSiteOrigin } from "@/lib/social/site-origin";
import {
  testimonialSubmitShareDescription,
  testimonialSubmitShareTitle,
} from "@/lib/social/share-copy";
import { testimonialShareCopy } from "@/lib/testimonials/share-copy";
import {
  getTestimonialSubmitShortPath,
  getTestimonialSubmitUrl,
} from "@/lib/testimonials/submit-utils";

const GENERIC_OG_IMAGE_PATH = "/testimonials/submit/opengraph-image";

export async function buildTestimonialSubmitMetadata(advisorSlug?: string): Promise<Metadata> {
  const slug = advisorSlug?.trim() || "";
  const origin = getSiteOrigin();
  const canonicalPath = slug ? getTestimonialSubmitShortPath(slug) : "/testimonials/submit";
  const pageUrl = slug ? getTestimonialSubmitUrl(origin, slug) : `${origin}${canonicalPath}`;

  const advisor = slug ? await loadAdvisorOgShareContext(slug) : null;
  const ogImagePath = advisor ? testimonialSubmitOgImagePath(advisor.slug) : GENERIC_OG_IMAGE_PATH;
  const ogImageUrl = `${origin}${ogImagePath}`;

  const pageTitle = advisor
    ? testimonialSubmitShareTitle(advisor.name)
    : testimonialShareCopy.ogTitle;
  const description = advisor
    ? testimonialSubmitShareDescription(advisor.name, advisor.designation)
    : `${testimonialShareCopy.ogDescription} — your advisor.`;

  return {
    metadataBase: new URL(origin),
    title: pageTitle,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: COMPANY_NAME,
      title: pageTitle,
      description,
      images: [
        {
          url: ogImagePath,
          width: ADVISOR_ACTION_OG_IMAGE_SIZE.width,
          height: ADVISOR_ACTION_OG_IMAGE_SIZE.height,
          alt: advisor
            ? `${testimonialShareCopy.ogTitle} — ${advisor.name} on ${COMPANY_NAME}`
            : `${testimonialShareCopy.ogTitle} on ${COMPANY_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

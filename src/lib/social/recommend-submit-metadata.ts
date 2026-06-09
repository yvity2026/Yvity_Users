import type { Metadata } from "next";
import { COMPANY_NAME } from "@/lib/brand";
import {
  ADVISOR_ACTION_OG_IMAGE_SIZE,
  loadAdvisorOgShareContext,
  recommendSubmitOgImagePath,
} from "@/lib/social/advisor-og-share";
import { getSiteOrigin } from "@/lib/social/site-origin";
import { recommendShareCopy } from "@/lib/testimonials/recommend-share-copy";
import {
  getRecommendSubmitShortPath,
  getRecommendSubmitUrl,
} from "@/lib/testimonials/recommend-submit-utils";

const GENERIC_OG_IMAGE_PATH = "/testimonials/recommend/opengraph-image";

export async function buildRecommendSubmitMetadata(advisorSlug?: string): Promise<Metadata> {
  const slug = advisorSlug?.trim() || "";
  const origin = getSiteOrigin();
  const canonicalPath = slug ? getRecommendSubmitShortPath(slug) : "/testimonials/recommend";
  const pageUrl = slug ? getRecommendSubmitUrl(origin, slug) : `${origin}${canonicalPath}`;

  const advisor = slug ? await loadAdvisorOgShareContext(slug) : null;
  const ogImagePath = advisor ? recommendSubmitOgImagePath(advisor.slug) : GENERIC_OG_IMAGE_PATH;
  const ogImageUrl = `${origin}${ogImagePath}`;

  const pageTitle = advisor
    ? `${recommendShareCopy.ogTitle} · ${advisor.name}`
    : recommendShareCopy.ogTitle;
  const description = advisor
    ? `${recommendShareCopy.ogDescription} — ${advisor.name}, ${advisor.designation}.`
    : `${recommendShareCopy.ogDescription}`;

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
            ? `${recommendShareCopy.ogTitle} — ${advisor.name} on ${COMPANY_NAME}`
            : `${recommendShareCopy.ogTitle} on ${COMPANY_NAME}`,
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

import type { Metadata } from "next";
import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";
import { ADVISOR_OG_IMAGE_SIZE } from "@/lib/social/advisor-public-profile-metadata";
import {
  platformShareDescription,
  platformShareTitle,
} from "@/lib/social/share-copy";
import { getSiteOrigin } from "@/lib/social/site-origin";

export const PLATFORM_OG_IMAGE_PATH = "/opengraph-image";

/** Open Graph + Twitter metadata for the marketing home page and platform links. */
export function buildPlatformHomeMetadata(): Metadata {
  const origin = getSiteOrigin();
  const title = platformShareTitle;
  const ogImageUrl = `${origin}${PLATFORM_OG_IMAGE_PATH}`;

  return {
    title,
    description: platformShareDescription,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: origin,
      siteName: COMPANY_NAME,
      title,
      description: platformShareDescription,
      images: [
        {
          url: PLATFORM_OG_IMAGE_PATH,
          width: ADVISOR_OG_IMAGE_SIZE.width,
          height: ADVISOR_OG_IMAGE_SIZE.height,
          alt: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: platformShareDescription,
      images: [ogImageUrl],
    },
  };
}

/** Default OG image entry for root layout fallbacks (non-profile routes). */
export function platformOpenGraphImage() {
  return {
    url: PLATFORM_OG_IMAGE_PATH,
    width: ADVISOR_OG_IMAGE_SIZE.width,
    height: ADVISOR_OG_IMAGE_SIZE.height,
    alt: `${COMPANY_NAME} — ${COMPANY_TAGLINE}`,
  } as const;
}

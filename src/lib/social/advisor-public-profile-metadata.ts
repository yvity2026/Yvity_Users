import type { Metadata } from "next";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { buildPublicProfilePath } from "@/lib/advisor/public-profile-slug";
import { COMPANY_NAME } from "@/lib/brand";
import type { PublicViewAdvisorPayload } from "@/lib/server/public-view-context";
import {
  advisorProfileShareDescription,
  advisorProfileShareTitle,
} from "@/lib/social/share-copy";
import { getSiteOrigin } from "@/lib/social/site-origin";

export const ADVISOR_OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export function resolveAdvisorShareDesignation(payload: PublicViewAdvisorPayload): string {
  return (
    payload.profile.designation?.trim() ||
    payload.profession?.trim() ||
    "Insurance Advisor"
  );
}

export function resolveAdvisorShareLocation(payload: PublicViewAdvisorPayload): string {
  return [payload.city?.trim(), payload.state?.trim()].filter(Boolean).join(", ");
}

export function advisorProfileOgImagePath(slug: string): string {
  return `${buildPublicProfilePath(slug)}/opengraph-image`;
}

export function buildAdvisorPublicProfileMetadata(
  payload: PublicViewAdvisorPayload,
  slug: string,
): Metadata {
  const origin = getSiteOrigin();
  const path = buildPublicProfilePath(slug);
  const pageUrl = `${origin}${path}`;
  const ogImagePath = advisorProfileOgImagePath(slug);
  const ogImageUrl = `${origin}${ogImagePath}`;

  const name = payload.name.trim() || "Advisor";
  const designation = resolveAdvisorShareDesignation(payload);
  const location = resolveAdvisorShareLocation(payload);
  const verified = isAdvisorProfileApproved(payload.profile);

  const ogTitle = advisorProfileShareTitle(name, designation);
  const description = advisorProfileShareDescription({
    location,
    verified,
    mode: "visitor",
  });

  return {
    metadataBase: new URL(origin),
    title: name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "profile",
      url: pageUrl,
      siteName: COMPANY_NAME,
      title: ogTitle,
      description,
      images: [
        {
          url: ogImagePath,
          width: ADVISOR_OG_IMAGE_SIZE.width,
          height: ADVISOR_OG_IMAGE_SIZE.height,
          alt: `${name} — ${designation} on ${COMPANY_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

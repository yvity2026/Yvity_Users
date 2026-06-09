import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { toPublicProfileSlugSegment } from "@/lib/advisor/public-profile-slug";
import type { PublicViewAdvisorPayload } from "@/lib/server/public-view-context";
import { loadPublicViewAdvisorBySlug } from "@/lib/server/public-view-context";
import {
  resolveAdvisorShareDesignation,
  resolveAdvisorShareLocation,
} from "@/lib/social/advisor-public-profile-metadata";
import { getSiteOrigin, toAbsoluteUrl } from "@/lib/social/site-origin";
import { COMPANY_LOGO_PATH } from "@/lib/brand";

export const ADVISOR_ACTION_OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export type AdvisorOgShareContext = {
  slug: string;
  name: string;
  designation: string;
  location: string;
  verified: boolean;
  photoSrc: string | null;
  logoSrc: string;
  initials: string;
};

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function testimonialSubmitOgImagePath(advisorSlug: string): string {
  const segment = toPublicProfileSlugSegment(advisorSlug);
  return `/og/testimonial/${encodeURIComponent(segment)}`;
}

export function recommendSubmitOgImagePath(advisorSlug: string): string {
  const segment = toPublicProfileSlugSegment(advisorSlug);
  return `/og/recommend/${encodeURIComponent(segment)}`;
}

export function buildAdvisorOgShareContext(
  payload: PublicViewAdvisorPayload,
  slug: string,
  origin = getSiteOrigin(),
): AdvisorOgShareContext {
  const photo = payload.selfie_url?.trim() || "";
  return {
    slug: toPublicProfileSlugSegment(slug),
    name: payload.name.trim() || "Advisor",
    designation: resolveAdvisorShareDesignation(payload),
    location: resolveAdvisorShareLocation(payload),
    verified: isAdvisorProfileApproved(payload.profile),
    photoSrc: photo ? toAbsoluteUrl(origin, photo) : null,
    logoSrc: toAbsoluteUrl(origin, COMPANY_LOGO_PATH),
    initials: initialsFromName(payload.name),
  };
}

export async function loadAdvisorOgShareContext(
  advisorSlug: string,
): Promise<AdvisorOgShareContext | null> {
  const segment = toPublicProfileSlugSegment(advisorSlug);
  if (!segment) return null;

  const payload = await loadPublicViewAdvisorBySlug(segment);
  if (!payload) return null;

  return buildAdvisorOgShareContext(payload, segment);
}

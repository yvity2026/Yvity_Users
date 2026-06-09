import { buildPublicProfilePath } from "@/lib/advisor/public-profile-slug";
import { COMPANY_NAME } from "@/lib/brand";
import type { PublicViewAdvisorPayload } from "@/lib/server/public-view-context";
import {
  resolveAdvisorShareDesignation,
  resolveAdvisorShareLocation,
} from "@/lib/social/advisor-public-profile-metadata";
import { getSiteOrigin, toAbsoluteUrl } from "@/lib/social/site-origin";

export function buildAdvisorProfileJsonLd(
  payload: PublicViewAdvisorPayload,
  slug: string,
): Record<string, unknown> {
  const origin = getSiteOrigin();
  const path = buildPublicProfilePath(slug);
  const url = `${origin}${path}`;
  const name = payload.name.trim() || "Advisor";
  const designation = resolveAdvisorShareDesignation(payload);
  const location = resolveAdvisorShareLocation(payload);
  const photo = payload.selfie_url?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: designation,
    url,
    worksFor: {
      "@type": "Organization",
      name: COMPANY_NAME,
    },
    ...(photo ? { image: toAbsoluteUrl(origin, photo) } : {}),
    ...(location ? { address: { "@type": "PostalAddress", addressLocality: location } } : {}),
    ...(payload.phone?.trim() ? { telephone: payload.phone.trim() } : {}),
    ...(payload.email?.trim() ? { email: payload.email.trim() } : {}),
    description: `Verified insurance advisor profile on ${COMPANY_NAME}.`,
  };
}

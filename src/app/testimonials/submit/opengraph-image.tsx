import { ImageResponse } from "next/og";
import { COMPANY_LOGO_PATH } from "@/lib/brand";
import { ADVISOR_ACTION_OG_IMAGE_SIZE } from "@/lib/social/advisor-og-share";
import { TestimonialSubmitOgImageFallback } from "@/lib/social/testimonial-submit-og-image";
import { getSiteOrigin, toAbsoluteUrl } from "@/lib/social/site-origin";
import { testimonialShareCopy } from "@/lib/testimonials/share-copy";

export const runtime = "nodejs";
export const alt = testimonialShareCopy.ogTitle;
export const size = ADVISOR_ACTION_OG_IMAGE_SIZE;
export const contentType = "image/png";

/** Generic fallback when no advisor slug is in the share URL. */
export default async function OpenGraphImage() {
  const origin = getSiteOrigin();
  const logoSrc = toAbsoluteUrl(origin, COMPANY_LOGO_PATH);

  return new ImageResponse(<TestimonialSubmitOgImageFallback logoSrc={logoSrc} />, { ...size });
}

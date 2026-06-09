import { ImageResponse } from "next/og";
import { COMPANY_LOGO_PATH } from "@/lib/brand";
import { ADVISOR_ACTION_OG_IMAGE_SIZE } from "@/lib/social/advisor-og-share";
import { RecommendSubmitOgImageFallback } from "@/lib/social/recommend-submit-og-image";
import { getSiteOrigin, toAbsoluteUrl } from "@/lib/social/site-origin";
import { recommendShareCopy } from "@/lib/testimonials/recommend-share-copy";

export const runtime = "nodejs";
export const alt = recommendShareCopy.ogTitle;
export const size = ADVISOR_ACTION_OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const origin = getSiteOrigin();
  const logoSrc = toAbsoluteUrl(origin, COMPANY_LOGO_PATH);
  return new ImageResponse(<RecommendSubmitOgImageFallback logoSrc={logoSrc} />, { ...size });
}

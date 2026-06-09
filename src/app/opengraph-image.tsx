import { ImageResponse } from "next/og";
import { COMPANY_LOGO_PATH } from "@/lib/brand";
import { ADVISOR_OG_IMAGE_SIZE } from "@/lib/social/advisor-public-profile-metadata";
import { PlatformOgImage } from "@/lib/social/platform-og-image";
import { getSiteOrigin, toAbsoluteUrl } from "@/lib/social/site-origin";

export const runtime = "edge";
export const alt = "YVITY — Credibility that Connects";
export const size = ADVISOR_OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const origin = getSiteOrigin();
  const logoSrc = toAbsoluteUrl(origin, COMPANY_LOGO_PATH);

  return new ImageResponse(<PlatformOgImage logoSrc={logoSrc} />, { ...size });
}

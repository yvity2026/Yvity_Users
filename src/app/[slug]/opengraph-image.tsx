import { ImageResponse } from "next/og";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { isReservedPublicProfileSlug } from "@/lib/advisor/public-profile-slug";
import { COMPANY_LOGO_PATH } from "@/lib/brand";
import { loadPublicViewAdvisorBySlug } from "@/lib/server/public-view-context";
import {
  ADVISOR_OG_IMAGE_SIZE,
  resolveAdvisorShareDesignation,
  resolveAdvisorShareLocation,
} from "@/lib/social/advisor-public-profile-metadata";
import { AdvisorProfileOgImage } from "@/lib/social/advisor-profile-og-image";
import { getSiteOrigin, toAbsoluteUrl } from "@/lib/social/site-origin";

export const runtime = "nodejs";
export const alt = "Verified advisor profile on YVITY";
export const size = ADVISOR_OG_IMAGE_SIZE;
export const contentType = "image/png";

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fallbackOgImage(logoSrc: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg, #0a2e2e 0%, #0f4f4f 100%)",
          color: "#f8faf9",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <img src={logoSrc} alt="" width={96} height={96} style={{ objectFit: "contain" }} />
        <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: 4 }}>YVITY</div>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>Verified advisor profiles</div>
      </div>
    ),
    { ...size },
  );
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const origin = getSiteOrigin();
  const logoSrc = toAbsoluteUrl(origin, COMPANY_LOGO_PATH);
  const { slug } = await params;

  if (isReservedPublicProfileSlug(slug)) {
    return fallbackOgImage(logoSrc);
  }

  const payload = await loadPublicViewAdvisorBySlug(slug);
  if (!payload) {
    return fallbackOgImage(logoSrc);
  }

  const photo = payload.selfie_url?.trim() || "";
  const photoSrc = photo ? toAbsoluteUrl(origin, photo) : null;

  return new ImageResponse(
    (
      <AdvisorProfileOgImage
        name={payload.name}
        designation={resolveAdvisorShareDesignation(payload)}
        location={resolveAdvisorShareLocation(payload)}
        verified={isAdvisorProfileApproved(payload.profile)}
        photoSrc={photoSrc}
        logoSrc={logoSrc}
        initials={initialsFromName(payload.name)}
      />
    ),
    { ...size },
  );
}

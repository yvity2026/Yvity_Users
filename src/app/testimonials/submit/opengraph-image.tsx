import { ImageResponse } from "next/og";
import { advisorProfile } from "@/lib/advisor-profile";
import { COMPANY_LOGO_PATH } from "@/lib/brand";
import { getSiteOrigin, testimonialShareCopy } from "@/lib/testimonials/social-metadata";

export const runtime = "edge";
export const alt = testimonialShareCopy.ogTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const initials = advisorProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const photo = advisorProfile.photoUrl?.trim();
  const origin = getSiteOrigin();
  const logoSrc = `${origin}${COMPANY_LOGO_PATH}`;
  const photoSrc =
    photo && (photo.startsWith("http://") || photo.startsWith("https://"))
      ? photo
      : photo
        ? `${origin}${photo.startsWith("/") ? photo : `/${photo}`}`
        : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 56,
        background: "linear-gradient(135deg, #0f2438 0%, #1a3a52 45%, #0d2840 100%)",
        color: "#f4f8fb",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <img
            src={logoSrc}
            alt=""
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
          />
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4 }}>YVITY</span>
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#8ecae6",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Verified Profile
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        {photoSrc ? (
          // OpenGraph runtime (`next/og`) uses a custom JSX renderer that
          // does not support `next/image` — a plain <img> is intentional.
          <img
            src={photoSrc}
            alt=""
            width={200}
            height={200}
            style={{
              borderRadius: 999,
              objectFit: "cover",
              border: "4px solid rgba(130, 210, 255, 0.5)",
            }}
          />
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 700,
              background: "linear-gradient(135deg, #2d6a8f, #5eead4)",
              border: "4px solid rgba(130, 210, 255, 0.5)",
            }}
          >
            {initials}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 16,
              letterSpacing: -1,
            }}
          >
            {testimonialShareCopy.ogTitle}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
            {advisorProfile.name}
          </div>
          <div style={{ fontSize: 22, color: "#a8d4f0", marginBottom: 20 }}>
            {advisorProfile.title}
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.45, color: "#c5dce8", maxWidth: 680 }}>
            {testimonialShareCopy.ogDescription}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "14px 28px",
          borderRadius: 999,
          background: "rgba(94, 234, 212, 0.15)",
          border: "1px solid rgba(94, 234, 212, 0.4)",
          fontSize: 18,
          fontWeight: 600,
          color: "#5eead4",
        }}
      >
        Tap to share your testimonial →
      </div>
    </div>,
    { ...size },
  );
}

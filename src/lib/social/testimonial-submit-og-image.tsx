import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";
import { testimonialShareCopy } from "@/lib/testimonials/share-copy";
import type { AdvisorOgShareContext } from "@/lib/social/advisor-og-share";

function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

/** JSX tree for `next/og` ImageResponse — testimonial request share card. */
export function TestimonialSubmitOgImage({
  name,
  designation,
  verified,
  photoSrc,
  logoSrc,
  initials,
}: Pick<
  AdvisorOgShareContext,
  "name" | "designation" | "verified" | "photoSrc" | "logoSrc" | "initials"
>) {
  const displayName = truncate(name, 40);
  const displayDesignation = truncate(designation, 52);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 56,
        background: "linear-gradient(135deg, #0a2e2e 0%, #0f4f4f 42%, #0a3d3d 100%)",
        color: "#f8faf9",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 22px 10px 14px",
            borderRadius: 999,
            background: "#F8F6F1",
          }}
        >
          <img src={logoSrc} alt="" width={40} height={40} style={{ objectFit: "contain" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, color: "#0A4A4A", lineHeight: 1.1 }}>
              {COMPANY_NAME}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B", letterSpacing: 0.5, lineHeight: 1 }}>
              {COMPANY_TAGLINE}
            </span>
          </div>
        </div>
        {verified ? (
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#F59E0B",
            }}
          >
            Verified profile
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        {photoSrc ? (
          <img
            src={photoSrc}
            alt=""
            width={200}
            height={200}
            style={{
              borderRadius: 999,
              objectFit: "cover",
              border: "4px solid rgba(42, 181, 181, 0.55)",
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
              background: "linear-gradient(135deg, #0A4A4A, #2ab5b5)",
              border: "4px solid rgba(42, 181, 181, 0.55)",
            }}
          >
            {initials}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
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
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{displayName}</div>
          <div style={{ fontSize: 22, color: "#F59E0B", marginBottom: 20 }}>
            {displayDesignation}
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.45, color: "rgba(255,255,255,0.62)", maxWidth: 680 }}>
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
          background: "rgba(42, 181, 181, 0.15)",
          border: "1px solid rgba(42, 181, 181, 0.45)",
          fontSize: 18,
          fontWeight: 600,
          color: "#2ab5b5",
        }}
      >
        Tap to share your testimonial →
      </div>
    </div>
  );
}

/** Generic card when no advisor slug is available. */
export function TestimonialSubmitOgImageFallback({ logoSrc }: { logoSrc: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 56,
        background: "linear-gradient(135deg, #0a2e2e 0%, #0f4f4f 42%, #0a3d3d 100%)",
        color: "#f8faf9",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 22px 10px 14px",
          borderRadius: 999,
          background: "#F8F6F1",
        }}
      >
        <img src={logoSrc} alt="" width={40} height={40} style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, color: "#0A4A4A", lineHeight: 1.1 }}>
            {COMPANY_NAME}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B", letterSpacing: 0.5, lineHeight: 1 }}>
            {COMPANY_TAGLINE}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>
          {testimonialShareCopy.ogTitle}
        </div>
        <div style={{ fontSize: 24, lineHeight: 1.45, color: "rgba(255,255,255,0.62)", maxWidth: 900 }}>
          {testimonialShareCopy.ogDescription}
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "#2ab5b5" }}>
        Share text, audio, or video feedback on YVITY
      </div>
    </div>
  );
}

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
          <img src={logoSrc} alt="" width={36} height={36} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4 }}>YVITY</span>
        </div>
        {verified ? (
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: "#8ecae6",
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
          <div style={{ fontSize: 22, color: "#a8d4f0", marginBottom: 20 }}>
            {displayDesignation}
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
        background: "linear-gradient(135deg, #0f2438 0%, #1a3a52 45%, #0d2840 100%)",
        color: "#f4f8fb",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={logoSrc} alt="" width={48} height={48} style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>YVITY</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>
          {testimonialShareCopy.ogTitle}
        </div>
        <div style={{ fontSize: 24, lineHeight: 1.45, color: "#c5dce8", maxWidth: 900 }}>
          {testimonialShareCopy.ogDescription}
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "#5eead4" }}>
        Share text, audio, or video feedback on YVITY
      </div>
    </div>
  );
}

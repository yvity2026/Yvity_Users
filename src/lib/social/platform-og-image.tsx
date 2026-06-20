import { COMPANY_NAME } from "@/lib/brand";

export type PlatformOgImageInput = {
  logoSrc: string;
};

/** JSX tree for `next/og` ImageResponse — YVITY platform / home share card. */
export function PlatformOgImage({ logoSrc }: PlatformOgImageInput) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "52px 60px",
        background: "linear-gradient(135deg, #061a1a 0%, #0b3d3d 45%, #072828 100%)",
        color: "#f8faf9",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Top bar — logo + brand name */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(255,255,255,0.95)",
            border: "2px solid rgba(245,158,11,0.5)",
          }}
        >
          <img src={logoSrc} alt="" width={36} height={36} style={{ objectFit: "contain" }} />
        </div>
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 4,
            color: "#ffffff",
          }}
        >
          {COMPANY_NAME}
        </span>
        <div
          style={{
            marginLeft: 12,
            padding: "5px 14px",
            borderRadius: 999,
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.4)",
            fontSize: 13,
            fontWeight: 600,
            color: "#F59E0B",
            letterSpacing: 0.5,
          }}
        >
          yvity.com
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Eyebrow badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "fit-content",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#F59E0B",
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "rgba(255,255,255,0.65)",
              letterSpacing: 0.3,
            }}
          >
            India&apos;s First Credibility Platform
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.08,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            For Insurance Advisors
          </span>
          <span
            style={{
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.08,
              color: "#F59E0B",
              letterSpacing: -1,
            }}
          >
            &amp; Their Clients.
          </span>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.68)",
            maxWidth: 820,
          }}
        >
          Build a verified, IRDAI-ready profile that earns trust — or find the right advisor near
          you with real credentials, real reviews.
        </div>
      </div>

      {/* Bottom CTA row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            display: "flex",
            padding: "14px 28px",
            borderRadius: 999,
            background: "#F59E0B",
            fontSize: 18,
            fontWeight: 700,
            color: "#071f1f",
            letterSpacing: 0.3,
          }}
        >
          Join Free Today →
        </div>
        {["IRDAI-Ready Profiles", "YVITY Score", "Verified Badge"].map((label) => (
          <div
            key={label}
            style={{
              padding: "12px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            ✓ {label}
          </div>
        ))}
      </div>
    </div>
  );
}

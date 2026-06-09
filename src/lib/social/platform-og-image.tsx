import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";

export type PlatformOgImageInput = {
  logoSrc: string;
};

const FEATURES = ["IRDAI-ready profiles", "YVITY Score", "Shareable & verified"] as const;

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
        padding: 56,
        background: "linear-gradient(135deg, #071f1f 0%, #0f4f4f 40%, #0a3535 100%)",
        color: "#f8faf9",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          alignSelf: "flex-start",
          padding: "10px 18px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <img src={logoSrc} alt="" width={44} height={44} style={{ objectFit: "contain" }} />
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>{COMPANY_NAME}</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 20,
        }}
      >
        <div
          style={{
            width: 148,
            height: 148,
            borderRadius: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.95)",
            border: "4px solid rgba(245, 158, 11, 0.55)",
            boxShadow: "0 20px 56px rgba(0,0,0,0.35)",
          }}
        >
          <img src={logoSrc} alt="" width={108} height={108} style={{ objectFit: "contain" }} />
        </div>

        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: 2, lineHeight: 1 }}>
          {COMPANY_NAME}
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: "#F59E0B",
            letterSpacing: 0.5,
            lineHeight: 1.2,
          }}
        >
          {COMPANY_TAGLINE}
        </div>
        <div
          style={{
            fontSize: 24,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 820,
          }}
        >
          Build a verified, scored, and shareable profile — or find trusted insurance advisors
          near you.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
        {FEATURES.map((label) => (
          <div
            key={label}
            style={{
              padding: "12px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255,255,255,0.88)",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

import { recommendShareCopy } from "@/lib/testimonials/recommend-share-copy";
import type { AdvisorOgShareContext } from "@/lib/social/advisor-og-share";

function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function RecommendSubmitOgImage({
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
        background: "linear-gradient(135deg, #2a1f0a 0%, #4a3512 45%, #1f1608 100%)",
        color: "#faf6ef",
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
            border: "1px solid rgba(245, 158, 11, 0.35)",
          }}
        >
          <img src={logoSrc} alt="" width={36} height={36} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4 }}>YVITY</span>
        </div>
        {verified ? (
          <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", letterSpacing: 1.5 }}>
            VERIFIED
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
              border: "4px solid rgba(245, 158, 11, 0.55)",
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
              background: "linear-gradient(135deg, #b45309, #f59e0b)",
              border: "4px solid rgba(245, 158, 11, 0.55)",
            }}
          >
            {initials}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            {recommendShareCopy.ogTitle}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{displayName}</div>
          <div style={{ fontSize: 22, color: "#fcd34d", marginBottom: 20 }}>{displayDesignation}</div>
          <div style={{ fontSize: 20, lineHeight: 1.45, color: "#e7d5b8", maxWidth: 680 }}>
            {recommendShareCopy.ogDescription}
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
          background: "rgba(245, 158, 11, 0.15)",
          border: "1px solid rgba(245, 158, 11, 0.45)",
          fontSize: 18,
          fontWeight: 600,
          color: "#F59E0B",
        }}
      >
        Tap to recommend this advisor →
      </div>
    </div>
  );
}

export function RecommendSubmitOgImageFallback({ logoSrc }: { logoSrc: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 56,
        background: "linear-gradient(135deg, #2a1f0a 0%, #4a3512 100%)",
        color: "#faf6ef",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <img src={logoSrc} alt="" width={48} height={48} style={{ objectFit: "contain" }} />
      <div style={{ fontSize: 56, fontWeight: 800 }}>{recommendShareCopy.ogTitle}</div>
      <div style={{ fontSize: 22, color: "#e7d5b8" }}>{recommendShareCopy.ogDescription}</div>
    </div>
  );
}

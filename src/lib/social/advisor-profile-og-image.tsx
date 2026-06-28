import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";

export type AdvisorProfileOgImageInput = {
  name: string;
  designation: string;
  location: string;
  verified: boolean;
  photoSrc: string | null;
  logoSrc: string;
  initials: string;
};

function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

/** JSX tree for `next/og` ImageResponse — advisor public profile share card. */
export function AdvisorProfileOgImage({
  name,
  designation,
  location,
  verified,
  photoSrc,
  logoSrc,
  initials,
}: AdvisorProfileOgImageInput) {
  const displayName = truncate(name, 42);
  const displayDesignation = truncate(designation, 56);
  const displayLocation = truncate(location, 48);

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
          <img
            src={logoSrc}
            alt=""
            width={40}
            height={40}
            style={{ objectFit: "contain" }}
          />
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
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid rgba(245, 158, 11, 0.45)",
              background: "rgba(245, 158, 11, 0.12)",
            }}
          >
            Verified profile
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
        {photoSrc ? (
          <img
            src={photoSrc}
            alt=""
            width={220}
            height={220}
            style={{
              borderRadius: 999,
              objectFit: "cover",
              border: "5px solid rgba(245, 158, 11, 0.55)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
            }}
          />
        ) : (
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              fontWeight: 700,
              background: "linear-gradient(135deg, #0A4A4A, #F59E0B)",
              border: "5px solid rgba(245, 158, 11, 0.55)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
            }}
          >
            {initials}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.08,
              marginBottom: 12,
              letterSpacing: -1,
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#F59E0B",
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            {displayDesignation}
          </div>
          {displayLocation ? (
            <div style={{ fontSize: 22, color: "rgba(255,255,255,0.72)", marginBottom: 18 }}>
              {displayLocation}
            </div>
          ) : null}
          <div style={{ fontSize: 20, lineHeight: 1.45, color: "rgba(255,255,255,0.62)", maxWidth: 700 }}>
            Trusted insurance & financial guidance — view services, credentials, and client proof on
            YVITY.
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
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          fontSize: 18,
          fontWeight: 600,
          color: "#F59E0B",
        }}
      >
        Tap to view verified advisor profile →
      </div>
    </div>
  );
}

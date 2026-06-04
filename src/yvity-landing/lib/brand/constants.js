export const BRAND_NAME = "YVITY";
export const BRAND_TAGLINE = "Credibility that Connects";

export const BRAND_LOGO = "/brand/yvity-logo.png";
export const BRAND_LOGO_SRC = "/brand/yvity-logo.png";
export function getBrandLogoUrl(baseUrl = "") {
  const origin = (baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  return origin ? `${origin}${BRAND_LOGO_SRC}` : BRAND_LOGO_SRC;
}

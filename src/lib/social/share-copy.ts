import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";
import { recommendShareCopy } from "@/lib/testimonials/recommend-share-copy";
import { testimonialShareCopy } from "@/lib/testimonials/share-copy";

export type AdvisorShareMode = "self" | "visitor";

/** Matches Open Graph `og:title` for advisor public profiles. */
export function advisorProfileShareTitle(name: string, designation: string): string {
  const displayName = name.trim() || "Advisor";
  const displayDesignation = designation.trim() || "Insurance Advisor";
  return `${displayName} · ${displayDesignation}`;
}

/** Matches Open Graph `og:description` for advisor public profiles. */
export function advisorProfileShareDescription(input: {
  location?: string;
  verified?: boolean;
  mode?: AdvisorShareMode;
}): string {
  const location = input.location?.trim();
  const verified = input.verified ?? false;
  const mode = input.mode ?? "visitor";

  const prefix =
    mode === "self"
      ? verified
        ? "My verified YVITY profile"
        : "My YVITY advisor profile"
      : verified
        ? "Verified YVITY profile"
        : "YVITY advisor profile";

  return [prefix, location || undefined, "View services, credentials, and client proof."]
    .filter(Boolean)
    .join(" · ");
}

/** Matches Open Graph title for testimonial submit links. */
export function testimonialSubmitShareTitle(name: string): string {
  const displayName = name.trim();
  return displayName
    ? `${testimonialShareCopy.ogTitle} · ${displayName}`
    : testimonialShareCopy.ogTitle;
}

/** Matches Open Graph description for testimonial submit links. */
export function testimonialSubmitShareDescription(name: string, designation: string): string {
  const advisorLine = name.trim()
    ? `${name.trim()}, ${designation.trim() || "Insurance Advisor"}`
    : "your advisor";
  return `${testimonialShareCopy.ogDescription} — ${advisorLine}.`;
}

/** Matches Open Graph title for recommend submit links. */
export function recommendSubmitShareTitle(name: string): string {
  const displayName = name.trim();
  return displayName
    ? `${recommendShareCopy.ogTitle} · ${displayName}`
    : recommendShareCopy.ogTitle;
}

/** Matches Open Graph description for recommend submit links. */
export function recommendSubmitShareDescription(name: string, designation: string): string {
  const advisorLine = name.trim()
    ? `${name.trim()}, ${designation.trim() || "Insurance Advisor"}`
    : "this advisor";
  return `${recommendShareCopy.ogDescription} — ${advisorLine}.`;
}

export const platformShareTitle = `${COMPANY_NAME} — ${COMPANY_TAGLINE}`;

export const platformShareDescription =
  "Build a verified, scored, and shareable profile for insurance advisors — or discover trusted advisors on YVITY. Credibility that connects.";

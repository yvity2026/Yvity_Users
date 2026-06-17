import { parseUserRoles } from "@/lib/advisor/workspaceSetupStatus";

export function isAdvisorRole(user) {
  return parseUserRoles(user).includes("advisor");
}

/**
 * Role-based welcome subtitle for the post-onboarding home banner.
 */
export function getWelcomeBannerSubtitle(user, options = {}) {
  const { workspaceNeedsSetup = false } = options;

  if (workspaceNeedsSetup) {
    return "Set up your services and verification in My Space so clients can discover you on YVITY.";
  }

  if (isAdvisorRole(user)) {
    return "Offer your professional services on YVITY.";
  }

  const city = String(options.userCity || user?.city || "").trim();
  if (city) {
    return `Discover trusted professionals near ${city} on YVITY.`;
  }

  return "Search trusted professionals on YVITY.";
}

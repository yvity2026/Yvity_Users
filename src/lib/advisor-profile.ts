export {
  buildAdvisorDisplayProfile,
  ADVISOR_PROFILE_LABELS,
  type AdvisorDisplayProfile,
} from "@/lib/advisor-display-profile";

import { buildAdvisorDisplayProfile } from "@/lib/advisor-display-profile";

/**
 * Fallback when hooks are unavailable — prefer `useAdvisorDisplayProfile()`.
 * Contains no demo advisor data; empty placeholders until the user fills their profile.
 */
export const advisorProfile = buildAdvisorDisplayProfile({});

import FindAdvisorsClient from "./FindAdvisorsClient";

/**
 * @param {{
 *   featuredAdvisors?: import("@/lib/advisors/mock-public-advisors").PublicAdvisorCard[],
 *   allAdvisors?: import("@/lib/advisors/mock-public-advisors").PublicAdvisorCard[],
 *   featuredIds?: Set<string>,
 *   isLoggedIn?: boolean
 * }} props
 */
export default function FindAdvisors({
  featuredAdvisors = [],
  allAdvisors = [],
  featuredIds = new Set(),
  isLoggedIn = false,
}) {
  return (
    <FindAdvisorsClient
      featuredAdvisors={featuredAdvisors}
      allAdvisors={allAdvisors}
      featuredIds={featuredIds}
      isLoggedIn={isLoggedIn}
    />
  );
}

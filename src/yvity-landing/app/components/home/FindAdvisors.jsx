import FindAdvisorsClient from "./FindAdvisorsClient";

/**
 * @param {{ advisors?: import("@/lib/advisors/mock-public-advisors").PublicAdvisorCard[] }} props
 */
export default function FindAdvisors({ advisors = [], isLoggedIn = false }) {
  return <FindAdvisorsClient advisors={advisors ?? []} isLoggedIn={isLoggedIn} />;
}

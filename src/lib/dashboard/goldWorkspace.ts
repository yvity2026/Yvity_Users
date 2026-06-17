import type { DashboardAdvisor, DashboardUser } from "@/context/AuthUserContext";
import { getAdvisorWorkspaceSetupState } from "@/lib/advisor/workspaceSetupStatus";

/**
 * Whether My Space should render the full YVITY-Gold advisor workspace.
 * True for any advisor lifecycle state: role set, profile exists, under review, or active.
 */
export function shouldShowGoldAdvisorWorkspace(
  user: DashboardUser | null | undefined,
  advisor?: DashboardAdvisor | null,
): boolean {
  const setup = getAdvisorWorkspaceSetupState(user, advisor);
  return (
    setup.isAdvisorRole ||
    setup.isUnderReview ||
    setup.hasAdvisorProfile ||
    setup.canAccessDashboard
  );
}

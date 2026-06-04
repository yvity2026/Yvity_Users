import { getAdvisorWorkspaceSetupState, parseUserRoles } from "@/lib/advisor/workspaceSetupStatus";
import { canAccessAdvisorDashboard } from "@/lib/dashboard/advisorWorkspace";

/**
 * Whether My Space should render the full YVITY-Gold advisor workspace
 * (Signature Dark shell, no pearl marketing chrome).
 */
export function shouldShowGoldAdvisorWorkspace(user, advisor) {
  const setup = getAdvisorWorkspaceSetupState(user, advisor);
  const workspaceActive = canAccessAdvisorDashboard(user, advisor);

  return (
    setup.isAdvisorRole ||
    setup.isUnderReview ||
    setup.hasAdvisorProfile ||
    workspaceActive
  );
}

export function getGoldWorkspaceSetupState(user, advisor) {
  return getAdvisorWorkspaceSetupState(user, advisor);
}

export { parseUserRoles };

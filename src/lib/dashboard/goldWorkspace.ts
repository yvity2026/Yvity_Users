import type { DashboardAdvisor, DashboardUser } from "@/context/AuthUserContext";

/**
 * Whether My Space should render the full YVITY-Gold advisor workspace.
 * Demo: any signed-in user sees the workspace with hardcoded advisor data.
 */
export function shouldShowGoldAdvisorWorkspace(
  user: DashboardUser | null | undefined,
  _advisor?: DashboardAdvisor,
): boolean {
  return true;
}

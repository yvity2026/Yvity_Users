/** True when admin has approved the advisor's IRDAI / profile registration. */
export function isAdvisorProfileApproved(
  profile:
    | { account_status?: string; approved_at?: string | null }
    | null
    | undefined,
): boolean {
  if (!profile) return false;
  return profile.account_status === "active" && Boolean(profile.approved_at?.trim());
}

/**
 * Advisor workspace setup / nav CTA state (matches landing Header logic).
 */
export function parseUserRoles(user) {
  let roles = user?.roles;
  if (typeof roles === "string") {
    try {
      roles = JSON.parse(roles);
    } catch {
      roles = [];
    }
  }
  return Array.isArray(roles) ? roles : [];
}

export function getAdvisorWorkspaceSetupState(user, advisor, options = {}) {
  const { pendingIrdaiUpload = false } = options;

  const roleList = parseUserRoles(user);
  const isAdvisorRole = roleList.includes("advisor");

  const normalizedCertificateUrl =
    typeof advisor?.iridai_certificate_url === "string"
      ? advisor.iridai_certificate_url.trim()
      : "";
  const rejectedReason =
    typeof advisor?.irdai_rejected_reason === "string"
      ? advisor.irdai_rejected_reason.trim()
      : "";

  const hasIrdaiCertificate =
    Boolean(normalizedCertificateUrl) &&
    normalizedCertificateUrl.toLowerCase() !== "pending";

  const hasPaidPlan =
    advisor?.subscription_plan === "silver" ||
    advisor?.subscription_plan === "gold";

  const canAccessDashboard =
    isAdvisorRole &&
    Boolean(advisor?.profile_status) &&
    advisor?.account_status === "active";

  const needsIrdaiUpload =
    hasPaidPlan && !hasIrdaiCertificate && !canAccessDashboard;

  const shouldPromptIrdaiUpload = needsIrdaiUpload || pendingIrdaiUpload;

  const isIrdaiRejected =
    advisor?.account_status === "action_required" && !canAccessDashboard;

  const hasAdvisorProfile = Boolean(
    advisor?.id || advisor?.advisor_id || advisor?.profile_slug,
  );

  const isUnderReview =
    advisor?.account_status === "under_review" && !canAccessDashboard;

  const mySpaceProcessComplete = hasAdvisorProfile && hasIrdaiCertificate;
  const irdaiPendingAdminReview =
    mySpaceProcessComplete &&
    advisor?.account_status === "under_review" &&
    !canAccessDashboard;

  const showSetupWorkspace =
    !canAccessDashboard &&
    !mySpaceProcessComplete &&
    !isIrdaiRejected;

  return {
    isAdvisorRole,
    canAccessDashboard,
    needsIrdaiUpload,
    shouldPromptIrdaiUpload,
    isIrdaiRejected,
    isUnderReview,
    showSetupWorkspace,
    hasAdvisorProfile,
    rejectedReason,
    hasPaidPlan,
    hasIrdaiCertificate,
    mySpaceProcessComplete,
    irdaiPendingAdminReview,
  };
}

import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import type { DashboardAdvisor } from "@/context/AuthUserContext";

type AdvisorLike =
  | DashboardAdvisor
  | {
      account_status?: string;
      approved_at?: string | null;
      iridai_certificate_url?: string | null;
      profile_slug?: string | null;
      id?: string;
      advisor_id?: string;
    }
  | null
  | undefined;

/** Advisor uploaded an IRDAI certificate during My Space setup (not the "pending" placeholder). */
export function hasIrdaiCertificateUploaded(advisor: AdvisorLike): boolean {
  const url = advisor?.iridai_certificate_url?.trim();
  return Boolean(url && url.toLowerCase() !== "pending");
}

/** Admin verified the IRDAI license and activated the public profile. */
export function isIrdaiAdminApproved(advisor: AdvisorLike): boolean {
  return isAdvisorProfileApproved(advisor);
}

/**
 * Advisor finished the My Space onboarding step: services submitted and
 * IRDAI certificate uploaded. Admin review may still be pending.
 */
export function isMySpaceProcessComplete(advisor: AdvisorLike): boolean {
  const hasProfile = Boolean(
    advisor?.id || advisor?.advisor_id || advisor?.profile_slug,
  );
  return hasProfile && hasIrdaiCertificateUploaded(advisor);
}

/** Certificate uploaded; YVITY admin has not approved yet. */
export function isIrdaiPendingAdminReview(advisor: AdvisorLike): boolean {
  if (!isMySpaceProcessComplete(advisor)) return false;
  return advisor?.account_status === "under_review";
}

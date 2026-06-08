import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";
import type { ServiceItem } from "@/lib/sections/types";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { loadServicesForUser, saveServicesForUser } from "@/lib/server/section-persistence";
import { markVerified } from "@/lib/verification/defaults";

function shouldVerifyWithProfileApproval(item: ServiceItem): boolean {
  const v = item.verification;
  if (!v || v.status === "verified" || v.status === "rejected") return false;
  return Boolean(v.submittedAt) || (v.documents?.length ?? 0) > 0;
}

/**
 * Registration services are reviewed with the profile. Once the advisor is
 * approved, persist `verified` on services that were submitted with documents.
 */
export async function syncServicesVerificationForApprovedProfile(
  userId: string,
): Promise<boolean> {
  const profile = await getAdvisorProfileForUser(userId);
  if (!profile || !isAdvisorProfileApproved(profile)) return false;

  const limits = resolvePlanLimits(profile.subscription_plan, profile.account_status);
  if (!limits.serviceVerification) return false;

  const items = await loadServicesForUser(userId);

  let changed = false;
  const next = items.map((s) => {
    if (!shouldVerifyWithProfileApproval(s)) return s;
    changed = true;
    const verification = markVerified(s.verification);
    return { ...s, verification, verified: true };
  });

  if (changed) await saveServicesForUser(userId, next);
  return changed;
}

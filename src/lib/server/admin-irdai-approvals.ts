import {
  approveAdvisorProfile,
  findAdvisorProfileById,
  listAdvisorProfilesForAdmin,
  rejectAdvisorProfile,
  type AdvisorProfileRecord,
} from "@/lib/server/advisor-profile-store";
import { loadRegistrationDb } from "@/lib/server/registration-store";
import {
  notifyProfileApproved,
  notifyProfileRejected,
} from "@/lib/server/profile-approval-notify";

export type IrdaiApprovalStatus = "pending" | "approved" | "rejected";

export type IrdaiApprovalRow = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  profile_pic: string | null;
  location: string;
  licenseUrl: string | null;
  isVerified: boolean;
  status: IrdaiApprovalStatus;
  type: string;
  submittedAt: string | null;
  updatedAt: string | null;
  licenseNo: string;
  plan: string;
  is_hero: boolean;
  is_landing: boolean;
  document_urls: string[];
  rejectionReason: string | null;
};

export type IrdaiApprovalStats = {
  pending: number;
  approved: number;
  rejected: number;
  heroCount: number;
  lanCount: number;
};

function mapStatus(accountStatus: AdvisorProfileRecord["account_status"]): IrdaiApprovalStatus {
  if (accountStatus === "active") return "approved";
  if (accountStatus === "action_required") return "rejected";
  return "pending";
}

function resolveAssetUrl(url: string | null | undefined, baseUrl: string): string | null {
  const trimmed = String(url ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return `${baseUrl}${trimmed}`;
  return trimmed;
}

export function mapProfileToIrdaiRow(
  profile: AdvisorProfileRecord,
  baseUrl = "",
): IrdaiApprovalRow {
  const user = loadRegistrationDb().users.find((item) => item.id === profile.user_id);
  const selfie = user?.selfieUrl ?? user?.verification_selfie_url ?? null;
  const cert =
    profile.iridai_certificate_url && profile.iridai_certificate_url !== "pending"
      ? profile.iridai_certificate_url
      : profile.document_urls?.[0] ?? null;

  return {
    id: profile.id,
    user_id: profile.user_id,
    name: user?.fullName ?? "Advisor",
    email: user?.email ?? null,
    phone: user?.phone ?? null,
    profile_pic: resolveAssetUrl(selfie, baseUrl),
    location: user?.city ? `${user.city}, IN` : "Unknown, IN",
    licenseUrl: resolveAssetUrl(cert, baseUrl),
    isVerified: profile.profile_status,
    status: mapStatus(profile.account_status),
    type: profile.designation ?? "Insurance Advisor",
    submittedAt: profile.submitted_at ?? null,
    updatedAt: profile.approved_at ?? profile.submitted_at ?? null,
    licenseNo: profile.advisor_role_id ?? "—",
    plan: profile.subscription_plan ?? "free",
    is_hero: false,
    is_landing: false,
    document_urls: (profile.document_urls ?? []).map((url) => resolveAssetUrl(url, baseUrl) ?? url),
    rejectionReason: profile.irdai_rejected_reason ?? null,
  };
}

export async function listIrdaiApprovals(baseUrl = ""): Promise<{
  data: IrdaiApprovalRow[];
  stats: IrdaiApprovalStats;
}> {
  const profiles = await listAdvisorProfilesForAdmin();
  const stats: IrdaiApprovalStats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    heroCount: 0,
    lanCount: 0,
  };

  const data = profiles.map((profile) => {
    const row = mapProfileToIrdaiRow(profile, baseUrl);
    stats[row.status] += 1;
    return row;
  });

  return { data, stats };
}

export async function approveIrdaiSubmission(advisorId: string) {
  const existing = await findAdvisorProfileById(advisorId);
  if (!existing) return null;
  const profile = await approveAdvisorProfile(existing.user_id);
  if (profile) {
    // Fire immediately — don't wait for advisor to open notifications
    void notifyProfileApproved(profile, { sendOutbound: true });
  }
  return profile;
}

export async function rejectIrdaiSubmission(advisorId: string, reason?: string) {
  const profile = await rejectAdvisorProfile(advisorId, reason);
  if (profile) {
    void notifyProfileRejected(profile, reason?.trim() || "Profile requires changes");
  }
  return profile;
}

import {
  buildProfileApprovedEmail,
  buildProfileApprovedWhatsAppMessage,
  buildProfileRejectedEmail,
  buildProfileRejectedWhatsAppMessage,
} from "@/lib/notifications/approval-message";
import {
  appendNotification,
  hasNotificationKind,
} from "@/lib/server/notifications-store";
import { loadUserByIdFromDb } from "@/lib/server/supabase/platform-supabase";
import type { AdvisorProfileRecord } from "@/lib/server/advisor-profile-store";
import { sendApprovalEmail, sendApprovalWhatsApp } from "@/lib/server/outbound-messaging";

import { buildPublicProfilePath } from "@/lib/advisor/public-profile-slug";

function resolveBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3002"
  );
}

/** In-app notification + optional email/WhatsApp when admin approves a profile. */
export async function notifyProfileApproved(
  profile: AdvisorProfileRecord,
  options: { sendOutbound?: boolean } = {},
): Promise<void> {
  const user = await loadUserByIdFromDb(profile.user_id);
  const advisorName = user?.fullName?.trim() || "Advisor";
  const baseUrl = resolveBaseUrl();
  const profileUrl = `${baseUrl}${buildPublicProfilePath(profile.profile_slug)}`;

  const alreadyNotified = await hasNotificationKind(profile.user_id, "profile_approved");
  if (!alreadyNotified) {
    await appendNotification({
      userId: profile.user_id,
      kind: "profile_approved",
      title: "Profile approved — you're live! 🎉",
      message: `Congratulations ${advisorName}! Your YVITY profile was verified and approved. Your public profile and YVITY Score are now fully active.`,
      href: buildPublicProfilePath(profile.profile_slug ?? ""),
      meta: {
        profileSlug: profile.profile_slug,
        approvedAt: profile.approved_at ?? new Date().toISOString(),
      },
    });
  }

  if (options.sendOutbound === false || alreadyNotified) return;

  const emailPayload = buildProfileApprovedEmail({
    advisorName,
    profileUrl,
    approvedAt: profile.approved_at,
  });
  const whatsappMessage = buildProfileApprovedWhatsAppMessage({
    advisorName,
    profileUrl,
    approvedAt: profile.approved_at,
  });

  if (user?.email?.trim()) {
    await sendApprovalEmail({ to: user.email.trim(), ...emailPayload }, "hello");
  }

  if (user?.phone?.trim()) {
    await sendApprovalWhatsApp({
      phone: user.phone.trim(),
      message: whatsappMessage,
    });
  }
}

/** In-app notification + email/WhatsApp when admin rejects a profile. */
export async function notifyProfileRejected(
  profile: AdvisorProfileRecord,
  reason: string,
): Promise<void> {
  const user = await loadUserByIdFromDb(profile.user_id);
  const advisorName = user?.fullName?.trim() || "Advisor";
  const baseUrl = resolveBaseUrl();
  const resubmitUrl = `${baseUrl}/dashboard/my-space?setup=profile`;

  await appendNotification({
    userId: profile.user_id,
    kind: "profile_rejected",
    title: "Profile update required — action needed",
    message: `Hi ${advisorName}, your profile needs an update before it can go live. Reason: ${reason}`,
    href: "/dashboard/my-space?setup=profile",
    meta: {
      reason,
      rejectedAt: new Date().toISOString(),
    },
  });

  const emailPayload = buildProfileRejectedEmail({ advisorName, reason, resubmitUrl });
  const whatsappMessage = buildProfileRejectedWhatsAppMessage({ advisorName, reason, resubmitUrl });

  if (user?.email?.trim()) {
    await sendApprovalEmail({ to: user.email.trim(), ...emailPayload }, "support");
  }

  if (user?.phone?.trim()) {
    await sendApprovalWhatsApp({ phone: user.phone.trim(), message: whatsappMessage });
  }
}

/** Backfill in-app notification for profiles approved before notifications existed. */
export async function ensureApprovalNotification(profile: AdvisorProfileRecord | null) {
  if (!profile || profile.account_status !== "active" || !profile.approved_at) return;
  const exists = await hasNotificationKind(profile.user_id, "profile_approved");
  if (exists) return;
  await notifyProfileApproved(profile, { sendOutbound: false });
}

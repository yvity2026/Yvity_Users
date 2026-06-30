import "server-only";

import {
  buildPaymentSuccessEmail,
  buildPaymentSuccessWhatsAppMessage,
  buildPaymentFailedEmail,
  buildPaymentFailedWhatsAppMessage,
} from "@/lib/notifications/payment-message";
import { appendNotification } from "@/lib/server/notifications-store";
import { loadUserByIdFromDb } from "@/lib/server/supabase/platform-supabase";
import { sendApprovalEmail, sendApprovalWhatsApp } from "@/lib/server/outbound-messaging";
import type { PaymentRecord } from "@/lib/server/payment-store";
import { MEMBERSHIP_PLANS } from "@/lib/advisor-membership/plans";

function resolveBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3002"
  );
}

function planName(planId: string): string {
  return MEMBERSHIP_PLANS.find((p) => p.id === planId)?.name ?? planId;
}

export async function notifyPaymentSuccess(record: PaymentRecord): Promise<void> {
  const user = await loadUserByIdFromDb(record.user_id);
  const advisorName = user?.fullName?.trim() || "Advisor";
  const baseUrl = resolveBaseUrl();
  const dashboardUrl = `${baseUrl}/dashboard/my-space?tab=membership`;
  const invoiceId = `YVT-${record.id.slice(0, 8).toUpperCase()}`;
  const paidAt = record.paid_at ?? record.created_at;
  const plan = planName(record.plan_id);

  await appendNotification({
    userId: record.user_id,
    kind: "payment_success",
    title: `${plan} membership activated ✅`,
    message: `Payment of ₹${record.amount_inr.toLocaleString("en-IN")} confirmed. Invoice ${invoiceId} is available in your dashboard.`,
    href: "/dashboard/my-space?tab=membership",
    meta: {
      invoiceId,
      planId: record.plan_id,
      amountInr: String(record.amount_inr),
      paidAt,
    },
  });

  const emailPayload = buildPaymentSuccessEmail({
    advisorName,
    advisorEmail: user?.email ?? null,
    advisorPhone: user?.phone ?? null,
    planName: plan,
    planId: record.plan_id,
    amountInr: record.amount_inr,
    amountBeforeCouponInr: record.amount_before_coupon_inr ?? null,
    couponCode: record.coupon_code ?? null,
    couponDiscountInr: record.coupon_discount_inr ?? null,
    invoiceId,
    razorpayPaymentId: record.razorpay_payment_id ?? null,
    paidAt,
    dashboardUrl,
  });

  const whatsappMessage = buildPaymentSuccessWhatsAppMessage({
    advisorName,
    planName: plan,
    planId: record.plan_id,
    amountInr: record.amount_inr,
    amountBeforeCouponInr: record.amount_before_coupon_inr ?? null,
    couponCode: record.coupon_code ?? null,
    couponDiscountInr: record.coupon_discount_inr ?? null,
    invoiceId,
    razorpayPaymentId: record.razorpay_payment_id ?? null,
    paidAt,
    dashboardUrl,
  });

  if (user?.email?.trim()) {
    await sendApprovalEmail({ to: user.email.trim(), ...emailPayload }, "noreply").catch((err) =>
      console.error("[payment-notify] email failed:", err),
    );
  }

  if (user?.phone?.trim()) {
    await sendApprovalWhatsApp({
      phone: user.phone.trim(),
      message: whatsappMessage,
    }).catch((err) => console.error("[payment-notify] whatsapp failed:", err));
  }
}

export async function notifyPaymentFailed(input: {
  userId: string;
  planId: string;
}): Promise<void> {
  const user = await loadUserByIdFromDb(input.userId);
  const advisorName = user?.fullName?.trim() || "Advisor";
  const baseUrl = resolveBaseUrl();
  const retryUrl = `${baseUrl}/dashboard/my-space?tab=membership`;
  const plan = planName(input.planId);

  await appendNotification({
    userId: input.userId,
    kind: "payment_failed",
    title: "Payment failed — please retry",
    message: `Your payment for ${plan} membership could not be processed. Your account was not charged.`,
    href: "/dashboard/my-space?tab=membership",
    meta: { planId: input.planId },
  });

  const emailPayload = buildPaymentFailedEmail({ advisorName, planName: plan, retryUrl });
  const whatsappMessage = buildPaymentFailedWhatsAppMessage({
    advisorName,
    planName: plan,
    retryUrl,
  });

  if (user?.email?.trim()) {
    await sendApprovalEmail({ to: user.email.trim(), ...emailPayload }, "support").catch((err) =>
      console.error("[payment-notify] failure email failed:", err),
    );
  }

  if (user?.phone?.trim()) {
    await sendApprovalWhatsApp({
      phone: user.phone.trim(),
      message: whatsappMessage,
    }).catch((err) => console.error("[payment-notify] failure whatsapp failed:", err));
  }
}

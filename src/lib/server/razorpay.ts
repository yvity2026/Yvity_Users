import crypto from "crypto";
import Razorpay from "razorpay";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { MEMBERSHIP_PLANS } from "@/lib/advisor-membership/plans";

export function getRazorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID?.trim() ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ?? "";
}

export function getRazorpayKeySecret(): string {
  return process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
}

export function isRazorpayConfigured(): boolean {
  return Boolean(getRazorpayKeyId() && getRazorpayKeySecret());
}

export function getPlanAmountInr(planId: MembershipPlanId): number {
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
  return plan?.priceAnnualInr ?? 0;
}

export function getRazorpayClient(): Razorpay {
  const key_id = getRazorpayKeyId();
  const key_secret = getRazorpayKeySecret();
  if (!key_id || !key_secret) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  return new Razorpay({ key_id, key_secret });
}

export async function createRazorpayOrder(input: {
  userId: string;
  planId: "silver" | "gold";
  amountInr: number;
}): Promise<{ id: string; amount: number; currency: string }> {
  const client = getRazorpayClient();
  const amountPaise = input.amountInr * 100;
  const order = await client.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `yvity-${input.planId}-${input.userId.slice(0, 8)}-${Date.now()}`,
    notes: {
      user_id: input.userId,
      plan_id: input.planId,
    },
  });
  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
  };
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = getRazorpayKeySecret();
  if (!secret) return false;
  const payload = `${input.orderId}|${input.paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
  } catch {
    return expected === input.signature;
  }
}

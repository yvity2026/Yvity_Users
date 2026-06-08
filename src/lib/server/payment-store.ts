import { randomUUID } from "crypto";
import type { CheckoutKind } from "@/lib/advisor-membership/checkout-pricing";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  createPaymentInDb,
  findPaidPaymentForUser,
  findPaymentByOrderId,
  updatePaymentInDb,
} from "@/lib/server/supabase/payments-supabase";

const PAYMENTS_FILE = "advisor-payments.json";

export type PaymentRecordStatus = "created" | "paid" | "failed";

export type PaymentRecord = {
  id: string;
  user_id: string;
  plan_id: "silver" | "gold";
  amount_inr: number;
  amount_paise: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  status: PaymentRecordStatus;
  checkout_kind?: CheckoutKind;
  credit_inr?: number;
  from_plan_id?: MembershipPlanId | null;
  coupon_code?: string | null;
  coupon_discount_inr?: number;
  amount_before_coupon_inr?: number;
  created_at: string;
  paid_at: string | null;
};

type PaymentsDb = {
  payments: Record<string, PaymentRecord>;
};

function emptyDb(): PaymentsDb {
  return { payments: {} };
}

async function loadDb(): Promise<PaymentsDb> {
  return loadJsonFile(PAYMENTS_FILE, emptyDb());
}

async function saveDb(db: PaymentsDb) {
  await saveJsonFile(PAYMENTS_FILE, db);
}

export async function createPendingPayment(input: {
  userId: string;
  planId: "silver" | "gold";
  amountInr: number;
  razorpayOrderId: string;
  checkoutKind?: CheckoutKind;
  creditInr?: number;
  fromPlanId?: MembershipPlanId | null;
  couponCode?: string | null;
  couponDiscountInr?: number;
  amountBeforeCouponInr?: number;
}): Promise<PaymentRecord> {
  const record: PaymentRecord = {
    id: randomUUID(),
    user_id: input.userId,
    plan_id: input.planId,
    amount_inr: input.amountInr,
    amount_paise: input.amountInr * 100,
    razorpay_order_id: input.razorpayOrderId,
    razorpay_payment_id: null,
    status: "created",
    checkout_kind: input.checkoutKind,
    credit_inr: input.creditInr ?? 0,
    from_plan_id: input.fromPlanId ?? null,
    coupon_code: input.couponCode ?? null,
    coupon_discount_inr: input.couponDiscountInr ?? 0,
    amount_before_coupon_inr: input.amountBeforeCouponInr ?? input.amountInr,
    created_at: new Date().toISOString(),
    paid_at: null,
  };

  if (useSupabasePersistence()) {
    return createPaymentInDb(record);
  }

  const db = await loadDb();
  db.payments[record.id] = record;
  await saveDb(db);
  return record;
}

export async function markPaymentPaid(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}): Promise<PaymentRecord | null> {
  if (useSupabasePersistence()) {
    const record = await findPaymentByOrderId(input.razorpayOrderId);
    if (!record) return null;
    record.status = "paid";
    record.razorpay_payment_id = input.razorpayPaymentId;
    record.paid_at = new Date().toISOString();
    return updatePaymentInDb(record);
  }

  const db = await loadDb();
  const record = Object.values(db.payments).find(
    (p) => p.razorpay_order_id === input.razorpayOrderId,
  );
  if (!record) return null;

  record.status = "paid";
  record.razorpay_payment_id = input.razorpayPaymentId;
  record.paid_at = new Date().toISOString();
  db.payments[record.id] = record;
  await saveDb(db);
  return record;
}

export async function getPaidPaymentForUser(input: {
  userId: string;
  planId: MembershipPlanId;
  razorpayPaymentId: string;
}): Promise<PaymentRecord | null> {
  if (input.planId !== "silver" && input.planId !== "gold") return null;

  if (useSupabasePersistence()) {
    const paid = await findPaidPaymentForUser(input.userId);
    if (
      paid &&
      paid.plan_id === input.planId &&
      paid.razorpay_payment_id === input.razorpayPaymentId
    ) {
      return paid;
    }
    return null;
  }

  const db = await loadDb();
  return (
    Object.values(db.payments).find(
      (p) =>
        p.user_id === input.userId &&
        p.plan_id === input.planId &&
        p.razorpay_payment_id === input.razorpayPaymentId &&
        p.status === "paid",
    ) ?? null
  );
}

export async function listPaidPaymentsForUser(userId: string): Promise<PaymentRecord[]> {
  if (useSupabasePersistence()) {
    const paid = await findPaidPaymentForUser(userId);
    return paid ? [paid] : [];
  }

  const db = await loadDb();
  return Object.values(db.payments)
    .filter((p) => p.user_id === userId && p.status === "paid")
    .sort((a, b) => (b.paid_at ?? b.created_at).localeCompare(a.paid_at ?? a.created_at));
}

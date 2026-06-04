import { randomUUID } from "crypto";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";

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
}): Promise<PaymentRecord> {
  const db = await loadDb();
  const record: PaymentRecord = {
    id: randomUUID(),
    user_id: input.userId,
    plan_id: input.planId,
    amount_inr: input.amountInr,
    amount_paise: input.amountInr * 100,
    razorpay_order_id: input.razorpayOrderId,
    razorpay_payment_id: null,
    status: "created",
    created_at: new Date().toISOString(),
    paid_at: null,
  };
  db.payments[record.id] = record;
  await saveDb(db);
  return record;
}

export async function markPaymentPaid(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}): Promise<PaymentRecord | null> {
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

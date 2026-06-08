import "server-only";

import type { CheckoutKind } from "@/lib/advisor-membership/checkout-pricing";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import type { PaymentRecord, PaymentRecordStatus } from "@/lib/server/payment-store";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function mapRow(row: Record<string, unknown>): PaymentRecord {
  const metadata =
    row.metadata && typeof row.metadata === "object"
      ? (row.metadata as Record<string, unknown>)
      : {};

  return {
    id: String(row.id),
    user_id: String(row.user_id),
    plan_id: (String(row.plan_id || "silver") as "silver" | "gold"),
    amount_inr: Number(row.amount ?? 0),
    amount_paise: Number(row.amount ?? 0) * 100,
    razorpay_order_id: String(row.razorpay_order_id || ""),
    razorpay_payment_id: row.razorpay_payment_id ? String(row.razorpay_payment_id) : null,
    status: String(row.status || "created") as PaymentRecordStatus,
    checkout_kind: metadata.checkout_kind as CheckoutKind | undefined,
    credit_inr: metadata.credit_inr as number | undefined,
    from_plan_id: metadata.from_plan_id as MembershipPlanId | null | undefined,
    created_at: String(row.created_at || new Date().toISOString()),
    paid_at: row.paid_at ? String(row.paid_at) : null,
  };
}

function mapRecord(record: PaymentRecord): Record<string, unknown> {
  return {
    id: record.id,
    user_id: record.user_id,
    amount: record.amount_inr,
    currency: "INR",
    status: record.status,
    plan_id: record.plan_id,
    razorpay_order_id: record.razorpay_order_id,
    razorpay_payment_id: record.razorpay_payment_id,
    paid_at: record.paid_at,
    metadata: {
      checkout_kind: record.checkout_kind,
      credit_inr: record.credit_inr,
      from_plan_id: record.from_plan_id,
    },
    created_at: record.created_at,
    updated_at: record.paid_at ?? record.created_at,
  };
}

export async function createPaymentInDb(record: PaymentRecord): Promise<PaymentRecord> {
  const { data, error } = await client()
    .from("advisor_payments")
    .upsert(mapRecord(record), { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function findPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
  const { data, error } = await client()
    .from("advisor_payments")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function updatePaymentInDb(record: PaymentRecord): Promise<PaymentRecord> {
  const { data, error } = await client()
    .from("advisor_payments")
    .update(mapRecord(record))
    .eq("id", record.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function findPaidPaymentForUser(userId: string): Promise<PaymentRecord | null> {
  const { data, error } = await client()
    .from("advisor_payments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

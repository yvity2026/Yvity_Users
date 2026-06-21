import { randomUUID } from "crypto";
import { loadJsonFile, saveJsonFile, canUseLocalDataFiles } from "@/lib/server/json-store";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

const COUPONS_FILE = "coupons.json";

export type CouponDiscountType = "percent" | "fixed";
export type CouponStatus = "active" | "reserved" | "redeemed" | "revoked" | "expired";

export type CouponRecord = {
  id: string;
  code: string;
  label: string;
  discountType: CouponDiscountType;
  discountValue: number;
  appliesTo: string[];
  assignedEmail: string | null;
  assignedUserId: string | null;
  maxRedemptions: number;
  redemptionCount: number;
  status: CouponStatus;
  expiresAt: string | null;
  createdAt: string;
  createdByAdminId: string | null;
  reservedAt: string | null;
  reservedByUserId: string | null;
  reservedOrderId: string | null;
  redeemedAt: string | null;
  redeemedByUserId: string | null;
  redeemedByEmail: string | null;
  redeemedPaymentId: string | null;
};

type CouponsDb = {
  coupons: Record<string, CouponRecord>;
};

function emptyDb(): CouponsDb {
  return { coupons: {} };
}

function normalizeCouponCode(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function isExpired(coupon: CouponRecord, now = new Date()) {
  if (!coupon.expiresAt) return false;
  return new Date(coupon.expiresAt).getTime() < now.getTime();
}

function refreshCouponStatus(coupon: CouponRecord, now = new Date()): CouponRecord {
  if (coupon.status === "revoked" || coupon.status === "redeemed") return coupon;
  if (isExpired(coupon, now)) return { ...coupon, status: "expired" };
  return coupon;
}

function normalizeCoupon(record: Partial<CouponRecord> = {}): CouponRecord {
  const maxRedemptions = Math.max(1, Number(record.maxRedemptions) || 1);
  const redemptionCount = Math.max(0, Number(record.redemptionCount) || 0);

  return {
    id: record.id || randomUUID(),
    code: normalizeCouponCode(record.code),
    label: record.label || "",
    discountType: record.discountType === "fixed" ? "fixed" : "percent",
    discountValue: Number(record.discountValue) || 0,
    appliesTo: Array.isArray(record.appliesTo) ? record.appliesTo : [],
    assignedEmail: record.assignedEmail ? String(record.assignedEmail).trim().toLowerCase() : null,
    assignedUserId: record.assignedUserId || null,
    maxRedemptions,
    redemptionCount,
    status: (record.status as CouponStatus) || "active",
    expiresAt: record.expiresAt || null,
    createdAt: record.createdAt || new Date().toISOString(),
    createdByAdminId: record.createdByAdminId || null,
    reservedAt: record.reservedAt || null,
    reservedByUserId: record.reservedByUserId || null,
    reservedOrderId: record.reservedOrderId || null,
    redeemedAt: record.redeemedAt || null,
    redeemedByUserId: record.redeemedByUserId || null,
    redeemedByEmail: record.redeemedByEmail || null,
    redeemedPaymentId: record.redeemedPaymentId || null,
  };
}

export function computeCouponDiscountInr(baseAmountInr: number, coupon: CouponRecord) {
  const base = Math.max(0, Math.round(baseAmountInr));
  if (base <= 0) return 0;

  if (coupon.discountType === "fixed") {
    return Math.min(base, Math.round(coupon.discountValue));
  }

  const percent = Math.min(100, Math.max(0, coupon.discountValue));
  return Math.round((base * percent) / 100);
}

export function applyCouponToAmount(baseAmountInr: number, coupon: CouponRecord) {
  const discountInr = computeCouponDiscountInr(baseAmountInr, coupon);
  return {
    amountInr: Math.max(0, baseAmountInr - discountInr),
    discountInr,
  };
}

// ─── Supabase row mapper ────────────────────────────────────────────────────

function dbRowToCoupon(row: Record<string, unknown>): CouponRecord {
  return normalizeCoupon({
    id: String(row.id ?? ""),
    code: String(row.code ?? ""),
    label: String(row.label ?? ""),
    discountType: row.discount_type as CouponDiscountType,
    discountValue: Number(row.discount_value ?? 0),
    appliesTo: Array.isArray(row.applies_to) ? row.applies_to as string[] : [],
    assignedEmail: row.assigned_email ? String(row.assigned_email) : null,
    assignedUserId: row.assigned_user_id ? String(row.assigned_user_id) : null,
    maxRedemptions: Number(row.max_redemptions ?? 1),
    redemptionCount: Number(row.redemption_count ?? 0),
    status: String(row.status ?? "active") as CouponStatus,
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    createdAt: row.created_at ? String(row.created_at) : new Date().toISOString(),
    createdByAdminId: row.created_by_admin_id ? String(row.created_by_admin_id) : null,
    reservedAt: row.reserved_at ? String(row.reserved_at) : null,
    reservedByUserId: row.reserved_by_user_id ? String(row.reserved_by_user_id) : null,
    reservedOrderId: row.reserved_order_id ? String(row.reserved_order_id) : null,
    redeemedAt: row.redeemed_at ? String(row.redeemed_at) : null,
    redeemedByUserId: row.redeemed_by_user_id ? String(row.redeemed_by_user_id) : null,
    redeemedByEmail: row.redeemed_by_email ? String(row.redeemed_by_email) : null,
    redeemedPaymentId: row.redeemed_payment_id ? String(row.redeemed_payment_id) : null,
  });
}

// ─── Local JSON helpers (dev only) ─────────────────────────────────────────

async function loadDb() {
  return loadJsonFile<CouponsDb>(COUPONS_FILE, emptyDb());
}

async function saveDb(db: CouponsDb) {
  await saveJsonFile(COUPONS_FILE, db);
}

async function findCouponByCodeLocal(code: string): Promise<CouponRecord | null> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;
  const db = await loadDb();
  return (
    Object.values(db.coupons).find((item) => normalizeCouponCode(item.code) === normalized) ?? null
  );
}

// ─── Supabase helpers (Vercel/production) ──────────────────────────────────

async function findCouponByCodeFromDb(code: string): Promise<CouponRecord | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return null;
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();
  if (!data) return null;
  return dbRowToCoupon(data as Record<string, unknown>);
}

async function reserveCouponInDb(
  couponId: string,
  input: { userId: string; userEmail?: string | null; planId: string; orderId: string },
): Promise<{ coupon: CouponRecord } | { error: string }> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return { error: "Database not available" };

  const { data: updated, error } = await supabase
    .from("coupons")
    .update({
      status: "reserved",
      reserved_at: new Date().toISOString(),
      reserved_by_user_id: input.userId,
      reserved_order_id: input.orderId,
    })
    .eq("id", couponId)
    .select()
    .single();

  if (error || !updated) return { error: "Failed to reserve coupon" };
  return { coupon: dbRowToCoupon(updated as Record<string, unknown>) };
}

async function redeemCouponInDb(
  couponId: string,
  currentCount: number,
  maxRedemptions: number,
  input: { userId: string; userEmail?: string | null; paymentId?: string },
): Promise<{ success: true; coupon: CouponRecord } | { error: string }> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return { error: "Database not available" };

  const nextCount = currentCount + 1;
  const { data: updated, error } = await supabase
    .from("coupons")
    .update({
      redemption_count: nextCount,
      redeemed_at: new Date().toISOString(),
      redeemed_by_user_id: input.userId,
      redeemed_by_email: input.userEmail?.trim().toLowerCase() ?? null,
      redeemed_payment_id: input.paymentId ?? null,
      reserved_at: null,
      reserved_by_user_id: null,
      reserved_order_id: null,
      status: nextCount >= maxRedemptions ? "redeemed" : "active",
    })
    .eq("id", couponId)
    .select()
    .single();

  if (error || !updated) return { error: "Failed to redeem coupon" };
  return { success: true, coupon: dbRowToCoupon(updated as Record<string, unknown>) };
}

// ─── Validation (shared) ────────────────────────────────────────────────────

function validateCouponForCheckout(
  coupon: CouponRecord,
  input: {
    userId?: string;
    userEmail?: string | null;
    planId?: string;
    now?: Date;
  },
) {
  const now = input.now || new Date();
  const refreshed = refreshCouponStatus(normalizeCoupon(coupon), now);

  if (refreshed.status === "revoked") return "This coupon has been revoked";
  if (refreshed.status === "redeemed") return "This coupon has already been used";
  if (refreshed.status === "expired" || isExpired(refreshed, now)) {
    return "This coupon has expired";
  }
  if (refreshed.redemptionCount >= refreshed.maxRedemptions) {
    return "This coupon has already been used";
  }

  if (refreshed.status === "reserved") {
    const sameUser = input.userId && refreshed.reservedByUserId === input.userId;
    if (!sameUser) return "This coupon is already reserved for checkout";
  } else if (refreshed.status !== "active") {
    return "This coupon is not available";
  }

  const planId = String(input.planId || "").toLowerCase();
  if (refreshed.appliesTo.length > 0 && planId && !refreshed.appliesTo.includes(planId)) {
    return `This coupon does not apply to the ${planId} plan`;
  }

  if (refreshed.assignedUserId && input.userId && refreshed.assignedUserId !== input.userId) {
    return "This coupon is assigned to another advisor";
  }

  if (refreshed.assignedEmail && input.userEmail) {
    if (refreshed.assignedEmail !== input.userEmail.trim().toLowerCase()) {
      return "This coupon is assigned to a different email address";
    }
  }

  if (refreshed.discountValue <= 0) return "This coupon has no discount configured";
  return null;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function previewCouponDiscount(
  code: string,
  input: {
    baseAmountInr: number;
    userId?: string;
    userEmail?: string | null;
    planId?: string;
  },
) {
  const coupon = canUseLocalDataFiles()
    ? await findCouponByCodeLocal(code)
    : await findCouponByCodeFromDb(code);

  if (!coupon) return { error: "Coupon not found" as const };

  const validationError = validateCouponForCheckout(coupon, input);
  if (validationError) return { error: validationError };

  const refreshed = refreshCouponStatus(normalizeCoupon(coupon));
  const applied = applyCouponToAmount(input.baseAmountInr, refreshed);

  return {
    coupon: refreshed,
    baseAmountInr: input.baseAmountInr,
    amountInr: applied.amountInr,
    discountInr: applied.discountInr,
  };
}

export async function reserveCouponForOrder(
  code: string,
  input: {
    userId: string;
    userEmail?: string | null;
    planId: string;
    orderId: string;
  },
) {
  const coupon = canUseLocalDataFiles()
    ? await findCouponByCodeLocal(code)
    : await findCouponByCodeFromDb(code);

  if (!coupon) return { error: "Coupon not found" as const };

  const validationError = validateCouponForCheckout(coupon, input);
  if (validationError) return { error: validationError };

  if (canUseLocalDataFiles()) {
    // Local JSON path
    const db = await loadDb();
    const record = db.coupons[coupon.id];
    if (!record) return { error: "Coupon not found" as const };

    if (record.status === "reserved" && record.reservedByUserId === input.userId) {
      record.reservedAt = new Date().toISOString();
      record.reservedOrderId = input.orderId;
      await saveDb(db);
      return { coupon: record };
    }

    record.status = "reserved";
    record.reservedAt = new Date().toISOString();
    record.reservedByUserId = input.userId;
    record.reservedOrderId = input.orderId;
    await saveDb(db);
    return { coupon: record };
  }

  // Supabase path
  if (coupon.status === "reserved" && coupon.reservedByUserId === input.userId) {
    return reserveCouponInDb(coupon.id, { ...input, orderId: input.orderId });
  }
  return reserveCouponInDb(coupon.id, input);
}

export async function redeemCoupon(
  code: string,
  input: {
    userId: string;
    userEmail?: string | null;
    paymentId?: string;
  },
) {
  const coupon = canUseLocalDataFiles()
    ? await findCouponByCodeLocal(code)
    : await findCouponByCodeFromDb(code);

  if (!coupon) return { error: "Coupon not found" as const };

  if (canUseLocalDataFiles()) {
    // Local JSON path
    const db = await loadDb();
    const record = db.coupons[coupon.id];
    if (!record) return { error: "Coupon not found" as const };

    if (record.status === "redeemed" || record.redemptionCount >= record.maxRedemptions) {
      return { error: "Coupon already redeemed" as const };
    }
    if (record.status === "reserved" && record.reservedByUserId !== input.userId) {
      return { error: "Coupon reserved by another user" as const };
    }

    const nextCount = record.redemptionCount + 1;
    record.redemptionCount = nextCount;
    record.redeemedAt = new Date().toISOString();
    record.redeemedByUserId = input.userId;
    record.redeemedByEmail = input.userEmail?.trim().toLowerCase() || null;
    record.redeemedPaymentId = input.paymentId || null;
    record.reservedAt = null;
    record.reservedByUserId = null;
    record.reservedOrderId = null;
    record.status = nextCount >= record.maxRedemptions ? "redeemed" : "active";
    await saveDb(db);
    return { success: true as const, coupon: record };
  }

  // Supabase path
  if (coupon.status === "redeemed" || coupon.redemptionCount >= coupon.maxRedemptions) {
    return { error: "Coupon already redeemed" as const };
  }
  if (coupon.status === "reserved" && coupon.reservedByUserId !== input.userId) {
    return { error: "Coupon reserved by another user" as const };
  }

  return redeemCouponInDb(coupon.id, coupon.redemptionCount, coupon.maxRedemptions, input);
}

import { randomUUID } from "crypto";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";

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

async function loadDb() {
  return loadJsonFile<CouponsDb>(COUPONS_FILE, emptyDb());
}

async function saveDb(db: CouponsDb) {
  await saveJsonFile(COUPONS_FILE, db);
}

async function findCouponByCode(code: string) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;
  const db = await loadDb();
  return (
    Object.values(db.coupons).find((item) => normalizeCouponCode(item.code) === normalized) ?? null
  );
}

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

export async function previewCouponDiscount(
  code: string,
  input: {
    baseAmountInr: number;
    userId?: string;
    userEmail?: string | null;
    planId?: string;
  },
) {
  const coupon = await findCouponByCode(code);
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
  const db = await loadDb();
  const coupon = await findCouponByCode(code);
  if (!coupon) return { error: "Coupon not found" as const };

  const validationError = validateCouponForCheckout(coupon, input);
  if (validationError) return { error: validationError };

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

export async function redeemCoupon(
  code: string,
  input: {
    userId: string;
    userEmail?: string | null;
    paymentId?: string;
  },
) {
  const db = await loadDb();
  const coupon = await findCouponByCode(code);
  if (!coupon) return { error: "Coupon not found" as const };

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

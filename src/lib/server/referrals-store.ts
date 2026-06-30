import { randomBytes, randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { canUseLocalDataFiles } from "@/lib/server/json-store";
import type { AmbassadorDashboardData } from "@/lib/advisor/ambassador-types";
import type { PaymentRecord } from "@/lib/server/payment-store";
import { evaluateAndGrantRewardsForUser } from "@/lib/server/reward-engine";
import { listPaidPaymentsForUser } from "@/lib/server/payment-store";
import { loadRegistrationDb, mutateRegistrationDb, type RegisteredUser } from "@/lib/server/registration-store";
import {
  loadAmbassadorFromDb,
  findAmbassadorByCodeFromDb,
  upsertAmbassadorInDb,
  incrementAmbassadorTotalInDb,
  insertReferralInDb,
  loadReferralsForAmbassadorFromDb,
  loadReferralForUserFromDb,
  updateReferralStatusInDb,
  type AmbassadorRow,
  type ReferralRow,
} from "@/lib/server/supabase/referrals-supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const CONFIG_FILE = "ambassador-program-config.json";
const AMBASSADORS_FILE = "ambassadors.json";
const REFERRALS_FILE = "referrals.json";
const REWARDS_FILE = "ambassador-rewards.json";

type ProgramConfig = {
  status?: string;
  referralRules?: {
    qualifyingPlans?: string[];
    qualifyingCheckoutKinds?: string[];
    attributionWindowDays?: number;
    linkParam?: string;
  };
  rewardRules?: {
    onQualifiedReferral?: {
      rewardType?: string;
      discountType?: string;
      discountValue?: number;
      appliesTo?: string[];
      label?: string;
    };
  };
};

type AmbassadorRecord = {
  id: string;
  userId: string;
  referralCode: string;
  status: string;
  totalReferrals: number;
  successfulReferrals: number;
  createdAt: string;
  promotedAt: string;
  referralLink?: string;
};

type ReferralRecord = {
  id: string;
  referrerUserId: string;
  referrerCode: string;
  referredUserId: string;
  referredUserName: string;
  registeredAt: string;
  planPurchased: string | null;
  purchasedAt: string | null;
  paymentId: string | null;
  status: "registered" | "qualified" | "expired" | "invalid";
  rewardId: string | null;
};

type RewardRecord = {
  id: string;
  referralId: string;
  referrerUserId: string;
  rewardType: string;
  status: string;
  couponCode: string | null;
  amountInr: number | null;
  createdAt: string;
  issuedAt: string | null;
  notes?: string;
};

function readJsonFile<T>(filename: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filename: string, data: T) {
  if (!canUseLocalDataFiles()) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Read-only filesystem (Vercel)
  }
}

function normalizeReferralCode(value: string) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function generateAdvisorReferralCode(prefix = "YVITY-REF") {
  const token = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${token}`;
}

function loadConfig(): ProgramConfig {
  const data = readJsonFile<{ config?: ProgramConfig }>(CONFIG_FILE, {});
  return data.config || { status: "active" };
}

function loadAmbassadorsDb() {
  return readJsonFile(AMBASSADORS_FILE, { ambassadors: {} as Record<string, AmbassadorRecord> });
}

function saveAmbassadorsDb(db: { ambassadors: Record<string, AmbassadorRecord> }) {
  writeJsonFile(AMBASSADORS_FILE, db);
}

function loadReferralsDb() {
  return readJsonFile(REFERRALS_FILE, { referrals: {} as Record<string, ReferralRecord> });
}

function saveReferralsDb(db: { referrals: Record<string, ReferralRecord> }) {
  writeJsonFile(REFERRALS_FILE, db);
}

function loadRewardsDb() {
  return readJsonFile(REWARDS_FILE, { rewards: {} as Record<string, RewardRecord> });
}

function saveRewardsDb(db: { rewards: Record<string, RewardRecord> }) {
  writeJsonFile(REWARDS_FILE, db);
}

function buildReferralLink(code: string): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3002"
  ).replace(/\/$/, "");
  const param = loadConfig().referralRules?.linkParam || "ref";
  return `${base}/register?${param}=${encodeURIComponent(code)}`;
}

function ambassadorRowToRecord(row: AmbassadorRow): AmbassadorRecord {
  return {
    id: row.id,
    userId: row.userId,
    referralCode: row.referralCode,
    status: row.status,
    totalReferrals: row.totalReferrals,
    successfulReferrals: row.successfulReferrals,
    createdAt: row.createdAt,
    promotedAt: row.promotedAt,
    referralLink: row.referralLink ?? undefined,
  };
}

function referralRowToRecord(row: ReferralRow): ReferralRecord {
  return {
    id: row.id,
    referrerUserId: row.referrerUserId,
    referrerCode: row.referrerCode,
    referredUserId: row.referredUserId,
    referredUserName: row.referredUserName,
    registeredAt: row.registeredAt,
    planPurchased: row.planPurchased,
    purchasedAt: row.purchasedAt,
    paymentId: row.paymentId,
    status: row.status,
    rewardId: row.rewardId,
  };
}

export type { AmbassadorDashboardData } from "@/lib/advisor/ambassador-types";

export async function ensureAmbassadorForUser(userId: string): Promise<AmbassadorRecord> {
  // Try Supabase first
  const fromDb = await loadAmbassadorFromDb(userId);
  if (fromDb) {
    const record = ambassadorRowToRecord(fromDb);
    if (!record.referralLink) {
      record.referralLink = buildReferralLink(record.referralCode);
    }
    return record;
  }

  // Fall back to local file (dev environment)
  const ambassadorsDb = loadAmbassadorsDb();
  const existing = ambassadorsDb.ambassadors[userId];
  if (existing) {
    if (!existing.referralLink) {
      existing.referralLink = buildReferralLink(existing.referralCode);
    }
    // Sync local record to Supabase if it exists locally but not in DB
    await upsertAmbassadorInDb({
      id: existing.id,
      userId: existing.userId,
      referralCode: existing.referralCode,
      status: existing.status,
      totalReferrals: existing.totalReferrals,
      successfulReferrals: existing.successfulReferrals,
      referralLink: existing.referralLink ?? null,
      createdAt: existing.createdAt,
      promotedAt: existing.promotedAt,
    });
    return existing;
  }

  // Create new ambassador
  const code = generateAdvisorReferralCode();
  const now = new Date().toISOString();
  const ambassador: AmbassadorRecord = {
    id: randomUUID(),
    userId,
    referralCode: code,
    status: "active",
    totalReferrals: 0,
    successfulReferrals: 0,
    createdAt: now,
    promotedAt: now,
    referralLink: buildReferralLink(code),
  };

  // Persist to Supabase
  await upsertAmbassadorInDb({
    id: ambassador.id,
    userId: ambassador.userId,
    referralCode: ambassador.referralCode,
    status: ambassador.status,
    totalReferrals: ambassador.totalReferrals,
    successfulReferrals: ambassador.successfulReferrals,
    referralLink: ambassador.referralLink ?? null,
    createdAt: ambassador.createdAt,
    promotedAt: ambassador.promotedAt,
  });

  // Also write locally in dev
  ambassadorsDb.ambassadors[userId] = ambassador;
  saveAmbassadorsDb(ambassadorsDb);

  return ambassador;
}

export async function getAmbassadorDashboardForUser(userId: string): Promise<AmbassadorDashboardData> {
  const config = loadConfig();
  const programActive = config.status !== "paused";
  const qualifyingPlans = config.referralRules?.qualifyingPlans || ["silver", "gold"];
  const ambassador = await ensureAmbassadorForUser(userId);

  // Load referrals from Supabase
  const dbReferrals = await loadReferralsForAmbassadorFromDb(userId);
  const referrals: ReferralRecord[] = dbReferrals.length > 0
    ? dbReferrals.map(referralRowToRecord)
    : Object.values(loadReferralsDb().referrals).filter((row) => row.referrerUserId === userId);

  const pendingRewards = Object.values(loadRewardsDb().rewards).filter(
    (row) =>
      row.referrerUserId === userId && (row.status === "pending" || row.status === "approved"),
  );
  const freeReferrals = referrals.filter((row) => row.status === "registered").length;

  return {
    referralCode: ambassador.referralCode,
    referralLink: ambassador.referralLink || buildReferralLink(ambassador.referralCode),
    totalReferrals: ambassador.totalReferrals || referrals.length,
    successfulReferrals:
      ambassador.successfulReferrals ||
      referrals.filter((row) => row.status === "qualified").length,
    pendingReferrals: freeReferrals,
    freeReferrals,
    pendingRewards: pendingRewards.length,
    programActive,
    rewardsQualifyOn: qualifyingPlans,
    recentReferrals: referrals
      .sort((a, b) => String(b.registeredAt).localeCompare(String(a.registeredAt)))
      .slice(0, 5)
      .map((row) => ({
        name: row.referredUserName,
        status: row.status,
        planPurchased: row.planPurchased,
        registeredAt: row.registeredAt,
      })),
  };
}

export async function findAmbassadorByReferralCode(code: string): Promise<AmbassadorRecord | null> {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return null;

  // Try Supabase first
  const fromDb = await findAmbassadorByCodeFromDb(normalized);
  if (fromDb) return ambassadorRowToRecord(fromDb);

  // Fall back to local file
  const db = loadAmbassadorsDb();
  return (
    Object.values(db.ambassadors).find(
      (item) => normalizeReferralCode(item.referralCode) === normalized && item.status === "active",
    ) ?? null
  );
}

export async function recordReferralOnRegistration(input: {
  referredUser: RegisteredUser;
  referralCode?: string | null;
}) {
  const config = loadConfig();
  if (config.status === "paused") return null;

  const code = normalizeReferralCode(input.referralCode || "");
  if (!code) return null;

  const ambassador = await findAmbassadorByReferralCode(code);
  if (!ambassador || ambassador.userId === input.referredUser.id) return null;

  // Check if this user was already referred (Supabase first, then local)
  const existingInDb = await loadReferralForUserFromDb(input.referredUser.id);
  if (existingInDb) return referralRowToRecord(existingInDb);

  const referralsDb = loadReferralsDb();
  const existingLocal = Object.values(referralsDb.referrals).find(
    (row) => row.referredUserId === input.referredUser.id,
  );
  if (existingLocal) return existingLocal;

  const referralId = randomUUID();
  const referral: ReferralRecord = {
    id: referralId,
    referrerUserId: ambassador.userId,
    referrerCode: ambassador.referralCode,
    referredUserId: input.referredUser.id,
    referredUserName: input.referredUser.fullName,
    registeredAt: new Date().toISOString(),
    planPurchased: null,
    purchasedAt: null,
    paymentId: null,
    status: "registered",
    rewardId: null,
  };

  // Persist to Supabase
  await insertReferralInDb({
    id: referral.id,
    referrerUserId: referral.referrerUserId,
    referrerCode: referral.referrerCode,
    referredUserId: referral.referredUserId,
    referredUserName: referral.referredUserName,
    registeredAt: referral.registeredAt,
    planPurchased: null,
    purchasedAt: null,
    paymentId: null,
    status: "registered",
    rewardId: null,
  });
  await incrementAmbassadorTotalInDb(ambassador.userId, "total_referrals");

  // Also write locally in dev
  referralsDb.referrals[referralId] = referral;
  saveReferralsDb(referralsDb);

  const ambassadorsDb = loadAmbassadorsDb();
  const record = ambassadorsDb.ambassadors[ambassador.userId];
  if (record) {
    record.totalReferrals = (record.totalReferrals || 0) + 1;
    ambassadorsDb.ambassadors[ambassador.userId] = record;
    saveAmbassadorsDb(ambassadorsDb);
  }

  mutateRegistrationDb((db) => {
    const index = db.users.findIndex((user) => user.id === input.referredUser.id);
    if (index >= 0) {
      db.users[index] = {
        ...db.users[index],
        referral_code: code,
        referred_by: ambassador.userId,
      };
    }
  });

  return referral;
}

export async function qualifyReferralOnPayment(input: {
  userId: string;
  payment: PaymentRecord;
}) {
  const config = loadConfig();
  if (config.status === "paused") return null;

  const qualifyingPlans = config.referralRules?.qualifyingPlans || ["silver", "gold"];
  const qualifyingKinds = config.referralRules?.qualifyingCheckoutKinds || ["purchase"];

  if (!qualifyingPlans.includes(input.payment.plan_id)) return null;
  if (input.payment.checkout_kind && !qualifyingKinds.includes(input.payment.checkout_kind)) {
    return null;
  }

  const paidPayments = await listPaidPaymentsForUser(input.userId);
  const qualifyingPaid = paidPayments.filter(
    (payment) =>
      payment.status === "paid" &&
      qualifyingPlans.includes(payment.plan_id) &&
      (!payment.checkout_kind || qualifyingKinds.includes(payment.checkout_kind)),
  );

  if (qualifyingPaid.length !== 1 || qualifyingPaid[0].id !== input.payment.id) {
    return null;
  }

  // Find referral in Supabase
  const dbReferral = await loadReferralForUserFromDb(input.userId);
  const referral = dbReferral
    ? referralRowToRecord(dbReferral)
    : Object.values(loadReferralsDb().referrals).find(
        (row) => row.referredUserId === input.userId && row.status === "registered",
      );

  if (!referral || referral.status !== "registered") return null;

  const updates = {
    status: "qualified" as const,
    planPurchased: input.payment.plan_id,
    purchasedAt: input.payment.paid_at || new Date().toISOString(),
    paymentId: input.payment.razorpay_payment_id || input.payment.id,
    rewardId: referral.rewardId,
  };

  // Update Supabase
  await updateReferralStatusInDb(referral.id, updates);
  await incrementAmbassadorTotalInDb(referral.referrerUserId, "successful_referrals");

  // Update local file in dev
  const referralsDb = loadReferralsDb();
  if (referralsDb.referrals[referral.id]) {
    referralsDb.referrals[referral.id] = { ...referral, ...updates };
    saveReferralsDb(referralsDb);
  }

  const ambassadorsDb = loadAmbassadorsDb();
  const ambassador = ambassadorsDb.ambassadors[referral.referrerUserId];
  if (ambassador) {
    ambassador.successfulReferrals = (ambassador.successfulReferrals || 0) + 1;
    ambassadorsDb.ambassadors[referral.referrerUserId] = ambassador;
    saveAmbassadorsDb(ambassadorsDb);
  }

  const engineGrants = evaluateAndGrantRewardsForUser(referral.referrerUserId);

  return {
    referral: { ...referral, ...updates },
    grants: engineGrants.grants,
  };
}

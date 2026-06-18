import { randomBytes, randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { canUseLocalDataFiles } from "@/lib/server/json-store";
import type { AmbassadorDashboardData } from "@/lib/advisor/ambassador-types";
import type { PaymentRecord } from "@/lib/server/payment-store";
import { evaluateAndGrantRewardsForUser } from "@/lib/server/reward-engine";
import { listPaidPaymentsForUser } from "@/lib/server/payment-store";
import { loadRegistrationDb, mutateRegistrationDb, type RegisteredUser } from "@/lib/server/registration-store";

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

export type { AmbassadorDashboardData } from "@/lib/advisor/ambassador-types";

export function ensureAmbassadorForUser(userId: string): AmbassadorRecord {
  const ambassadorsDb = loadAmbassadorsDb();
  const existing = ambassadorsDb.ambassadors[userId];
  if (existing) {
    if (!existing.referralLink) {
      existing.referralLink = buildReferralLink(existing.referralCode);
      ambassadorsDb.ambassadors[userId] = existing;
      saveAmbassadorsDb(ambassadorsDb);
    }
    return existing;
  }

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

  ambassadorsDb.ambassadors[userId] = ambassador;
  saveAmbassadorsDb(ambassadorsDb);
  return ambassador;
}

export function getAmbassadorDashboardForUser(userId: string): AmbassadorDashboardData {
  const config = loadConfig();
  const programActive = config.status !== "paused";
  const qualifyingPlans = config.referralRules?.qualifyingPlans || ["silver", "gold"];
  const ambassador = ensureAmbassadorForUser(userId);

  const referrals = Object.values(loadReferralsDb().referrals).filter(
    (row) => row.referrerUserId === userId,
  );
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

export function findAmbassadorByReferralCode(code: string): AmbassadorRecord | null {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return null;
  const db = loadAmbassadorsDb();
  return (
    Object.values(db.ambassadors).find(
      (item) => normalizeReferralCode(item.referralCode) === normalized && item.status === "active",
    ) ?? null
  );
}

export function recordReferralOnRegistration(input: {
  referredUser: RegisteredUser;
  referralCode?: string | null;
}) {
  const config = loadConfig();
  if (config.status === "paused") return null;

  const code = normalizeReferralCode(input.referralCode || "");
  if (!code) return null;

  const ambassador = findAmbassadorByReferralCode(code);
  if (!ambassador || ambassador.userId === input.referredUser.id) return null;

  const referralsDb = loadReferralsDb();
  const existing = Object.values(referralsDb.referrals).find(
    (row) => row.referredUserId === input.referredUser.id,
  );
  if (existing) return existing;

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

  const referralsDb = loadReferralsDb();
  const referral = Object.values(referralsDb.referrals).find(
    (row) => row.referredUserId === input.userId && row.status === "registered",
  );
  if (!referral) return null;

  referralsDb.referrals[referral.id] = {
    ...referral,
    status: "qualified",
    planPurchased: input.payment.plan_id,
    purchasedAt: input.payment.paid_at || new Date().toISOString(),
    paymentId: input.payment.razorpay_payment_id || input.payment.id,
    rewardId: referral.rewardId,
  };
  saveReferralsDb(referralsDb);

  const ambassadorsDb = loadAmbassadorsDb();
  const ambassador = ambassadorsDb.ambassadors[referral.referrerUserId];
  if (ambassador) {
    ambassador.successfulReferrals = (ambassador.successfulReferrals || 0) + 1;
    ambassadorsDb.ambassadors[referral.referrerUserId] = ambassador;
    saveAmbassadorsDb(ambassadorsDb);
  }

  const engineGrants = evaluateAndGrantRewardsForUser(referral.referrerUserId);

  return {
    referral: referralsDb.referrals[referral.id],
    grants: engineGrants.grants,
  };
}

import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { canUseLocalDataFiles } from "@/lib/server/json-store";

const DATA_DIR = path.join(process.cwd(), ".data");
const REWARD_ENGINE_FILE = "reward-engine-campaigns.json";
const REWARDS_FILE = "ambassador-rewards.json";
const REFERRALS_FILE = "referrals.json";
const PROFILES_FILE = "advisor-profiles.json";
const COUPONS_FILE = "coupons.json";
const REGISTRATION_FILE = "registration.json";

type RewardCampaign = {
  id: string;
  name: string;
  description?: string;
  referralTarget: number;
  rewardType: string;
  rewardValue: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
};

type EarnedReward = {
  id: string;
  referrerUserId: string;
  campaignId: string;
  campaignName: string;
  referralTarget: number;
  rewardType: string;
  rewardValue: string;
  successfulReferralsAtGrant: number;
  status: string;
  couponCode: string | null;
  fulfillmentNotes: string;
  createdAt: string;
  issuedAt: string;
  claimedAt: string | null;
  source: string;
};

function readJson<T>(filename: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(filename: string, data: T) {
  if (!canUseLocalDataFiles()) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Read-only filesystem (Vercel)
  }
}

function computeEffectiveStatus(campaign: RewardCampaign, now = new Date()) {
  if (campaign.status === "paused") return "paused";
  const end = campaign.endDate ? new Date(campaign.endDate) : null;
  const start = campaign.startDate ? new Date(campaign.startDate) : null;
  if (end && end.getTime() < now.getTime()) return "expired";
  if (start && start.getTime() > now.getTime()) return "paused";
  return campaign.status === "active" ? "active" : "paused";
}

function countSuccessfulReferrals(userId: string) {
  const db = readJson(REFERRALS_FILE, { referrals: {} as Record<string, { referrerUserId: string; status: string }> });
  return Object.values(db.referrals).filter(
    (row) => row.referrerUserId === userId && row.status === "qualified",
  ).length;
}

function hasExistingGrant(userId: string, campaignId: string) {
  const db = readJson(REWARDS_FILE, { rewards: {} as Record<string, EarnedReward> });
  return Object.values(db.rewards).some(
    (row) => row.referrerUserId === userId && row.campaignId === campaignId,
  );
}

function parseMonths(value: string) {
  const match = String(value).match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

function parseCoupon(value: string) {
  const percentMatch = String(value).match(/(\d+)\s*%/);
  if (percentMatch) return { discountType: "percent" as const, discountValue: Number(percentMatch[1]) };
  const inrMatch = String(value).match(/₹\s*(\d+)/i);
  if (inrMatch) return { discountType: "fixed" as const, discountValue: Number(inrMatch[1]) };
  return { discountType: "percent" as const, discountValue: 10 };
}

function normalizeCouponCode(value: string) {
  return String(value).trim().toUpperCase().replace(/\s+/g, "");
}

function generateCouponCode() {
  const token = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `YVITY-${token}`;
}

function findUserEmail(userId: string) {
  const db = readJson(REGISTRATION_FILE, { users: [] as Array<{ id: string; email?: string }> });
  return db.users.find((user) => user.id === userId)?.email || null;
}

function createAssignedCoupon(userId: string, campaign: RewardCampaign) {
  const parsed = parseCoupon(campaign.rewardValue);
  const db = readJson(COUPONS_FILE, { coupons: {} as Record<string, unknown> });
  const id = randomUUID();
  const code = generateCouponCode();
  db.coupons[id] = {
    id,
    code: normalizeCouponCode(code),
    label: `Reward · ${campaign.name}`,
    discountType: parsed.discountType,
    discountValue: parsed.discountValue,
    appliesTo: ["silver", "gold"],
    assignedEmail: findUserEmail(userId),
    assignedUserId: userId,
    maxRedemptions: 1,
    redemptionCount: 0,
    status: "active",
    expiresAt: null,
    createdAt: new Date().toISOString(),
    createdByAdminId: "reward-engine",
  };
  writeJson(COUPONS_FILE, db);
  return normalizeCouponCode(code);
}

function applyPlanExtension(userId: string, plan: string, months: number) {
  const db = readJson(PROFILES_FILE, { profiles: {} as Record<string, Record<string, unknown>> });
  const profile = db.profiles[userId] || { userId };
  const extensions = Array.isArray(profile.plan_extensions) ? [...profile.plan_extensions] : [];
  extensions.push({ plan, months, grantedAt: new Date().toISOString(), source: "reward-engine" });
  db.profiles[userId] = { ...profile, plan_extensions: extensions };
  writeJson(PROFILES_FILE, db);
}

function applyPlanUpgrade(userId: string, plan: string) {
  const db = readJson(PROFILES_FILE, { profiles: {} as Record<string, Record<string, unknown>> });
  const profile = db.profiles[userId] || { userId };
  db.profiles[userId] = {
    ...profile,
    subscription_plan: plan,
    upgraded_via_reward_at: new Date().toISOString(),
  };
  writeJson(PROFILES_FILE, db);
}

function fulfill(campaign: RewardCampaign, userId: string) {
  switch (campaign.rewardType) {
    case "discount_coupon": {
      const code = createAssignedCoupon(userId, campaign);
      return { couponCode: code, fulfillmentNotes: `Coupon ${code} · ${campaign.rewardValue}` };
    }
    case "free_silver_extension": {
      const months = parseMonths(campaign.rewardValue);
      applyPlanExtension(userId, "silver", months);
      return { couponCode: null, fulfillmentNotes: `${months} month(s) Silver extension` };
    }
    case "free_gold_extension": {
      const months = parseMonths(campaign.rewardValue);
      applyPlanExtension(userId, "gold", months);
      return { couponCode: null, fulfillmentNotes: `${months} month(s) Gold extension` };
    }
    case "silver_upgrade":
      applyPlanUpgrade(userId, "silver");
      return { couponCode: null, fulfillmentNotes: "Silver plan upgrade applied" };
    case "gold_upgrade":
      applyPlanUpgrade(userId, "gold");
      return { couponCode: null, fulfillmentNotes: "Gold plan upgrade applied" };
    case "feature_unlock":
      return { couponCode: null, fulfillmentNotes: `Feature unlock: ${campaign.rewardValue}` };
    default:
      return { couponCode: null, fulfillmentNotes: campaign.rewardValue };
  }
}

export function evaluateAndGrantRewardsForUser(userId: string) {
  const engineDb = readJson(REWARD_ENGINE_FILE, { campaigns: {} as Record<string, RewardCampaign> });
  const successfulCount = countSuccessfulReferrals(userId);
  const grants: EarnedReward[] = [];

  for (const campaign of Object.values(engineDb.campaigns)) {
    if (computeEffectiveStatus(campaign) !== "active") continue;
    if (successfulCount < campaign.referralTarget) continue;
    if (hasExistingGrant(userId, campaign.id)) continue;

    const fulfillment = fulfill(campaign, userId);
    const rewardId = randomUUID();
    const now = new Date().toISOString();
    const reward: EarnedReward = {
      id: rewardId,
      referrerUserId: userId,
      campaignId: campaign.id,
      campaignName: campaign.name,
      referralTarget: campaign.referralTarget,
      rewardType: campaign.rewardType,
      rewardValue: campaign.rewardValue,
      successfulReferralsAtGrant: successfulCount,
      status: "earned",
      couponCode: fulfillment.couponCode,
      fulfillmentNotes: fulfillment.fulfillmentNotes,
      createdAt: now,
      issuedAt: now,
      claimedAt: null,
      source: "reward-engine",
    };

    const rewardsDb = readJson(REWARDS_FILE, { rewards: {} as Record<string, EarnedReward> });
    rewardsDb.rewards[rewardId] = reward;
    writeJson(REWARDS_FILE, rewardsDb);
    grants.push(reward);
  }

  return { grants, successfulCount };
}

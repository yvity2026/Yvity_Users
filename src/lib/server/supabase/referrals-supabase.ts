import "server-only";

import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

export type AmbassadorRow = {
  id: string;
  userId: string;
  referralCode: string;
  status: string;
  totalReferrals: number;
  successfulReferrals: number;
  referralLink: string | null;
  createdAt: string;
  promotedAt: string;
};

export type ReferralRow = {
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

function mapAmbassador(row: Record<string, unknown>): AmbassadorRow {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    referralCode: String(row.referral_code),
    status: String(row.status || "active"),
    totalReferrals: Number(row.total_referrals || 0),
    successfulReferrals: Number(row.successful_referrals || 0),
    referralLink: row.referral_link ? String(row.referral_link) : null,
    createdAt: String(row.created_at || new Date().toISOString()),
    promotedAt: String(row.promoted_at || new Date().toISOString()),
  };
}

function mapReferral(row: Record<string, unknown>): ReferralRow {
  return {
    id: String(row.id),
    referrerUserId: String(row.referrer_user_id),
    referrerCode: String(row.referrer_code),
    referredUserId: String(row.referred_user_id),
    referredUserName: String(row.referred_user_name),
    registeredAt: String(row.registered_at || new Date().toISOString()),
    planPurchased: row.plan_purchased ? String(row.plan_purchased) : null,
    purchasedAt: row.purchased_at ? String(row.purchased_at) : null,
    paymentId: row.payment_id ? String(row.payment_id) : null,
    status: (row.status as ReferralRow["status"]) || "registered",
    rewardId: row.reward_id ? String(row.reward_id) : null,
  };
}

export async function loadAmbassadorFromDb(userId: string): Promise<AmbassadorRow | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("ambassador_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapAmbassador(data as Record<string, unknown>);
}

export async function findAmbassadorByCodeFromDb(code: string): Promise<AmbassadorRow | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("ambassador_profiles")
    .select("*")
    .eq("referral_code", code.toUpperCase().trim())
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return null;
  return mapAmbassador(data as Record<string, unknown>);
}

export async function upsertAmbassadorInDb(ambassador: AmbassadorRow): Promise<boolean> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return false;

  const { error } = await supabase.from("ambassador_profiles").upsert(
    {
      id: ambassador.id,
      user_id: ambassador.userId,
      referral_code: ambassador.referralCode.toUpperCase().trim(),
      status: ambassador.status,
      total_referrals: ambassador.totalReferrals,
      successful_referrals: ambassador.successfulReferrals,
      referral_link: ambassador.referralLink,
      created_at: ambassador.createdAt,
      promoted_at: ambassador.promotedAt,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.warn("[referrals] Supabase ambassador upsert failed:", error.message);
    return false;
  }
  return true;
}

export async function incrementAmbassadorTotalInDb(
  userId: string,
  field: "total_referrals" | "successful_referrals",
): Promise<void> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return;

  const { data } = await supabase
    .from("ambassador_profiles")
    .select(field)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return;

  const current = Number((data as Record<string, unknown>)[field] || 0);
  await supabase
    .from("ambassador_profiles")
    .update({ [field]: current + 1 })
    .eq("user_id", userId);
}

export async function insertReferralInDb(referral: ReferralRow): Promise<boolean> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return false;

  const { error } = await supabase.from("referrals").upsert(
    {
      id: referral.id,
      referrer_user_id: referral.referrerUserId,
      referrer_code: referral.referrerCode,
      referred_user_id: referral.referredUserId,
      referred_user_name: referral.referredUserName,
      registered_at: referral.registeredAt,
      plan_purchased: referral.planPurchased,
      purchased_at: referral.purchasedAt,
      payment_id: referral.paymentId,
      status: referral.status,
      reward_id: referral.rewardId,
    },
    { onConflict: "referred_user_id" },
  );

  if (error) {
    console.warn("[referrals] Supabase referral insert failed:", error.message);
    return false;
  }
  return true;
}

export async function loadReferralsForAmbassadorFromDb(referrerUserId: string): Promise<ReferralRow[]> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_user_id", referrerUserId)
    .order("registered_at", { ascending: false });

  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(mapReferral);
}

export async function loadReferralForUserFromDb(referredUserId: string): Promise<ReferralRow | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_user_id", referredUserId)
    .maybeSingle();

  if (error || !data) return null;
  return mapReferral(data as Record<string, unknown>);
}

export async function updateReferralStatusInDb(
  referralId: string,
  updates: Partial<Pick<ReferralRow, "status" | "planPurchased" | "purchasedAt" | "paymentId" | "rewardId">>,
): Promise<boolean> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return false;

  const patch: Record<string, unknown> = {};
  if (updates.status !== undefined) patch.status = updates.status;
  if (updates.planPurchased !== undefined) patch.plan_purchased = updates.planPurchased;
  if (updates.purchasedAt !== undefined) patch.purchased_at = updates.purchasedAt;
  if (updates.paymentId !== undefined) patch.payment_id = updates.paymentId;
  if (updates.rewardId !== undefined) patch.reward_id = updates.rewardId;

  const { error } = await supabase.from("referrals").update(patch).eq("id", referralId);
  if (error) {
    console.warn("[referrals] Supabase referral update failed:", error.message);
    return false;
  }
  return true;
}

import "server-only";

import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import type { AdvisorProfileRecord } from "@/lib/server/advisor-profile-store";

const MOCK_ROLE_TO_UUID: Record<string, string> = {
  "role-life": "00000000-0000-4000-8000-000000000001",
  "role-health": "00000000-0000-4000-8000-000000000002",
  "role-general": "00000000-0000-4000-8000-000000000003",
};

const UUID_TO_MOCK_ROLE: Record<string, string> = Object.fromEntries(
  Object.entries(MOCK_ROLE_TO_UUID).map(([mock, uuid]) => [uuid, mock]),
);

type AdvisorProfileRow = {
  id: string;
  advisor_id: string;
  advisor_role_id: string;
  short_bio: string | null;
  iridai_certificate_url: string | null;
  profile_status: boolean | null;
  account_status: AdvisorProfileRecord["account_status"] | null;
  subscription_plan: string | null;
  profile_slug: string | null;
  designation: string | null;
  irdai_rejected_reason: string | null;
  subscription_activated_at: string | null;
  subscription_expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  gold_settings?: Record<string, unknown> | null;
};

function resolveRoleUuid(rawRoleId: string | null | undefined): string {
  if (!rawRoleId) return MOCK_ROLE_TO_UUID["role-life"];
  if (MOCK_ROLE_TO_UUID[rawRoleId]) return MOCK_ROLE_TO_UUID[rawRoleId];
  if (/^[0-9a-f-]{36}$/i.test(rawRoleId)) return rawRoleId;
  return MOCK_ROLE_TO_UUID["role-life"];
}

function resolveRoleForApp(rawRoleId: string | null | undefined): string {
  if (!rawRoleId) return "role-life";
  return UUID_TO_MOCK_ROLE[rawRoleId] ?? rawRoleId;
}

export function mapSupabaseRowToRecord(row: AdvisorProfileRow): AdvisorProfileRecord {
  const cert = row.iridai_certificate_url?.trim() || null;
  const approvedAt =
    row.account_status === "active" ? row.updated_at ?? row.subscription_activated_at : null;

  return {
    id: row.id,
    advisor_id: row.id,
    user_id: row.advisor_id,
    account_status: row.account_status ?? "under_review",
    profile_status: Boolean(row.profile_status),
    profile_slug: row.profile_slug ?? "",
    subscription_plan: row.subscription_plan ?? "free",
    iridai_certificate_url: cert,
    irdai_rejected_reason: row.irdai_rejected_reason ?? null,
    advisor_role_id: resolveRoleForApp(row.advisor_role_id),
    designation: row.designation ?? null,
    bio: row.short_bio ?? null,
    document_urls: cert && cert !== "pending" ? [cert] : [],
    submitted_at: row.created_at ?? null,
    approved_at: approvedAt,
    subscription_started_at: row.subscription_activated_at ?? null,
    subscription_expires_at: row.subscription_expires_at ?? null,
  };
}

export function mapRecordToSupabaseRow(
  record: AdvisorProfileRecord,
  existingGoldSettings: Record<string, unknown> | null = null,
): Record<string, unknown> {
  const plan = (record.subscription_plan ?? "free") as MembershipPlanId;
  const cert = record.iridai_certificate_url?.trim() || record.document_urls?.[0]?.trim() || "";

  return {
    id: record.id,
    advisor_id: record.user_id,
    advisor_role_id: resolveRoleUuid(record.advisor_role_id),
    short_bio: record.bio?.trim() || null,
    iridai_certificate_url: cert || "pending",
    profile_status: Boolean(record.profile_status),
    account_status: record.account_status,
    subscription_plan: plan,
    profile_slug: record.profile_slug?.trim() || null,
    designation: record.designation?.trim() || null,
    irdai_rejected_reason: record.irdai_rejected_reason?.trim() || null,
    subscription_activated_at: record.subscription_started_at ?? record.approved_at ?? null,
    subscription_expires_at: record.subscription_expires_at ?? null,
    plan_active: plan === "silver" || plan === "gold",
    created_at: record.submitted_at ?? undefined,
    updated_at: record.approved_at ?? record.submitted_at ?? new Date().toISOString(),
    gold_settings: existingGoldSettings ?? {},
  };
}

function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export async function supabaseGetAdvisorProfileByUserId(
  userId: string,
): Promise<AdvisorProfileRecord | null> {
  const { data, error } = await client()
    .from("advisor_profiles")
    .select("*")
    .eq("advisor_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapSupabaseRowToRecord(data as AdvisorProfileRow);
}

export async function supabaseFindAdvisorProfileById(
  profileId: string,
): Promise<AdvisorProfileRecord | null> {
  const supabase = client();
  const byId = await supabase.from("advisor_profiles").select("*").eq("id", profileId).maybeSingle();
  if (byId.error) throw new Error(byId.error.message);
  if (byId.data) return mapSupabaseRowToRecord(byId.data as AdvisorProfileRow);

  const byUser = await supabase
    .from("advisor_profiles")
    .select("*")
    .eq("advisor_id", profileId)
    .maybeSingle();
  if (byUser.error) throw new Error(byUser.error.message);
  if (!byUser.data) return null;
  return mapSupabaseRowToRecord(byUser.data as AdvisorProfileRow);
}

export async function supabaseListAdvisorProfiles(): Promise<AdvisorProfileRecord[]> {
  const { data, error } = await client()
    .from("advisor_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapSupabaseRowToRecord(row as AdvisorProfileRow));
}

export async function supabaseCollectTakenSlugs(excludeUserId?: string): Promise<Set<string>> {
  const rows = await supabaseListAdvisorProfiles();
  const taken = new Set<string>();
  for (const record of rows) {
    if (excludeUserId && record.user_id === excludeUserId) continue;
    const segment = record.profile_slug?.trim().toLowerCase();
    if (segment) taken.add(segment);
  }
  return taken;
}

async function readExistingGoldSettings(userId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await client()
    .from("advisor_profiles")
    .select("gold_settings")
    .eq("advisor_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const settings = data?.gold_settings;
  return settings && typeof settings === "object" ? (settings as Record<string, unknown>) : null;
}

export async function supabaseUpsertAdvisorProfile(record: AdvisorProfileRecord): Promise<void> {
  const existingGoldSettings = await readExistingGoldSettings(record.user_id);
  const row = mapRecordToSupabaseRow(record, existingGoldSettings);
  const { error } = await client()
    .from("advisor_profiles")
    .upsert(row, { onConflict: "advisor_id" });

  if (error) throw new Error(error.message);
}

export async function supabaseDeleteAdvisorProfile(userId: string): Promise<void> {
  const { error } = await client().from("advisor_profiles").delete().eq("advisor_id", userId);
  if (error) throw new Error(error.message);
}

export async function supabaseLoadAllAdvisorProfiles(): Promise<
  Record<string, AdvisorProfileRecord>
> {
  const rows = await supabaseListAdvisorProfiles();
  const profiles: Record<string, AdvisorProfileRecord> = {};
  for (const record of rows) {
    profiles[record.user_id] = record;
  }
  return profiles;
}

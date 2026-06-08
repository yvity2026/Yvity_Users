import "server-only";

import type { ScoreDecayLedger } from "@/lib/advisor-score/decay";
import type { AdvisorNotification, NotificationKind } from "@/lib/notifications/types";
import type { ContactInquiry, ContactInterestId } from "@/lib/contact-config";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function isInMonth(iso: string, year: number, month: number): boolean {
  const date = new Date(iso);
  return date.getFullYear() === year && date.getMonth() === month;
}

function isSameDay(iso: string, year: number, month: number, day: number): boolean {
  const date = new Date(iso);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

// --- Notifications ---

function mapNotificationRow(row: Record<string, unknown>): AdvisorNotification {
  const meta = row.meta && typeof row.meta === "object" ? (row.meta as Record<string, string>) : {};
  return {
    id: String(row.id),
    userId: String(row.user_id),
    kind: String(row.kind) as NotificationKind,
    title: String(row.title),
    message: String(row.message),
    href: row.href ? String(row.href) : undefined,
    read: Boolean(row.read),
    createdAt: String(row.created_at),
    meta: Object.keys(meta).length ? meta : undefined,
  };
}

export async function listNotificationsFromDb(userId: string): Promise<AdvisorNotification[]> {
  const { data, error } = await client()
    .from("advisor_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapNotificationRow(row as Record<string, unknown>));
}

export async function hasNotificationKindInDb(
  userId: string,
  kind: NotificationKind,
): Promise<boolean> {
  const { count, error } = await client()
    .from("advisor_notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", kind);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function appendNotificationToDb(
  input: Omit<AdvisorNotification, "id" | "createdAt" | "read"> & { read?: boolean },
): Promise<AdvisorNotification> {
  const { data, error } = await client()
    .from("advisor_notifications")
    .insert({
      user_id: input.userId,
      kind: input.kind,
      title: input.title,
      message: input.message,
      href: input.href ?? null,
      read: input.read ?? false,
      meta: input.meta ?? {},
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapNotificationRow(data as Record<string, unknown>);
}

export async function markNotificationReadInDb(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  const { data, error } = await client()
    .from("advisor_notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("id");

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function markAllNotificationsReadInDb(userId: string): Promise<number> {
  const { data, error } = await client()
    .from("advisor_notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false)
    .select("id");

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

// --- Profile views ---

export async function recordProfileViewInDb(input: {
  advisorUserId: string;
  viewerKey: string;
}): Promise<void> {
  const advisorUserId = input.advisorUserId.trim();
  const viewerKey = input.viewerKey.trim();
  if (!advisorUserId || !viewerKey) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const { data: existing } = await client()
    .from("advisor_profile_views")
    .select("id, viewed_at")
    .eq("advisor_id", advisorUserId)
    .eq("viewer_key", viewerKey);

  const alreadyCounted = (existing ?? []).some((row) =>
    isInMonth(String(row.viewed_at), year, month),
  );
  if (alreadyCounted) return;

  const { error } = await client().from("advisor_profile_views").insert({
    advisor_id: advisorUserId,
    viewer_key: viewerKey,
    viewed_at: now.toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function countUniqueProfileViewsInMonthDb(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  const { data, error } = await client()
    .from("advisor_profile_views")
    .select("viewer_key, viewed_at")
    .eq("advisor_id", advisorUserId);

  if (error) throw new Error(error.message);
  const viewers = new Set(
    (data ?? [])
      .filter((row) => isInMonth(String(row.viewed_at), year, month))
      .map((row) => String(row.viewer_key)),
  );
  return viewers.size;
}

// --- Login days (advisor_login_activity) ---

export async function recordAdvisorLoginDayInDb(userId: string): Promise<void> {
  const id = userId.trim();
  if (!id) return;
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await client()
    .from("advisor_login_activity")
    .upsert({ advisor_id: id, login_date: today }, { onConflict: "advisor_id,login_date" });

  if (error) throw new Error(error.message);

  void client().rpc("increment_advisor_login_score", {
    p_advisor: id,
    p_login_date: today,
  });
}

export async function countLoginDaysInMonthDb(
  userId: string,
  year: number,
  month: number,
): Promise<number> {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = new Date(year, month + 1, 0);
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

  const { data, error } = await client()
    .from("advisor_login_activity")
    .select("login_date")
    .eq("advisor_id", userId)
    .gte("login_date", start)
    .lte("login_date", end);

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

// --- Search impressions ---

export async function recordSearchImpressionsInDb(input: {
  advisorUserIds: string[];
  searcherKey: string;
  source: string;
}): Promise<void> {
  const searcherKey = input.searcherKey.trim();
  if (!searcherKey) return;

  const ids = [...new Set(input.advisorUserIds.map((id) => id.trim()).filter(Boolean))];
  if (!ids.length) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  for (const advisorUserId of ids) {
    const { data: existing } = await client()
      .from("advisor_search_impressions")
      .select("appeared_at")
      .eq("advisor_id", advisorUserId)
      .eq("searcher_key", searcherKey);

    const alreadyToday = (existing ?? []).some((row) =>
      isSameDay(String(row.appeared_at), year, month, day),
    );
    if (alreadyToday) continue;

    const { error } = await client().from("advisor_search_impressions").insert({
      advisor_id: advisorUserId,
      searcher_key: searcherKey,
      source: input.source,
      appeared_at: now.toISOString(),
    });
    if (error) throw new Error(error.message);
  }
}

export async function countSearchAppearancesInMonthDb(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  const { data, error } = await client()
    .from("advisor_search_impressions")
    .select("appeared_at")
    .eq("advisor_id", advisorUserId);

  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) => isInMonth(String(row.appeared_at), year, month)).length;
}

// --- Score decay ledger ---

export async function loadScoreDecayLedgerFromDb(advisorUserId: string): Promise<ScoreDecayLedger> {
  const { data, error } = await client()
    .from("advisor_score_decay_ledger")
    .select("*")
    .eq("advisor_id", advisorUserId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    return {
      advisorUserId,
      profileViewsDecay: 0,
      selfShareDecay: 0,
      clientShareDecay: 0,
      loginDecay: 0,
      lastEvaluatedMonth: null,
    };
  }

  return {
    advisorUserId,
    profileViewsDecay: Number(data.profile_views_decay ?? 0),
    selfShareDecay: Number(data.self_share_decay ?? 0),
    clientShareDecay: Number(data.client_share_decay ?? 0),
    loginDecay: Number(data.login_decay ?? 0),
    lastEvaluatedMonth: data.last_evaluated_month ? String(data.last_evaluated_month) : null,
  };
}

export async function saveScoreDecayLedgerToDb(ledger: ScoreDecayLedger): Promise<void> {
  const { error } = await client().from("advisor_score_decay_ledger").upsert(
    {
      advisor_id: ledger.advisorUserId,
      profile_views_decay: ledger.profileViewsDecay,
      self_share_decay: ledger.selfShareDecay,
      client_share_decay: ledger.clientShareDecay,
      login_decay: ledger.loginDecay,
      last_evaluated_month: ledger.lastEvaluatedMonth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "advisor_id" },
  );

  if (error) throw new Error(error.message);
}

// --- Contact inquiries ---

export async function loadContactInquiriesFromDb(advisorId: string): Promise<ContactInquiry[]> {
  const { data, error } = await client()
    .from("contact_inquiries")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    fullName: String(row.full_name),
    mobile: String(row.mobile),
    interests: (Array.isArray(row.interests) ? row.interests : []) as ContactInterestId[],
    message: row.message ? String(row.message) : undefined,
    createdAt: String(row.created_at),
  }));
}

export async function appendContactInquiryToDb(
  advisorId: string,
  inquiry: Omit<ContactInquiry, "id" | "createdAt">,
): Promise<ContactInquiry> {
  const { data, error } = await client()
    .from("contact_inquiries")
    .insert({
      advisor_id: advisorId,
      full_name: inquiry.fullName,
      mobile: inquiry.mobile,
      interests: inquiry.interests,
      message: inquiry.message ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return {
    id: String(data.id),
    fullName: String(data.full_name),
    mobile: String(data.mobile),
    interests: (Array.isArray(data.interests) ? data.interests : []) as ContactInterestId[],
    message: data.message ? String(data.message) : undefined,
    createdAt: String(data.created_at),
  };
}

// --- Saved profiles ---

export async function resolveAdvisorProfileUuid(rawId: string): Promise<string | null> {
  const id = rawId.trim();
  if (!id) return null;

  const supabase = client();
  const byProfileId = await supabase
    .from("advisor_profiles")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (byProfileId.data?.id) return String(byProfileId.data.id);

  const byUserId = await supabase
    .from("advisor_profiles")
    .select("id")
    .eq("advisor_id", id)
    .maybeSingle();
  if (byUserId.data?.id) return String(byUserId.data.id);

  return null;
}

export async function listSavedProfileAdvisorUserIds(userId: string): Promise<string[]> {
  const { data, error } = await client()
    .from("saved_profiles")
    .select("advisor_profile_id, created_at, advisor_profiles(advisor_id)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => {
      const profile = row.advisor_profiles as { advisor_id?: string } | null;
      return profile?.advisor_id ? String(profile.advisor_id) : null;
    })
    .filter(Boolean) as string[];
}

export async function isProfileSavedInDb(
  userId: string,
  advisorProfileIdOrUserId: string,
): Promise<boolean> {
  const profileId = await resolveAdvisorProfileUuid(advisorProfileIdOrUserId);
  if (!profileId) return false;

  const { count, error } = await client()
    .from("saved_profiles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("advisor_profile_id", profileId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function saveProfileInDb(
  userId: string,
  advisorProfileIdOrUserId: string,
): Promise<{ created: boolean; profileId: string | null }> {
  const profileId = await resolveAdvisorProfileUuid(advisorProfileIdOrUserId);
  if (!profileId) return { created: false, profileId: null };

  const exists = await isProfileSavedInDb(userId, profileId);
  if (exists) return { created: false, profileId };

  const { error } = await client().from("saved_profiles").insert({
    user_id: userId,
    advisor_profile_id: profileId,
  });

  if (error) throw new Error(error.message);
  return { created: true, profileId };
}

export async function removeSavedProfileInDb(
  userId: string,
  advisorProfileIdOrUserId: string,
): Promise<boolean> {
  const profileId = await resolveAdvisorProfileUuid(advisorProfileIdOrUserId);
  if (!profileId) return false;

  const { error, count } = await client()
    .from("saved_profiles")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("advisor_profile_id", profileId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

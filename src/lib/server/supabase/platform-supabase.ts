import "server-only";

import type { RegisteredUser } from "@/lib/server/registration-store";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

const MOCK_ROLE_TO_UUID: Record<string, string> = {
  "role-life": "00000000-0000-4000-8000-000000000001",
  "role-health": "00000000-0000-4000-8000-000000000002",
  "role-general": "00000000-0000-4000-8000-000000000003",
};

const UUID_TO_MOCK_ROLE: Record<string, string> = Object.fromEntries(
  Object.entries(MOCK_ROLE_TO_UUID).map(([mock, uuid]) => [uuid, mock]),
);

function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function mapUserRow(row: Record<string, unknown>): RegisteredUser {
  return {
    id: String(row.id),
    fullName: String(row.name || ""),
    phone: String(row.mobile || ""),
    email: String(row.email || ""),
    dob: row.dob ? String(row.dob) : "",
    gender: String(row.gender || ""),
    city: String(row.city || ""),
    state: "",
    profession: String(row.profession || ""),
    selfieUrl: row.selfie_url ? String(row.selfie_url) : null,
    identity_verified_at: row.mobile_verified ? String(row.updated_at || row.created_at || "") : undefined,
    createdAt: row.created_at ? new Date(String(row.created_at)).getTime() : Date.now(),
  };
}

export async function loadUserByIdFromDb(userId: string): Promise<RegisteredUser | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase || !userId.trim()) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapUserRow(data as Record<string, unknown>);
}

export async function loadAllUsersFromDb(): Promise<RegisteredUser[]> {
  const { data, error } = await client().from("users").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapUserRow(row as Record<string, unknown>));
}

export async function upsertUserToDb(user: RegisteredUser): Promise<void> {
  const { error } = await client()
    .from("users")
    .upsert(
      {
        id: user.id,
        mobile: user.phone.replace(/\D/g, "").slice(-10),
        name: user.fullName,
        email: user.email || null,
        dob: user.dob || null,
        gender: user.gender || null,
        city: user.city || null,
        profession: user.profession || null,
        selfie_url: user.selfieUrl,
        mobile_verified: Boolean(user.phone),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (error) throw new Error(error.message);
}

export async function loadAdvisorRolesFromDb(): Promise<
  Array<{ id: string; title: string; description?: string; icon?: string }>
> {
  const { data, error } = await client()
    .from("advisor_roles")
    .select("id, title, description, icon")
    .eq("is_available", true)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: UUID_TO_MOCK_ROLE[String(row.id)] ?? String(row.id),
    title: String(row.title || "Insurance Advisor"),
    description: row.description ? String(row.description) : undefined,
    icon: row.icon ? String(row.icon) : undefined,
  }));
}

export async function loadLandingStatsFromDb(): Promise<{
  verifiedAdvisors: number;
  citiesCovered: number;
  verifiedReviews: number;
}> {
  const supabase = client();

  const [profilesRes, citiesRes, testimonialsRes] = await Promise.all([
    supabase
      .from("advisor_profiles")
      .select("id", { count: "exact", head: true })
      .eq("account_status", "active"),
    supabase.from("users").select("city").not("city", "is", null),
    supabase
      .from("advisor_testimonials")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .eq("is_mobile_verified", true),
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (citiesRes.error) throw new Error(citiesRes.error.message);
  if (testimonialsRes.error) throw new Error(testimonialsRes.error.message);

  const cities = new Set(
    (citiesRes.data ?? [])
      .map((row) => String(row.city || "").trim().toLowerCase())
      .filter(Boolean),
  );

  return {
    verifiedAdvisors: profilesRes.count ?? 0,
    citiesCovered: cities.size,
    verifiedReviews: testimonialsRes.count ?? 0,
  };
}

export async function loadRecentHomeReviewsFromDb(limit = 6): Promise<
  Array<{
    id: string;
    text: string;
    rating: number;
    reviewerName: string;
    advisorId: string;
    advisorName: string;
    advisorTitle: string;
    advisorCity: string;
    profileUrl: string;
    createdAt: string;
  }>
> {
  const supabase = client();
  const { data, error } = await supabase
    .from("advisor_testimonials")
    .select("id, name, content, testimonial_rating, created_at, advisor_id")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!data?.length) return [];

  const advisorIds = [...new Set(data.map((row) => String(row.advisor_id)))];
  const [{ data: users }, { data: profiles }] = await Promise.all([
    supabase.from("users").select("id, name, city").in("id", advisorIds),
    supabase
      .from("advisor_profiles")
      .select("advisor_id, profile_slug, designation")
      .in("advisor_id", advisorIds),
  ]);

  const userById = new Map((users ?? []).map((row) => [String(row.id), row]));
  const profileByAdvisor = new Map(
    (profiles ?? []).map((row) => [String(row.advisor_id), row]),
  );

  return data.map((row) => {
    const user = userById.get(String(row.advisor_id));
    const profile = profileByAdvisor.get(String(row.advisor_id));
    const slug = profile?.profile_slug ? String(profile.profile_slug).trim() : "";
    return {
      id: String(row.id),
      text: String(row.content || "").split("\n---YVITY-META---\n")[0]?.trim() || "",
      rating: Number(row.testimonial_rating ?? 5) || 5,
      reviewerName: String(row.name || "Client"),
      advisorId: String(row.advisor_id),
      advisorName: String(user?.name || "Advisor"),
      advisorTitle: String(profile?.designation || "Insurance Advisor"),
      advisorCity: String(user?.city || ""),
      profileUrl: slug ? `/${slug}` : "/profile",
      createdAt: String(row.created_at || new Date().toISOString()),
    };
  });
}

export async function loadAdvisorSettingsFromDb(userId: string) {
  const { data, error } = await client()
    .from("advisor_profiles")
    .select("*")
    .eq("advisor_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function saveAdvisorSettingsToDb(
  userId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const { error } = await client()
    .from("advisor_profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("advisor_id", userId);

  if (error) throw new Error(error.message);
}

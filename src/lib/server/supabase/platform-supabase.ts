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
    phone: String(row.mobile || "")
      .replace(/\D/g, "")
      .slice(-10),
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

export async function loadUserByMobileFromDb(mobile: string): Promise<RegisteredUser | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return null;

  const normalized = String(mobile || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (!/^[6-9]\d{9}$/.test(normalized)) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("mobile", normalized)
    .maybeSingle();

  if (error || !data) return null;
  return mapUserRow(data as Record<string, unknown>);
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
        selfie_url: user.selfieUrl || null,
        mobile_verified: true,
        email_verified: Boolean(user.email),
        is_active: true,
        roles: ["customer"],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "mobile" },
    );

  if (error) throw new Error(error.message);
}

/** Targeted update of profile fields (name, city, profession) by user ID.
 *  Safer than upsertUserToDb — never overwrites roles or other system fields. */
export async function updateUserProfileFields(
  userId: string,
  fields: { name?: string; city?: string; profession?: string },
): Promise<void> {
  const supabase = getAdminClientOrNull();
  if (!supabase || !userId.trim()) return;

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.name) patch.name = fields.name;
  if (fields.city) patch.city = fields.city;
  if (fields.profession) patch.profession = fields.profession;

  const { error } = await supabase.from("users").update(patch).eq("id", userId);
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
  totalUsers: number;
  verifiedAdvisors: number;
  citiesCovered: number;
  avgAdvisorRating: number;
  platformRating: number;
  platformRatingCount: number;
}> {
  const supabase = client();

  const [usersRes, profilesRes, citiesRes, advisorRatingsRes, platformRatingsRes] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("advisor_profiles")
      .select("id", { count: "exact", head: true })
      .eq("account_status", "active"),
    supabase
      .from("advisor_profiles")
      .select("users(city)")
      .eq("account_status", "active"),
    supabase
      .from("advisor_testimonials")
      .select("testimonial_rating")
      .eq("status", "approved")
      .eq("is_mobile_verified", true)
      .not("testimonial_rating", "is", null),
    supabase
      .from("yvity_testimonials")
      .select("testimonial_rating")
      .eq("status", "approved")
      .not("testimonial_rating", "is", null),
  ]);

  if (usersRes.error) throw new Error(usersRes.error.message);
  if (profilesRes.error) throw new Error(profilesRes.error.message);
  if (citiesRes.error) throw new Error(citiesRes.error.message);
  if (advisorRatingsRes.error) throw new Error(advisorRatingsRes.error.message);
  if (platformRatingsRes.error) throw new Error(platformRatingsRes.error.message);

  const cities = new Set(
    (citiesRes.data ?? [])
      .map((row) => {
        const u = row.users as { city?: string | null } | null;
        return String(u?.city || "").trim().toLowerCase();
      })
      .filter(Boolean),
  );

  const advisorRatings = (advisorRatingsRes.data ?? []).map((r) => Number(r.testimonial_rating)).filter((n) => n > 0);
  const avgAdvisorRating = advisorRatings.length > 0
    ? Math.round((advisorRatings.reduce((s, r) => s + r, 0) / advisorRatings.length) * 10) / 10
    : 0;

  const platformRatings = (platformRatingsRes.data ?? []).map((r) => Number(r.testimonial_rating)).filter((n) => n > 0);
  const platformRating = platformRatings.length > 0
    ? Math.round((platformRatings.reduce((s, r) => s + r, 0) / platformRatings.length) * 10) / 10
    : 0;

  return {
    totalUsers: usersRes.count ?? 0,
    verifiedAdvisors: profilesRes.count ?? 0,
    citiesCovered: cities.size,
    avgAdvisorRating,
    platformRating,
    platformRatingCount: platformRatings.length,
  };
}

export async function loadRecentHomeReviewsFromDb(limit = 6): Promise<
  Array<{
    id: string;
    text: string;
    rating: number;
    reviewerName: string;
    reviewerProfession: string;
    reviewerCity: string;
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
    const rawContent = String(row.content || "");
    const metaIdx = rawContent.indexOf("\n---YVITY-META---\n");
    const text = metaIdx === -1 ? rawContent.trim() : rawContent.slice(0, metaIdx).trim();
    let reviewerProfession = "";
    let reviewerCity = "";
    if (metaIdx !== -1) {
      try {
        const meta = JSON.parse(rawContent.slice(metaIdx + "\n---YVITY-META---\n".length)) as Record<string, unknown>;
        reviewerProfession = String(meta.profession || "");
        reviewerCity = String(meta.location || "");
      } catch { /* ignore */ }
    }
    return {
      id: String(row.id),
      text,
      rating: Number(row.testimonial_rating ?? 5) || 5,
      reviewerName: String(row.name || "Client"),
      reviewerProfession,
      reviewerCity,
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

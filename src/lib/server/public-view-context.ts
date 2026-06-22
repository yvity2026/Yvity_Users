import { cookies } from "next/headers";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import type { AdvisorProfileRecord } from "@/lib/server/advisor-profile-store";
import { getAdvisorProfileForUser, loadAllAdvisorProfiles } from "@/lib/server/advisor-profile-store";
import { loadRegistrationDb, type RegisteredUser } from "@/lib/server/registration-store";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { loadUserByIdFromDb } from "@/lib/server/supabase/platform-supabase";
import { slugMatches, toPublicProfileSlugSegment } from "@/lib/advisor/public-profile-slug";
import { getSessionUser } from "@/lib/server/session";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import { DEFAULT_PROFILE_THEME_ID, isProfileThemeId } from "@/lib/profile-themes";
import { resolveThemeForPlan } from "@/lib/advisor-membership/plan-enforcement";
import { getEffectivePlan } from "@/lib/advisor/planFeatures";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import type { ProfileThemeId } from "@/lib/profile-themes";

export const PUBLIC_VIEW_COOKIE = "yvity-view-advisor";

/** Anonymous visitor id for unique monthly profile view counts. */
export const VIEWER_COOKIE = "yvity_viewer";

export function publicViewCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 2,
  };
}

export function viewerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export function isAdvisorProfileLive(profile: AdvisorProfileRecord | null): boolean {
  return isAdvisorProfileApproved(profile);
}

export async function findAdvisorProfileByPublicSlug(
  pathSlug: string,
): Promise<AdvisorProfileRecord | null> {
  const segment = toPublicProfileSlugSegment(pathSlug);
  if (!segment) return null;

  const db = await loadAllAdvisorProfiles();
  return (
    Object.values(db.profiles).find((p) => slugMatches(p.profile_slug, segment)) ?? null
  );
}

export async function clearPublicViewAdvisorCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(PUBLIC_VIEW_COOKIE);
}

/**
 * Whose persisted section data (services, career, …) to load.
 * When a visitor browses another advisor's public profile, the view cookie wins.
 */
export async function resolveAdvisorDataUserId(): Promise<string | null> {
  const session = await getSessionUser();
  const cookieStore = await cookies();
  const viewId = cookieStore.get(PUBLIC_VIEW_COOKIE)?.value?.trim();

  if (viewId) {
    const viewProfile = await getAdvisorProfileForUser(viewId);
    if (isAdvisorProfileLive(viewProfile)) {
      if (!session?.id || session.id !== viewId) {
        return viewId;
      }
    }
  }

  if (session?.id) return session.id;

  if (viewId) {
    const viewProfile = await getAdvisorProfileForUser(viewId);
    if (isAdvisorProfileLive(viewProfile)) return viewId;
  }

  return null;
}

/** True when the signed-in advisor is loading their own persisted section data. */
export async function isViewingOwnAdvisorData(): Promise<boolean> {
  const session = await getSessionUser();
  const dataUserId = await resolveAdvisorDataUserId();
  return Boolean(session?.id && dataUserId && session.id === dataUserId);
}

export type PublicViewAdvisorPayload = {
  userId: string;
  profile: AdvisorProfileRecord;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  profession: string;
  about?: string;
  selfie_url?: string;
  /** Score from advisor_scores.total_score — single source of truth */
  dbScore?: number | null;
  /** Advisor's chosen profile theme — applied on public profile pages */
  profileTheme: ProfileThemeId;
};

async function resolveRegisteredUserForPublicView(
  userId: string,
): Promise<RegisteredUser | null> {
  const fromLocal = loadRegistrationDb().users.find((u) => u.id === userId);
  if (fromLocal) return fromLocal;

  if (!useSupabasePersistence()) return null;

  try {
    return await loadUserByIdFromDb(userId);
  } catch (error) {
    console.warn("[public-view] Supabase user lookup failed:", error);
    return null;
  }
}

export async function loadPublicViewAdvisorByUserId(
  userId: string,
): Promise<PublicViewAdvisorPayload | null> {
  const profile = await getAdvisorProfileForUser(userId);
  if (!profile) return null;

  const [user, dbScore, settings] = await Promise.all([
    resolveRegisteredUserForPublicView(userId),
    loadAdvisorDbScore(userId),
    loadAdvisorSettings(userId).catch(() => null),
  ]);
  if (!user) return null;

  const planId = getEffectivePlan(profile.subscription_plan, profile.account_status) as MembershipPlanId;
  const rawTheme = settings?.appearance?.theme;
  const profileTheme = resolveThemeForPlan(
    planId,
    isProfileThemeId(rawTheme) ? rawTheme : DEFAULT_PROFILE_THEME_ID,
  );

  return {
    userId,
    profile,
    name: user.fullName?.trim() || "Advisor",
    email: user.email?.trim() || "",
    phone: user.phone?.trim() || "",
    city: user.city?.trim() || "",
    state: user.state?.trim() || "",
    profession: user.profession?.trim() || profile.designation?.trim() || "",
    about: user.about?.trim() || "",
    selfie_url: user.selfieUrl?.trim() || undefined,
    dbScore,
    profileTheme,
  };
}

async function loadAdvisorDbScore(advisorId: string): Promise<number | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("advisor_scores")
      .select("total_score")
      .eq("advisor_id", advisorId)
      .maybeSingle();
    return data?.total_score != null ? Math.max(0, Math.min(100, Number(data.total_score))) : null;
  } catch {
    return null;
  }
}

export async function loadPublicViewAdvisorBySlug(
  pathSlug: string,
): Promise<PublicViewAdvisorPayload | null> {
  const profile = await findAdvisorProfileByPublicSlug(pathSlug);
  if (!profile) return null;

  return loadPublicViewAdvisorByUserId(profile.user_id);
}

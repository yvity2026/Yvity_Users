import { randomUUID } from "crypto";
import type { AuthUser } from "@/lib/auth-store";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { getPaidPaymentForUser } from "@/lib/server/payment-store";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { toAuthUser } from "@/lib/server/registration";
import { resolveRegisteredUser } from "@/lib/server/profile";
import { getSessionUser } from "@/lib/server/session";
import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";

const PROFILES_FILE = "advisor-profiles.json";

export type AdvisorProfileRecord = {
  id: string;
  advisor_id: string;
  user_id: string;
  account_status: "under_review" | "active" | "action_required";
  profile_status: boolean;
  profile_slug: string;
  subscription_plan?: string | null;
  iridai_certificate_url?: string | null;
  irdai_rejected_reason?: string | null;
  advisor_role_id?: string | null;
  designation?: string | null;
  bio?: string | null;
  document_urls?: string[];
  submitted_at?: string | null;
  approved_at?: string | null;
};

type AdvisorProfilesDb = {
  profiles: Record<string, AdvisorProfileRecord>;
};

function emptyDb(): AdvisorProfilesDb {
  return { profiles: {} };
}

async function loadDb(): Promise<AdvisorProfilesDb> {
  return loadJsonFile(PROFILES_FILE, emptyDb());
}

async function saveDb(db: AdvisorProfilesDb) {
  await saveJsonFile(PROFILES_FILE, db);
}

function slugifyName(name: string, userId: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return `${base || "advisor"}-${userId.slice(0, 8)}`;
}

export async function getAdvisorProfileForUser(
  userId: string | undefined,
): Promise<AdvisorProfileRecord | null> {
  if (!userId) return null;
  const db = await loadDb();
  return db.profiles[userId] ?? null;
}

export function advisorProfileToApi(record: AdvisorProfileRecord) {
  return {
    id: record.id,
    advisor_id: record.advisor_id,
    account_status: record.account_status,
    profile_status: record.profile_status,
    profile_slug: record.profile_slug,
    subscription_plan: record.subscription_plan ?? null,
    iridai_certificate_url: record.iridai_certificate_url ?? null,
    irdai_rejected_reason: record.irdai_rejected_reason ?? null,
    approved_at: record.approved_at ?? null,
  };
}

function normalizeRoles(roles: unknown): string[] {
  if (Array.isArray(roles)) return roles;
  if (typeof roles === "string") {
    try {
      const parsed = JSON.parse(roles);
      return Array.isArray(parsed) ? parsed : ["customer"];
    } catch {
      return ["customer"];
    }
  }
  return ["customer"];
}

export async function persistSessionUser(user: AuthUser) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(user), sessionCookieOptions());
}

export async function grantAdvisorRoleForSession(): Promise<{
  user: AuthUser | null;
  roles: string[];
}> {
  const session = await getSessionUser();
  if (!session?.id) return { user: null, roles: [] };

  const registered = resolveRegisteredUser(session);
  const current = normalizeRoles(session.roles);
  const withCustomer = current.includes("customer") ? [...current] : ["customer", ...current];
  const nextRoles = withCustomer.includes("advisor")
    ? withCustomer
    : [...withCustomer, "advisor"];

  if (registered) {
    const authUser = toAuthUser(registered);
    authUser.roles = nextRoles;
    await persistSessionUser(authUser);
    return { user: authUser, roles: nextRoles };
  }

  const nextSession = { ...session, roles: nextRoles };
  await persistSessionUser(nextSession);
  return { user: nextSession, roles: nextRoles };
}

export type SubmitAdvisorProfileInput = {
  advisor_role_id: string;
  services: unknown[];
  bio: string;
  designation: string;
  certificate_url?: string;
  document_urls?: string[];
  subscription_plan: MembershipPlanId;
  razorpay_payment_id?: string;
};

function normalizeSubscriptionPlan(value: unknown): MembershipPlanId {
  const plan = String(value ?? "free")
    .trim()
    .toLowerCase();
  if (plan === "silver" || plan === "gold" || plan === "free") return plan;
  return "free";
}

/** @deprecated Use submitAdvisorProfile */
export async function submitAdvisorProfileForReview(
  input: Omit<SubmitAdvisorProfileInput, "subscription_plan"> & {
    subscription_plan?: MembershipPlanId;
  },
): Promise<{ profile: AdvisorProfileRecord; user: AuthUser | null }> {
  return submitAdvisorProfile({
    ...input,
    subscription_plan: input.subscription_plan ?? "free",
  });
}

export async function submitAdvisorProfile(
  input: SubmitAdvisorProfileInput,
): Promise<{ profile: AdvisorProfileRecord; user: AuthUser | null }> {
  const session = await getSessionUser();
  if (!session?.id) {
    throw new Error("Not signed in");
  }

  const registered = resolveRegisteredUser(session);
  const displayName = registered?.fullName ?? session.name ?? "Advisor";
  const now = new Date().toISOString();
  const profileId = randomUUID();
  const plan = normalizeSubscriptionPlan(input.subscription_plan);
  const requiresAdminReview = plan === "silver" || plan === "gold";

  if (requiresAdminReview) {
    const paymentId = input.razorpay_payment_id?.trim();
    if (!paymentId) {
      throw new Error("Complete payment for your selected plan before submitting");
    }
    const paid = await getPaidPaymentForUser({
      userId: session.id,
      planId: plan,
      razorpayPaymentId: paymentId,
    });
    if (!paid) {
      throw new Error("Payment not verified. Please try paying again.");
    }
  }

  const record: AdvisorProfileRecord = {
    id: profileId,
    advisor_id: profileId,
    user_id: session.id,
    account_status: requiresAdminReview ? "under_review" : "active",
    profile_status: !requiresAdminReview,
    profile_slug: slugifyName(displayName, session.id),
    subscription_plan: plan,
    iridai_certificate_url: input.certificate_url?.trim() || "pending",
    advisor_role_id: input.advisor_role_id,
    designation: input.designation,
    bio: input.bio,
    document_urls: input.document_urls ?? [],
    submitted_at: now,
  };

  const db = await loadDb();
  db.profiles[session.id] = record;
  await saveDb(db);

  const roles = normalizeRoles(session.roles);
  const nextRoles = roles.includes("advisor") ? roles : [...roles, "advisor"];
  const withCustomer = nextRoles.includes("customer") ? nextRoles : ["customer", ...nextRoles];

  let authUser: AuthUser | null = null;
  if (registered) {
    authUser = toAuthUser(registered);
    authUser.roles = withCustomer;
    await persistSessionUser(authUser);
  } else {
    authUser = { ...session, roles: withCustomer };
    await persistSessionUser(authUser);
  }

  return { profile: record, user: authUser };
}

export async function approveAdvisorProfile(userId: string): Promise<AdvisorProfileRecord | null> {
  const db = await loadDb();
  const record = db.profiles[userId];
  if (!record) return null;

  record.account_status = "active";
  record.profile_status = true;
  record.approved_at = new Date().toISOString();
  if (!record.iridai_certificate_url || record.iridai_certificate_url === "pending") {
    record.iridai_certificate_url = record.document_urls?.[0] ?? "/profile";
  }

  db.profiles[userId] = record;
  await saveDb(db);
  return record;
}

export async function rejectAdvisorProfile(
  profileId: string,
  reason?: string,
): Promise<AdvisorProfileRecord | null> {
  const db = await loadDb();
  const record =
    Object.values(db.profiles).find((item) => item.id === profileId) ??
    db.profiles[profileId] ??
    null;
  if (!record) return null;

  record.account_status = "action_required";
  record.profile_status = false;
  record.irdai_rejected_reason = reason?.trim() || "Profile requires changes";

  db.profiles[record.user_id] = record;
  await saveDb(db);
  return record;
}

export async function findAdvisorProfileById(
  profileId: string,
): Promise<AdvisorProfileRecord | null> {
  const db = await loadDb();
  return (
    Object.values(db.profiles).find((item) => item.id === profileId) ??
    db.profiles[profileId] ??
    null
  );
}

export async function listAdvisorProfilesForAdmin(): Promise<AdvisorProfileRecord[]> {
  const db = await loadDb();
  return Object.values(db.profiles).sort((a, b) => {
    const aTime = a.submitted_at ?? "";
    const bTime = b.submitted_at ?? "";
    return bTime.localeCompare(aTime);
  });
}

export function servicesFileForUser(userId: string) {
  return `services-${userId}.json`;
}

export async function updateAdvisorSubscriptionPlan(
  userId: string,
  planId: MembershipPlanId,
): Promise<AdvisorProfileRecord | null> {
  const db = await loadDb();
  const record = db.profiles[userId];
  if (!record) return null;

  record.subscription_plan = normalizeSubscriptionPlan(planId);
  if (!record.approved_at) {
    record.approved_at = new Date().toISOString();
  }

  db.profiles[userId] = record;
  await saveDb(db);
  return record;
}

export async function updateAdvisorIrdaiProfile(
  userId: string,
  input: { license_number?: string; certificate_url?: string },
): Promise<AdvisorProfileRecord | null> {
  const db = await loadDb();
  const record = db.profiles[userId];
  if (!record) return null;

  const certificateUrl = input.certificate_url?.trim();
  if (certificateUrl) {
    record.iridai_certificate_url = certificateUrl;
    record.document_urls = record.document_urls?.length
      ? record.document_urls
      : [certificateUrl];
  }

  db.profiles[userId] = record;
  await saveDb(db);
  return record;
}

export async function deactivateAdvisorAccount(userId: string): Promise<boolean> {
  const db = await loadDb();
  const record = db.profiles[userId];
  if (record) {
    record.profile_status = false;
    db.profiles[userId] = record;
    await saveDb(db);
  }
  return true;
}

export async function deleteAdvisorAccount(userId: string): Promise<boolean> {
  const db = await loadDb();
  delete db.profiles[userId];
  await saveDb(db);
  return true;
}

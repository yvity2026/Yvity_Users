/**
 * Step 3: Seed Yvity_Users `.data` JSON into shared Supabase (users + advisor_profiles).
 *
 * Run from repo root:
 *   node scripts/seed-json-to-supabase.mjs
 *   node scripts/seed-json-to-supabase.mjs --dry-run
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */
import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, ".data");
const DRY_RUN = process.argv.includes("--dry-run");

const DEFAULT_ADVISOR_ROLES = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Life Insurance Advisor",
    description: "Life & term plans",
    icon: "life",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    title: "Health Insurance Advisor",
    description: "Health & mediclaim",
    icon: "health",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    title: "General Insurance Advisor",
    description: "Motor & general",
    icon: "general",
  },
];

const MOCK_ROLE_TO_UUID = {
  "role-life": "00000000-0000-4000-8000-000000000001",
  "role-health": "00000000-0000-4000-8000-000000000002",
  "role-general": "00000000-0000-4000-8000-000000000003",
};

async function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  const raw = await fs.readFile(envPath, "utf-8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function readJson(filename, fallback) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeMobile(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

function resolveAdvisorRoleId(rawRoleId, fallbackUserId) {
  if (!rawRoleId) return DEFAULT_ADVISOR_ROLES[0].id;
  if (MOCK_ROLE_TO_UUID[rawRoleId]) return MOCK_ROLE_TO_UUID[rawRoleId];
  if (/^[0-9a-f-]{36}$/i.test(rawRoleId)) return rawRoleId;
  return DEFAULT_ADVISOR_ROLES[0].id;
}

function mapSettingsToProfileColumns(settings) {
  if (!settings || typeof settings !== "object") {
    return { gold_settings: {}, visibility: {} };
  }
  const visibility = settings.visibility ?? {};
  return {
    gold_settings: settings,
    visibility: {
      ispublic_professional: visibility.careerJourney !== false,
      ispublic_services: visibility.individualServices !== false,
      ispublic_achievements: visibility.achievements !== false,
      ispublic_gallery: visibility.gallery !== false,
      ispublic_testimonials: true,
      ispublic_profile: settings.publicProfile?.profileActive !== false,
      show_contactdetails: settings.contact?.showMobileNumber !== false,
    },
  };
}

function mapUserRow(regUser, hasAdvisorProfile) {
  const roles = hasAdvisorProfile ? ["customer", "advisor"] : ["customer"];
  return {
    id: regUser.id,
    mobile: normalizeMobile(regUser.phone),
    name: regUser.fullName?.trim() || "User",
    dob: regUser.dob || null,
    gender: regUser.gender || null,
    email: regUser.email?.trim() || null,
    city: regUser.city?.trim() || null,
    profession: regUser.profession?.trim() || null,
    selfie_url: regUser.selfieUrl || regUser.verification_selfie_url || null,
    mobile_verified: Boolean(regUser.identity_verified_at || regUser.phone),
    email_verified: Boolean(regUser.email),
    roles,
    is_active: true,
  };
}

function mapProfileRow(profile, settingsPayload) {
  const { gold_settings, visibility } = mapSettingsToProfileColumns(settingsPayload);
  const plan = profile.subscription_plan?.trim() || "free";
  return {
    id: profile.id,
    advisor_id: profile.user_id || profile.advisor_id,
    advisor_role_id: resolveAdvisorRoleId(profile.advisor_role_id, profile.user_id),
    services: [],
    short_bio: profile.bio?.trim() || null,
    iridai_certificate_url: profile.iridai_certificate_url?.trim() || "",
    profile_status: Boolean(profile.profile_status),
    account_status: profile.account_status || "under_review",
    subscription_plan: plan,
    profile_slug: profile.profile_slug?.trim() || null,
    designation: profile.designation?.trim() || null,
    irdai_rejected_reason: profile.irdai_rejected_reason?.trim() || null,
    subscription_activated_at: profile.subscription_started_at || profile.approved_at || null,
    subscription_expires_at: profile.subscription_expires_at || null,
    plan_active: plan !== "free",
    intro_url: settingsPayload?.introVideo?.url?.trim() || "",
    gold_settings,
    is_hero: false,
    is_landing: false,
    created_at: profile.submitted_at || profile.approved_at || new Date().toISOString(),
    updated_at: profile.approved_at || profile.submitted_at || new Date().toISOString(),
    ...visibility,
  };
}

async function ensureAuthUser(supabase, regUser) {
  const email = regUser.email?.trim() || undefined;
  const phone = normalizeMobile(regUser.phone);
  const payload = {
    id: regUser.id,
    email,
    phone: phone ? `+91${phone}` : undefined,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: {
      full_name: regUser.fullName?.trim() || "User",
    },
  };

  if (DRY_RUN) {
    console.log("[dry-run] auth.admin.createUser", regUser.id, email || phone);
    return { ok: true };
  }

  const existing = await supabase.auth.admin.getUserById(regUser.id);
  if (existing.data?.user) {
    return { ok: true, skipped: true };
  }

  const { error } = await supabase.auth.admin.createUser(payload);
  if (error && !/already|exists|duplicate/i.test(error.message)) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

async function main() {
  const env = await loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const registration = await readJson("registration.json", { users: [] });
  const profilesDb = await readJson("advisor-profiles.json", { profiles: {} });
  const profileUserIds = new Set(Object.keys(profilesDb.profiles ?? {}));

  if (registration.users.length === 0) {
    console.error("No users in .data/registration.json");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const createdById = registration.users[0].id;
  console.log(`Target Supabase: ${url}`);
  console.log(`Users to seed: ${registration.users.length}`);
  console.log(`Advisor profiles to seed: ${profileUserIds.size}`);
  if (DRY_RUN) console.log("DRY RUN — no writes");

  for (const regUser of registration.users) {
    const authResult = await ensureAuthUser(supabase, regUser);
    if (!authResult.ok) {
      console.error(`auth user ${regUser.id}:`, authResult.error);
      process.exit(1);
    }
    if (!DRY_RUN && !authResult.skipped) {
      console.log(`auth.users: ${regUser.fullName} (${regUser.id})`);
    }
  }

  for (const role of DEFAULT_ADVISOR_ROLES) {
    const row = {
      ...role,
      created_by_id: createdById,
      is_available: true,
    };
    if (DRY_RUN) {
      console.log("[dry-run] upsert advisor_roles", row.id, row.title);
      continue;
    }
    const { error } = await supabase.from("advisor_roles").upsert(row, { onConflict: "id" });
    if (error) {
      console.error("advisor_roles upsert failed:", error.message);
      process.exit(1);
    }
  }
  console.log("advisor_roles: ok");

  for (const regUser of registration.users) {
    const hasProfile = profileUserIds.has(regUser.id);
    const userRow = mapUserRow(regUser, hasProfile);
    if (DRY_RUN) {
      console.log("[dry-run] upsert users", userRow.id, userRow.name, userRow.mobile);
      continue;
    }

    const { error } = await supabase.from("users").upsert(userRow, { onConflict: "id" });
    if (error) {
      console.error(`users upsert ${regUser.id}:`, error.message);
      process.exit(1);
    }
    console.log(`users: ${userRow.name} (${userRow.id})`);
  }

  for (const userId of profileUserIds) {
    const profile = profilesDb.profiles[userId];
    if (!profile) continue;

    const settingsFile = `advisor-settings-${userId}.json`;
    const settingsPayload = await readJson(settingsFile, await readJson("advisor-settings.json", {}));
    const row = mapProfileRow(profile, settingsPayload);

    if (DRY_RUN) {
      console.log("[dry-run] upsert advisor_profiles", row.advisor_id, row.profile_slug, row.account_status);
      continue;
    }

    const { error } = await supabase.from("advisor_profiles").upsert(row, { onConflict: "advisor_id" });
    if (error) {
      console.error(`advisor_profiles upsert ${userId}:`, error.message);
      process.exit(1);
    }
    console.log(`advisor_profiles: ${row.profile_slug} (${row.account_status})`);
  }

  if (!DRY_RUN) {
    const { count: userCount } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });
    const { count: profileCount } = await supabase
      .from("advisor_profiles")
      .select("id", { count: "exact", head: true });
    console.log("\nDone.");
    console.log(`Supabase users: ${userCount ?? 0}`);
    console.log(`Supabase advisor_profiles: ${profileCount ?? 0}`);
  } else {
    console.log("\nDry run complete.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

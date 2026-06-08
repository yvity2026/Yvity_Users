import fs from "fs";
import path from "path";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { upsertUserToDb } from "@/lib/server/supabase/platform-supabase";

const DATA_DIR = path.join(process.cwd(), ".data");
const REGISTRATION_FILE = path.join(DATA_DIR, "registration.json");

export type RegisteredUser = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  profession: string;
  selfieUrl: string | null;
  identity_verified_at?: string;
  verification_selfie_url?: string | null;
  address_line?: string;
  pincode?: string;
  about?: string;
  createdAt: number;
  referral_code?: string;
  referred_by?: string;
};

export type RegistrationDb = {
  users: RegisteredUser[];
  selfieUrls: Record<string, string>;
};

let cache: RegistrationDb | null = null;

function emptyDb(): RegistrationDb {
  return { users: [], selfieUrls: {} };
}

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function loadRegistrationDb(): RegistrationDb {
  if (cache) return cache;

  try {
    ensureDataDir();
    const raw = fs.readFileSync(REGISTRATION_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<RegistrationDb>;
    cache = {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      selfieUrls:
        parsed.selfieUrls && typeof parsed.selfieUrls === "object" ? parsed.selfieUrls : {},
    };
  } catch {
    cache = emptyDb();
  }

  return cache;
}

export function saveRegistrationDb(next: RegistrationDb) {
  cache = next;
  ensureDataDir();
  fs.writeFileSync(REGISTRATION_FILE, JSON.stringify(next, null, 2), "utf-8");

  if (useSupabasePersistence()) {
    void Promise.all(next.users.map((user) => upsertUserToDb(user))).catch((error) => {
      console.error("[registration-store] Supabase sync failed:", error);
    });
  }
}

export function mutateRegistrationDb(mutator: (db: RegistrationDb) => void) {
  const db = loadRegistrationDb();
  mutator(db);
  saveRegistrationDb(db);
}

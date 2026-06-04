import fs from "fs";
import path from "path";

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
}

export function mutateRegistrationDb(mutator: (db: RegistrationDb) => void) {
  const db = loadRegistrationDb();
  mutator(db);
  saveRegistrationDb(db);
}

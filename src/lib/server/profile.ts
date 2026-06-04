import type { AuthUser } from "@/lib/auth-store";
import type { DashboardUser } from "@/context/AuthUserContext";
import { loadRegistrationDb, type RegisteredUser } from "@/lib/server/registration-store";
import {
  findUserByEmail,
  findUserByPhone,
  mutateRegistrationDb,
  normalizeEmail,
  normalizeIndianMobile,
  toAuthUser,
} from "@/lib/server/registration";

export function resolveRegisteredUser(session: AuthUser): RegisteredUser | null {
  if (session.id) {
    const byId = loadRegistrationDb().users.find((user) => user.id === session.id);
    if (byId) return byId;
  }

  const phone = normalizeIndianMobile(session.phone ?? session.identifier);
  return phone ? findUserByPhone(phone) : null;
}

export function toProfileUser(session: AuthUser, registered: RegisteredUser | null): DashboardUser {
  const phone = registered?.phone ?? session.phone ?? session.identifier ?? "";

  return {
    id: registered?.id ?? session.id,
    name: registered?.fullName ?? session.name,
    email: registered?.email ?? session.email,
    phone,
    mobile: phone,
    city: registered?.city ?? session.city,
    state: registered?.state ?? session.state,
    profession: registered?.profession ?? session.profession,
    address_line: registered?.address_line ?? session.address_line,
    pincode: registered?.pincode ?? session.pincode,
    about: registered?.about ?? session.about,
    selfie_url: registered?.selfieUrl ?? session.selfie_url ?? null,
    identity_verified_at: registered?.identity_verified_at ?? null,
    created_at: registered?.createdAt
      ? new Date(registered.createdAt).toISOString()
      : null,
    mobile_verified: Boolean(phone),
    email_verified: Boolean(registered?.email ?? session.email),
    roles: session.roles ?? [],
    onboarding_cta_completed: session.onboarding_cta_completed ?? false,
  };
}

export function normalizePincode(value: unknown): string | null {
  const digits = String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);
  return digits || null;
}

export function updateRegisteredUserProfile(
  session: AuthUser,
  updates: {
    name: string;
    profession?: string;
    city?: string;
    state?: string;
    address_line?: string;
    pincode?: string | null;
    about?: string;
  },
): RegisteredUser | null {
  const registered = resolveRegisteredUser(session);
  if (!registered) return null;

  mutateRegistrationDb((db) => {
    const index = db.users.findIndex((user) => user.id === registered.id);
    if (index < 0) return;

    db.users[index] = {
      ...db.users[index],
      fullName: updates.name,
      profession: updates.profession?.trim() ?? "",
      city: updates.city?.trim() ?? "",
      state: updates.state?.trim() ?? "",
      address_line: updates.address_line?.trim() ?? "",
      pincode: updates.pincode ?? "",
      about: updates.about?.trim() ?? "",
    };
  });

  return resolveRegisteredUser(session);
}

export function mergeSessionProfile(
  session: AuthUser,
  registered: RegisteredUser | null,
): AuthUser {
  const next = registered ? toAuthUser(registered) : { ...session };

  if (registered) {
    next.address_line = registered.address_line;
    next.pincode = registered.pincode;
    next.about = registered.about;
  }

  return next;
}

export function updateRegisteredMobile(
  session: AuthUser,
  newMobile: string,
): { user: RegisteredUser | null; error?: string } {
  const registered = resolveRegisteredUser(session);
  if (!registered) {
    return { user: null, error: "Account record not found" };
  }

  const normalized = normalizeIndianMobile(newMobile);
  const taken = findUserByPhone(normalized);
  if (taken && taken.id !== registered.id) {
    return { user: null, error: "This mobile number is already linked to another account" };
  }

  mutateRegistrationDb((db) => {
    const index = db.users.findIndex((user) => user.id === registered.id);
    if (index < 0) return;

    const previousPhone = db.users[index].phone;
    if (previousPhone && db.selfieUrls[previousPhone]) {
      db.selfieUrls[normalized] = db.selfieUrls[previousPhone];
      delete db.selfieUrls[previousPhone];
    }

    db.users[index] = { ...db.users[index], phone: normalized };
  });

  return { user: findUserByPhone(normalized) };
}

export function updateRegisteredEmail(
  session: AuthUser,
  newEmail: string,
): { user: RegisteredUser | null; error?: string } {
  const registered = resolveRegisteredUser(session);
  if (!registered) {
    return { user: null, error: "Account record not found" };
  }

  const normalized = normalizeEmail(newEmail);
  const taken = findUserByEmail(normalized);
  if (taken && taken.id !== registered.id) {
    return { user: null, error: "This email is already linked to another account" };
  }

  mutateRegistrationDb((db) => {
    const index = db.users.findIndex((user) => user.id === registered.id);
    if (index < 0) return;
    db.users[index] = { ...db.users[index], email: normalized };
  });

  return { user: findUserByEmail(normalized) };
}

export function updateRegisteredSelfie(session: AuthUser, url: string): RegisteredUser | null {
  const registered = resolveRegisteredUser(session);
  if (!registered) return null;

  mutateRegistrationDb((db) => {
    const index = db.users.findIndex((user) => user.id === registered.id);
    if (index < 0) return;
    db.users[index] = { ...db.users[index], selfieUrl: url };
  });

  return resolveRegisteredUser(session);
}

export function updateRegisteredIdentityRefresh(
  session: AuthUser,
  input: { verificationSelfieUrl: string; updateProfilePhoto: boolean },
): RegisteredUser | null {
  const registered = resolveRegisteredUser(session);
  if (!registered) return null;

  const now = new Date().toISOString();
  const verificationUrl = input.verificationSelfieUrl.trim();

  mutateRegistrationDb((db) => {
    const index = db.users.findIndex((user) => user.id === registered.id);
    if (index < 0) return;

    db.users[index] = {
      ...db.users[index],
      identity_verified_at: now,
      verification_selfie_url: verificationUrl,
      ...(input.updateProfilePhoto ? { selfieUrl: verificationUrl } : {}),
    };
  });

  return resolveRegisteredUser(session);
}

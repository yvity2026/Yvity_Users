import { randomUUID } from "crypto";
import type { AuthUser } from "@/lib/auth-store";
import { issueOtp, verifyIssuedOtp } from "@/lib/server/otp/service";
import { inferOtpChannel } from "@/lib/server/otp/purposes";
import { normalizeEmail, normalizeIndianMobile } from "@/lib/server/normalize-identifier";
import { loadRegistrationDb, mutateRegistrationDb, type RegisteredUser } from "@/lib/server/registration-store";
import { recordReferralOnRegistration } from "@/lib/server/referrals-store";

export type { RegisteredUser } from "@/lib/server/registration-store";
export { normalizeEmail, normalizeIndianMobile } from "@/lib/server/normalize-identifier";

export const PHONE_VERIFIED_COOKIE = "yvity_phone_verified";
export const EMAIL_VERIFIED_COOKIE = "yvity_email_verified";

export const EXISTING_PHONE_MESSAGE =
  "This mobile number is already registered with YVITY. Please log in to access your account.";
export const EXISTING_EMAIL_MESSAGE =
  "This email is already linked to an account. Log in or use a different email address.";

const VERIFIED_TTL_MS = 30 * 60 * 1000;

type VerifiedPayload = { identifier: string; expiresAt: number };

export function packVerifiedPayload(payload: VerifiedPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function unpackVerifiedPayload(raw: string | undefined): VerifiedPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as VerifiedPayload;
    if (!parsed?.identifier || !parsed?.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readVerifiedCookie(
  cookieValue: string | undefined,
  identifier: string,
): boolean {
  const payload = unpackVerifiedPayload(cookieValue);
  if (!payload || payload.identifier !== identifier) return false;
  if (Date.now() > payload.expiresAt) return false;
  return true;
}

/** Generate, persist, and deliver an OTP for the given identifier + purpose. */
export async function storeOtp(identifier: string, purpose: string) {
  const channel = inferOtpChannel(identifier);
  const result = await issueOtp({ identifier, purpose, channel });
  if (!result.ok) {
    throw new Error(result.error || "Unable to send verification code");
  }
  return result;
}

export async function consumeOtp(identifier: string, purpose: string, token: string): Promise<boolean> {
  return verifyIssuedOtp(identifier, purpose, token);
}

export function findUserByPhone(phone: string): RegisteredUser | null {
  const normalized = normalizeIndianMobile(phone);
  return loadRegistrationDb().users.find((user) => user.phone === normalized) ?? null;
}

export function findUserByEmail(email: string): RegisteredUser | null {
  const normalized = normalizeEmail(email);
  return loadRegistrationDb().users.find((user) => user.email === normalized) ?? null;
}

export function phoneExists(phone: string): boolean {
  return !!findUserByPhone(phone);
}

export function emailExists(email: string): boolean {
  return !!findUserByEmail(email);
}

export function createVerifiedPayload(identifier: string): VerifiedPayload {
  return { identifier, expiresAt: Date.now() + VERIFIED_TTL_MS };
}

export function registerUserRecord(input: {
  fullName: string;
  phone: string;
  dob: string;
  gender: string;
  email: string;
  city: string;
  state: string;
  profession: string;
  selfieUrl?: string | null;
  referralCode?: string | null;
}): RegisteredUser {
  const phone = normalizeIndianMobile(input.phone);
  const email = normalizeEmail(input.email);

  if (phoneExists(phone)) {
    throw new Error(EXISTING_PHONE_MESSAGE);
  }
  if (emailExists(email)) {
    throw new Error(EXISTING_EMAIL_MESSAGE);
  }

  const storedSelfie = getSelfieUrl(phone);
  const user: RegisteredUser = {
    id: randomUUID(),
    fullName: input.fullName.trim(),
    phone,
    email,
    dob: input.dob,
    gender: input.gender,
    city: input.city.trim(),
    state: input.state.trim(),
    profession: input.profession.trim(),
    selfieUrl: input.selfieUrl?.trim() || storedSelfie || null,
    identity_verified_at: new Date().toISOString(),
    verification_selfie_url: input.selfieUrl?.trim() || storedSelfie || null,
    createdAt: Date.now(),
  };

  mutateRegistrationDb((db) => {
    db.users.push(user);
  });

  if (input.referralCode) {
    try {
      recordReferralOnRegistration({
        referredUser: user,
        referralCode: input.referralCode,
      });
    } catch (error) {
      console.error("[registration] referral attribution failed:", error);
    }
  }

  return user;
}

export function toAuthUser(user: RegisteredUser): AuthUser {
  return {
    id: user.id,
    identifier: user.phone,
    method: "phone",
    loggedInAt: Date.now(),
    name: user.fullName,
    email: user.email,
    phone: user.phone,
    city: user.city,
    state: user.state,
    profession: user.profession,
    selfie_url: user.selfieUrl,
    address_line: user.address_line,
    pincode: user.pincode,
    about: user.about,
    roles: ["customer"],
    onboarding_cta_completed: false,
  };
}

export { mutateRegistrationDb } from "@/lib/server/registration-store";

export function saveSelfieUrl(mobile: string, url: string) {
  const normalized = normalizeIndianMobile(mobile);
  mutateRegistrationDb((db) => {
    db.selfieUrls[normalized] = url;
  });
}

export function getSelfieUrl(mobile: string): string | null {
  const normalized = normalizeIndianMobile(mobile);
  return loadRegistrationDb().selfieUrls[normalized] ?? null;
}

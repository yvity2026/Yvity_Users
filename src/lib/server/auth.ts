import { DUMMY_OTP } from "@/lib/constants";

export { DUMMY_OTP };

export type AuthMethod = "phone" | "email";

export function isValidIdentifier(method: AuthMethod, identifier: string): boolean {
  const trimmed = identifier.trim();
  if (method === "phone") {
    return /^[+\d][\d\s-]{6,15}$/.test(trimmed);
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function verifyOtpCode(otp: string): boolean {
  return otp.trim() === DUMMY_OTP;
}

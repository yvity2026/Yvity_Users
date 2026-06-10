import { verifyIssuedOtp } from "@/lib/server/otp/service";
import { inferOtpChannel } from "@/lib/server/otp/purposes";

export type AuthMethod = "phone" | "email";

export function isValidIdentifier(method: AuthMethod, identifier: string): boolean {
  const trimmed = identifier.trim();
  if (method === "phone") {
    return /^[+\d][\d\s-]{6,15}$/.test(trimmed);
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export async function verifyOtpCode(
  identifier: string,
  purpose: string,
  otp: string,
): Promise<boolean> {
  return verifyIssuedOtp(identifier, purpose, otp, inferOtpChannel(identifier));
}

/**
 * Public profile photo comes from the identity-verification selfie by default.
 * Advisors may replace it only via Profile & account (mobile + email OTP).
 */
export function resolveProfilePhotoUrl(selfieUrl?: string | null): string {
  return String(selfieUrl ?? "").trim();
}

export function hasProfilePhoto(selfieUrl?: string | null): boolean {
  return resolveProfilePhotoUrl(selfieUrl).length > 0;
}

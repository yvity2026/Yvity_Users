export const REFERRAL_STORAGE_KEY = "yvity_referral_code";

export function normalizeReferralCode(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function captureReferralCodeFromSearch(search: string) {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(search);
  const code = normalizeReferralCode(params.get("ref") || params.get("referral_code"));
  if (!code) return null;
  sessionStorage.setItem(REFERRAL_STORAGE_KEY, code);
  return code;
}

export function readStoredReferralCode() {
  if (typeof window === "undefined") return null;
  return normalizeReferralCode(sessionStorage.getItem(REFERRAL_STORAGE_KEY));
}

export function clearStoredReferralCode() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
}

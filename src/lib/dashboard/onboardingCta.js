import {
  DASHBOARD_PRIMARY_NAV,
  resolveDashboardNavHref,
} from "@/lib/dashboard/phase1Nav";

const LOCAL_KEY_PREFIX = "yvity_onboarding_cta_done_";

function localStorageKey(userId) {
  return `${LOCAL_KEY_PREFIX}${userId}`;
}

export function isOnboardingCtaCompleteLocal(userId) {
  if (!userId || typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(localStorageKey(userId)) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingCtaCompleteLocal(userId) {
  if (!userId || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(localStorageKey(userId), "1");
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Home onboarding guidance cards (not role selection).
 */
export function shouldShowOnboardingCta(user) {
  if (!user?.id) return false;
  if (user.onboarding_cta_completed === true) return false;
  if (isOnboardingCtaCompleteLocal(user.id)) return false;
  return true;
}

/** Same destination as bottom/top nav "My Space". */
export function getMySpaceNavHref(user, advisor) {
  const item =
    DASHBOARD_PRIMARY_NAV.find((entry) => entry.id === "my-space") ?? {
      id: "my-space",
      href: "/dashboard/my-space",
    };
  return resolveDashboardNavHref(item, user, advisor);
}

export async function persistOnboardingCtaComplete() {
  try {
    const response = await fetch("/api/auth/onboarding-cta", { method: "POST", credentials: "same-origin" });
    const result = await response.json();
    return Boolean(response.ok && result?.success);
  } catch {
    return false;
  }
}

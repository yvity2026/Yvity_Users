const DEVICE_TOKEN_STORAGE_KEY = "yvity_device_token";

function generateFallbackToken() {
  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function generateDeviceToken() {
  return typeof window.crypto?.randomUUID === "function"
    ? window.crypto.randomUUID()
    : generateFallbackToken();
}

export function getOrCreateDeviceToken() {
  if (typeof window === "undefined") return "";

  try {
    const existingToken = window.localStorage.getItem(DEVICE_TOKEN_STORAGE_KEY);

    if (existingToken) {
      return existingToken;
    }

    const token = generateDeviceToken();
    window.localStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
    return token;
  } catch {
    return "";
  }
}

export function createFreshDeviceToken() {
  if (typeof window === "undefined") return "";

  try {
    const token = generateDeviceToken();
    window.localStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
    return token;
  } catch {
    return "";
  }
}

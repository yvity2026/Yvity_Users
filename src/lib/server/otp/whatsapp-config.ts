import "server-only";

export function getWhatsAppAccessToken(): string | undefined {
  return (
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ||
    process.env.WHATSAPP_API_TOKEN?.trim() ||
    undefined
  );
}

/** Meta phone number IDs are numeric — strip accidental `/messages` suffixes from env. */
export function getWhatsAppPhoneNumberId(): string | undefined {
  const raw = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!raw) return undefined;

  const digits = raw.replace(/\D/g, "");
  return digits || undefined;
}

export function getOtpTemplateName(): string | undefined {
  return (
    process.env.WHATSAPP_OTP_TEMPLATE_NAME?.trim() ||
    process.env.WHATSAPP_TEMPLATE_NAME?.trim() ||
    undefined
  );
}

function getGraphApiVersion(): string {
  return process.env.WHATSAPP_GRAPH_API_VERSION?.trim() || "v21.0";
}

function normalizeGraphMessagesUrl(url: string): string {
  return url.replace(/\/+$/, "").replace(/\/messages\/messages$/i, "/messages");
}

/**
 * Meta Cloud API messages endpoint.
 * When WHATSAPP_PHONE_NUMBER_ID is set, always build the canonical Graph URL
 * and ignore WHATSAPP_API_URL to avoid double `/messages` path segments.
 */
export function getMetaOtpMessagesUrl(): string | undefined {
  const phoneNumberId = getWhatsAppPhoneNumberId();
  const version = getGraphApiVersion();

  if (phoneNumberId) {
    return `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
  }

  const explicit = process.env.WHATSAPP_API_URL?.trim();
  if (!explicit?.includes("graph.facebook.com")) return undefined;

  const normalized = normalizeGraphMessagesUrl(explicit);
  return normalized.endsWith("/messages") ? normalized : `${normalized}/messages`;
}

/**
 * Resolved WhatsApp send endpoint.
 * - Meta OTP: canonical Graph URL from phone number id.
 * - Gateway: WHATSAPP_API_URL as-is.
 */
export function getWhatsAppMessagesUrl(): string | undefined {
  if (useMetaOtpTemplate()) {
    return getMetaOtpMessagesUrl();
  }

  const explicit = process.env.WHATSAPP_API_URL?.trim();
  if (explicit) return explicit;

  return getMetaOtpMessagesUrl();
}

/** @deprecated use getWhatsAppMessagesUrl */
export function resolveWhatsAppMessagesUrl(): string | undefined {
  return getWhatsAppMessagesUrl();
}

export function getWhatsAppApiUrl(): string | undefined {
  return process.env.WHATSAPP_API_URL?.trim() || getWhatsAppMessagesUrl();
}

function isMetaGraphEndpoint(): boolean {
  if (getWhatsAppPhoneNumberId()) return true;
  const explicit = process.env.WHATSAPP_API_URL?.trim();
  return Boolean(explicit?.includes("graph.facebook.com"));
}

export function useMetaOtpTemplate(): boolean {
  const mode = (process.env.WHATSAPP_OTP_DELIVERY_MODE || "").trim().toLowerCase();
  if (mode === "gateway") return false;
  if (!getOtpTemplateName()) return false;
  if (mode === "meta") return true;
  if (getWhatsAppPhoneNumberId()) return true;

  return isMetaGraphEndpoint();
}

export function isWhatsAppOtpConfigured(): boolean {
  return Boolean(getWhatsAppAccessToken() && getWhatsAppMessagesUrl());
}

export function buildOtpWhatsAppMessage(code: string): string {
  const template = process.env.WHATSAPP_OTP_MESSAGE?.trim();
  if (template?.includes("{code}")) {
    return template.replaceAll("{code}", code);
  }
  return `Your YVITY verification code is ${code}. Valid for 10 minutes. Do not share this code with anyone.`;
}

export function describeWhatsAppOtpConfig(): Record<string, unknown> {
  return {
    configured: isWhatsAppOtpConfigured(),
    deliveryMode: useMetaOtpTemplate() ? "meta" : "gateway",
    messagesUrl: getWhatsAppMessagesUrl() ?? null,
    hasAccessToken: Boolean(getWhatsAppAccessToken()),
    phoneNumberId: getWhatsAppPhoneNumberId() ?? null,
    templateName: getOtpTemplateName() ?? null,
    templateLanguage: process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE?.trim() || "en",
    graphApiVersion: getGraphApiVersion(),
    note: getWhatsAppPhoneNumberId()
      ? "Meta OTP ignores WHATSAPP_API_URL and builds Graph URL from WHATSAPP_PHONE_NUMBER_ID."
      : null,
  };
}

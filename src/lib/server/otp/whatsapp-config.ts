import "server-only";

export function getWhatsAppAccessToken(): string | undefined {
  return (
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ||
    process.env.WHATSAPP_API_TOKEN?.trim() ||
    undefined
  );
}

export function getWhatsAppPhoneNumberId(): string | undefined {
  return process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || undefined;
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

/** Meta Cloud API messages endpoint — ignores legacy gateway WHATSAPP_API_URL. */
export function getMetaOtpMessagesUrl(): string | undefined {
  const explicit = process.env.WHATSAPP_API_URL?.trim();
  const phoneNumberId = getWhatsAppPhoneNumberId();

  if (explicit?.includes("/messages") && explicit.includes("graph.facebook.com")) {
    return explicit;
  }

  if (explicit?.includes("graph.facebook.com")) {
    let base = explicit.replace(/\/$/, "");
    if (phoneNumberId && !base.includes(phoneNumberId)) {
      base = `${base}/${phoneNumberId}`;
    }
    return `${base}/messages`;
  }

  if (!phoneNumberId) return undefined;
  return `https://graph.facebook.com/${getGraphApiVersion()}/${phoneNumberId}/messages`;
}

/**
 * Resolved WhatsApp send endpoint.
 * - Meta OTP: always Graph API when template + phone id (or mode=meta).
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
  const explicit = process.env.WHATSAPP_API_URL?.trim();
  if (explicit?.includes("graph.facebook.com")) return true;
  return Boolean(getWhatsAppPhoneNumberId());
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
  };
}

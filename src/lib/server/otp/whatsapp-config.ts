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

/**
 * Resolved WhatsApp send endpoint.
 * - Custom gateway: WHATSAPP_API_URL as-is (no phone-id suffix).
 * - Meta Graph: build from base + WHATSAPP_PHONE_NUMBER_ID, or phone id alone.
 */
export function getWhatsAppMessagesUrl(): string | undefined {
  const explicit = process.env.WHATSAPP_API_URL?.trim();

  if (explicit) {
    if (explicit.includes("/messages")) return explicit;

    if (explicit.includes("graph.facebook.com")) {
      const phoneNumberId = getWhatsAppPhoneNumberId();
      let base = explicit.replace(/\/$/, "");
      if (phoneNumberId && !base.includes(phoneNumberId)) {
        base = `${base}/${phoneNumberId}`;
      }
      return `${base}/messages`;
    }

    return explicit;
  }

  const phoneNumberId = getWhatsAppPhoneNumberId();
  if (!phoneNumberId) return undefined;

  const version = process.env.WHATSAPP_GRAPH_API_VERSION?.trim() || "v21.0";
  return `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
}

/** @deprecated use getWhatsAppMessagesUrl */
export function resolveWhatsAppMessagesUrl(): string | undefined {
  return getWhatsAppMessagesUrl();
}

export function getWhatsAppApiUrl(): string | undefined {
  return process.env.WHATSAPP_API_URL?.trim() || getWhatsAppMessagesUrl();
}

function isMetaGraphEndpoint(): boolean {
  return (getWhatsAppMessagesUrl() || "").includes("graph.facebook.com");
}

/**
 * Meta Graph template send when a template name is configured and we're not in gateway mode.
 */
export function useMetaOtpTemplate(): boolean {
  const mode = (process.env.WHATSAPP_OTP_DELIVERY_MODE || "").trim().toLowerCase();
  if (mode === "gateway") return false;
  if (!getOtpTemplateName()) return false;
  if (mode === "meta") return true;

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

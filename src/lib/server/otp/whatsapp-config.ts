import "server-only";

export function getWhatsAppApiUrl(): string | undefined {
  return process.env.WHATSAPP_API_URL?.trim() || undefined;
}

/** Vercel uses WHATSAPP_ACCESS_TOKEN; WHATSAPP_API_TOKEN is accepted as an alias. */
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

export function resolveWhatsAppMessagesUrl(): string | undefined {
  const apiUrl = getWhatsAppApiUrl();
  if (!apiUrl) return undefined;

  if (apiUrl.includes("/messages")) return apiUrl;

  const phoneNumberId = getWhatsAppPhoneNumberId();
  let base = apiUrl.replace(/\/$/, "");

  if (phoneNumberId && !base.includes(phoneNumberId)) {
    base = `${base}/${phoneNumberId}`;
  }

  if (base.includes("graph.facebook.com") || phoneNumberId) {
    return `${base}/messages`;
  }

  return apiUrl;
}

/**
 * Meta Graph template send — for graph.facebook.com URLs with a template name.
 * Custom gateways always use plain `{ to, message }` even if a template name env exists.
 */
export function useMetaOtpTemplate(): boolean {
  const mode = (process.env.WHATSAPP_OTP_DELIVERY_MODE || "").trim().toLowerCase();
  if (mode === "gateway") return false;
  if (mode === "meta") return Boolean(getOtpTemplateName());

  const apiUrl = (getWhatsAppApiUrl() || "").toLowerCase();
  if (!apiUrl.includes("graph.facebook.com")) {
    return false;
  }

  return Boolean(getOtpTemplateName());
}

export function isWhatsAppOtpConfigured(): boolean {
  return Boolean(getWhatsAppAccessToken() && resolveWhatsAppMessagesUrl());
}

export function buildOtpWhatsAppMessage(code: string): string {
  const template = process.env.WHATSAPP_OTP_MESSAGE?.trim();
  if (template?.includes("{code}")) {
    return template.replaceAll("{code}", code);
  }
  return `Your YVITY verification code is ${code}. Valid for 10 minutes. Do not share this code with anyone.`;
}

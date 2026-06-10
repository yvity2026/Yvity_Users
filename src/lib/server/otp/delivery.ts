import "server-only";

import { appendOutboundLog } from "@/lib/server/outbound-log";
import {
  buildOtpWhatsAppMessage,
  getOtpTemplateName,
  getWhatsAppAccessToken,
  getWhatsAppMessagesUrl,
  isWhatsAppOtpConfigured,
  useMetaOtpTemplate,
} from "@/lib/server/otp/whatsapp-config";

export { isWhatsAppOtpConfigured } from "@/lib/server/otp/whatsapp-config";

export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

function getSmtpConfig() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) return null;

  return {
    user,
    pass,
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT?.trim() || "465"),
    secure: process.env.SMTP_SECURE?.trim() !== "false",
    from: process.env.YVITY_EMAIL_FROM?.trim() || `YVITY <${user}>`,
  };
}

export function isEmailOtpConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() || getSmtpConfig());
}

export function buildOtpEmailContent(code: string): { subject: string; text: string; html: string } {
  const subject = "Your YVITY verification code";
  const text = `Your YVITY verification code is ${code}. It is valid for 10 minutes. Do not share this code with anyone.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <p style="color:#0A4A4A;font-size:14px;margin:0 0 16px;">YVITY verification</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#0A4A4A;margin:0 0 12px;">${code}</p>
      <p style="color:#4B5563;font-size:14px;line-height:1.6;margin:0;">
        This code is valid for 10 minutes. Do not share it with anyone.
      </p>
    </div>
  `.trim();
  return { subject, text, html };
}

function buildMetaOtpPayload(to: string, code: string, includeButton: boolean) {
  const templateName = getOtpTemplateName();
  if (!templateName) {
    throw new Error("WHATSAPP_OTP_TEMPLATE_NAME is not configured");
  }

  const language = process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE?.trim() || "en";
  const buttonSubType = process.env.WHATSAPP_OTP_BUTTON_SUB_TYPE?.trim() || "copy_code";
  const buttonParamType = buttonSubType === "copy_code" ? "coupon_code" : "text";
  const buttonParameter =
    buttonParamType === "coupon_code"
      ? { type: "coupon_code" as const, coupon_code: code }
      : { type: "text" as const, text: code };

  const components: Array<Record<string, unknown>> = [
    {
      type: "body",
      parameters: [{ type: "text", text: code }],
    },
  ];

  if (includeButton) {
    components.push({
      type: "button",
      sub_type: buttonSubType,
      index: "0",
      parameters: [buttonParameter],
    });
  }

  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
      components,
    },
  };
}

function parseWhatsAppApiError(responseText: string): string {
  try {
    const data = JSON.parse(responseText) as {
      error?: { message?: string; error_data?: { details?: string } };
    };
    return (
      data.error?.error_data?.details ||
      data.error?.message ||
      responseText.slice(0, 300)
    );
  } catch {
    return responseText.slice(0, 300);
  }
}

async function postWhatsAppRequest(input: {
  url: string;
  token: string;
  body: Record<string, unknown>;
  preview: string;
  to: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(input.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input.body),
    });

    const responseText = await res.text();
    const apiError = res.ok ? undefined : parseWhatsAppApiError(responseText);

    await appendOutboundLog({
      channel: "whatsapp",
      to: input.to,
      preview: input.preview.slice(0, 180),
      status: res.ok ? "sent" : "failed",
      error: apiError,
    });

    if (!res.ok) {
      console.error("[YVITY otp whatsapp]", res.status, responseText.slice(0, 800));
    }

    return { ok: res.ok, error: apiError };
  } catch (error) {
    const message = error instanceof Error ? error.message : "send failed";
    await appendOutboundLog({
      channel: "whatsapp",
      to: input.to,
      preview: input.preview.slice(0, 180),
      status: "failed",
      error: message,
    });
    return { ok: false, error: message };
  }
}

async function sendMetaOtpTemplate(input: {
  phone: string;
  code: string;
  apiUrl: string;
  apiToken: string;
}): Promise<{ ok: boolean; error?: string }> {
  const includeButtonEnv = process.env.WHATSAPP_OTP_INCLUDE_BUTTON?.trim();
  const attempts =
    includeButtonEnv === "true"
      ? [true]
      : includeButtonEnv === "false"
        ? [false]
        : [false, true];

  let lastError: string | undefined;

  for (const includeButton of attempts) {
    const payload = buildMetaOtpPayload(input.phone, input.code, includeButton);
    const result = await postWhatsAppRequest({
      url: input.apiUrl,
      token: input.apiToken,
      body: payload,
      preview: `template:${payload.template.name}${includeButton ? "+button" : ""}`,
      to: input.phone,
    });

    if (result.ok) return result;
    lastError = result.error;

    const retryable =
      !includeButton &&
      (result.error?.toLowerCase().includes("button") ||
        result.error?.toLowerCase().includes("component") ||
        result.error?.includes("132000") ||
        result.error?.toLowerCase().includes("parameter"));

    if (!retryable || includeButtonEnv !== undefined) {
      return result;
    }
  }

  return { ok: false, error: lastError };
}

export async function sendOtpWhatsApp(input: {
  phone: string;
  code: string;
}): Promise<{ ok: boolean; mode: "api" | "logged" | "missing"; error?: string }> {
  const phone = normalizeIndianPhone(input.phone);
  const apiUrl = getWhatsAppMessagesUrl();
  const apiToken = getWhatsAppAccessToken();

  if (!apiUrl || !apiToken) {
    console.info("[YVITY otp whatsapp:missing-config]", phone);
    return { ok: false, mode: "missing", error: "missing WhatsApp config" };
  }

  console.info("[YVITY otp whatsapp:send]", {
    mode: useMetaOtpTemplate() ? "meta" : "gateway",
    url: apiUrl,
    phone,
  });

  if (useMetaOtpTemplate()) {
    const result = await sendMetaOtpTemplate({
      phone,
      code: input.code,
      apiUrl,
      apiToken,
    });
    return { ok: result.ok, mode: "api", error: result.error };
  }

  const message = buildOtpWhatsAppMessage(input.code);
  const result = await postWhatsAppRequest({
    url: apiUrl,
    token: apiToken,
    body: { to: phone, message },
    preview: message,
    to: phone,
  });
  return { ok: result.ok, mode: "api", error: result.error };
}

async function sendEmailViaResend(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: boolean; mode: "resend" | "missing" }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.YVITY_EMAIL_FROM?.trim() || "YVITY <onboarding@yvity.in>";
  if (!apiKey) return { ok: false, mode: "missing" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    await appendOutboundLog({
      channel: "email",
      to: input.to,
      subject: input.subject,
      preview: input.text.slice(0, 180),
      status: res.ok ? "sent" : "failed",
      error: res.ok ? undefined : (await res.text()).slice(0, 500),
    });
    return { ok: res.ok, mode: "resend" };
  } catch (error) {
    await appendOutboundLog({
      channel: "email",
      to: input.to,
      subject: input.subject,
      preview: input.text.slice(0, 180),
      status: "failed",
      error: error instanceof Error ? error.message : "send failed",
    });
    return { ok: false, mode: "missing" };
  }
}

async function sendEmailViaSmtp(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: boolean; mode: "smtp" | "missing" }> {
  const smtp = getSmtpConfig();
  if (!smtp) return { ok: false, mode: "missing" };

  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    await transport.sendMail({
      from: smtp.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    await appendOutboundLog({
      channel: "email",
      to: input.to,
      subject: input.subject,
      preview: input.text.slice(0, 180),
      status: "sent",
    });
    return { ok: true, mode: "smtp" };
  } catch (error) {
    await appendOutboundLog({
      channel: "email",
      to: input.to,
      subject: input.subject,
      preview: input.text.slice(0, 180),
      status: "failed",
      error: error instanceof Error ? error.message : "send failed",
    });
    return { ok: false, mode: "missing" };
  }
}

export async function sendOtpEmail(input: {
  to: string;
  code: string;
}): Promise<{ ok: boolean; mode: "resend" | "smtp" | "logged" | "missing" }> {
  const { subject, text, html } = buildOtpEmailContent(input.code);

  if (getSmtpConfig()) {
    const smtpResult = await sendEmailViaSmtp({ to: input.to, subject, text, html });
    if (smtpResult.ok) return smtpResult;
  }

  if (process.env.RESEND_API_KEY?.trim()) {
    return sendEmailViaResend({ to: input.to, subject, text, html });
  }

  console.info("[YVITY otp email:missing-config]", input.to);
  return { ok: false, mode: "missing" };
}

/** Approval / notification WhatsApp — Meta template or gateway `{ to, message }`. */
export async function sendWhatsAppMessage(input: {
  phone: string;
  message: string;
}): Promise<{ ok: boolean; waUrl: string; mode: "api" | "logged" }> {
  const phone = normalizeIndianPhone(input.phone);
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(input.message)}`;
  const apiUrl = getWhatsAppMessagesUrl();
  const apiToken = getWhatsAppAccessToken();

  if (apiUrl && apiToken) {
    const result = await postWhatsAppRequest({
      url: apiUrl,
      token: apiToken,
      body: { to: phone, message: input.message },
      preview: input.message,
      to: phone,
    });
    return { ok: result.ok, waUrl, mode: "api" };
  }

  console.info("[YVITY outbound whatsapp]", phone, waUrl);
  await appendOutboundLog({
    channel: "whatsapp",
    to: phone,
    preview: input.message.slice(0, 180),
    status: "logged",
  });
  return { ok: true, waUrl, mode: "logged" };
}

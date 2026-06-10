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
  const digits = String(phone || "").replace(/\D/g, "");
  const mobile =
    digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.slice(-10);

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new Error("Invalid Indian mobile number for WhatsApp OTP");
  }

  return `91${mobile}`;
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

function buildMetaOtpPayload(
  to: string,
  code: string,
  options: { includeButton: boolean; buttonSubType?: "url" | "copy_code" },
) {
  const templateName = getOtpTemplateName();
  if (!templateName) {
    throw new Error("WHATSAPP_OTP_TEMPLATE_NAME is not configured");
  }

  const language = process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE?.trim() || "en";
  const buttonSubType =
    options.buttonSubType ||
    (process.env.WHATSAPP_OTP_BUTTON_SUB_TYPE?.trim() as "url" | "copy_code" | undefined) ||
    "url";
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

  if (options.includeButton) {
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

function hasMetaMessageId(responseText: string): boolean {
  try {
    const data = JSON.parse(responseText) as { messages?: Array<{ id?: string }> };
    return Boolean(data.messages?.[0]?.id);
  } catch {
    return false;
  }
}

async function postWhatsAppRequest(input: {
  url: string;
  token: string;
  body: Record<string, unknown>;
  preview: string;
  to: string;
}): Promise<{ ok: boolean; error?: string }> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
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
      const isMeta = input.url.includes("graph.facebook.com");
      const metaAccepted = !isMeta || hasMetaMessageId(responseText);
      const apiError = res.ok
        ? metaAccepted
          ? undefined
          : "Meta API accepted request but returned no message id"
        : parseWhatsAppApiError(responseText);

      await appendOutboundLog({
        channel: "whatsapp",
        to: input.to,
        preview: input.preview.slice(0, 180),
        status: res.ok && metaAccepted ? "sent" : "failed",
        error: apiError,
      });

      if (res.ok && metaAccepted) {
        console.info("[YVITY otp whatsapp:ok]", responseText.slice(0, 300));
        return { ok: true };
      }

      lastError = apiError;
      console.error(
        `[YVITY otp whatsapp:attempt-${attempt}]`,
        res.status,
        responseText.slice(0, 800),
      );
    } catch (error) {
      lastError = error instanceof Error ? error.message : "send failed";
      console.error(`[YVITY otp whatsapp:attempt-${attempt}]`, lastError);
    }
  }

  await appendOutboundLog({
    channel: "whatsapp",
    to: input.to,
    preview: input.preview.slice(0, 180),
    status: "failed",
    error: lastError,
  });

  return { ok: false, error: lastError };
}

async function sendMetaOtpTemplate(input: {
  phone: string;
  code: string;
  apiUrl: string;
  apiToken: string;
}): Promise<{ ok: boolean; error?: string }> {
  const includeButtonEnv = process.env.WHATSAPP_OTP_INCLUDE_BUTTON?.trim();
  const explicitSubType = process.env.WHATSAPP_OTP_BUTTON_SUB_TYPE?.trim() as
    | "url"
    | "copy_code"
    | undefined;

  type MetaOtpAttempt = { includeButton: boolean; buttonSubType?: "url" | "copy_code" };

  let attempts: MetaOtpAttempt[];
  if (includeButtonEnv === "false") {
    attempts = [{ includeButton: false }];
  } else if (explicitSubType) {
    attempts = [{ includeButton: false }, { includeButton: true, buttonSubType: explicitSubType }];
  } else if (includeButtonEnv === "true") {
    attempts = [{ includeButton: true, buttonSubType: "url" }];
  } else {
    attempts = [
      { includeButton: false },
      { includeButton: true, buttonSubType: "url" },
      { includeButton: true, buttonSubType: "copy_code" },
    ];
  }

  let lastError: string | undefined;

  for (const attempt of attempts) {
    const payload = buildMetaOtpPayload(input.phone, input.code, attempt);
    const label = attempt.includeButton
      ? `+button:${attempt.buttonSubType || "url"}`
      : "+body";
    const result = await postWhatsAppRequest({
      url: input.apiUrl,
      token: input.apiToken,
      body: payload,
      preview: `template:${payload.template.name}${label}`,
      to: input.phone,
    });

    if (result.ok) return result;
    lastError = result.error;

    const errorText = (result.error || "").toLowerCase();
    const needsUrlButton = errorText.includes("type url");
    const needsCopyButton = errorText.includes("copy_code") || errorText.includes("copy code");

    if (needsUrlButton && attempt.includeButton && attempt.buttonSubType !== "url") {
      continue;
    }
    if (needsCopyButton && attempt.includeButton && attempt.buttonSubType !== "copy_code") {
      continue;
    }

    const retryable =
      !attempt.includeButton &&
      (errorText.includes("button") ||
        errorText.includes("component") ||
        (result.error || "").includes("132000") ||
        errorText.includes("parameter"));

    if (!retryable || includeButtonEnv !== undefined || explicitSubType) {
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

import "server-only";

import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";

type OutboundLogEntry = {
  id: string;
  channel: "email" | "whatsapp";
  to: string;
  subject?: string;
  preview: string;
  status: "sent" | "logged" | "failed";
  error?: string;
  createdAt: string;
};

const OUTBOUND_FILE = "outbound-messages.json";

async function appendOutboundLog(entry: Omit<OutboundLogEntry, "id" | "createdAt">) {
  const db = await loadJsonFile<{ items: OutboundLogEntry[] }>(OUTBOUND_FILE, { items: [] });
  db.items.unshift({
    ...entry,
    id: `out_${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
  await saveJsonFile(OUTBOUND_FILE, db);
}

export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

export function isWhatsAppOtpConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_API_URL?.trim() && process.env.WHATSAPP_API_TOKEN?.trim(),
  );
}

export function isEmailOtpConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function buildOtpWhatsAppMessage(code: string): string {
  const template = process.env.WHATSAPP_OTP_MESSAGE?.trim();
  if (template?.includes("{code}")) {
    return template.replaceAll("{code}", code);
  }
  return `Your YVITY verification code is ${code}. Valid for 10 minutes. Do not share this code with anyone.`;
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

export async function sendOtpWhatsApp(input: {
  phone: string;
  code: string;
}): Promise<{ ok: boolean; mode: "api" | "logged" | "missing" }> {
  const phone = normalizeIndianPhone(input.phone);
  const message = buildOtpWhatsAppMessage(input.code);
  const apiUrl = process.env.WHATSAPP_API_URL?.trim();
  const apiToken = process.env.WHATSAPP_API_TOKEN?.trim();

  if (!apiUrl || !apiToken) {
    console.info("[YVITY otp whatsapp:missing-config]", phone);
    return { ok: false, mode: "missing" };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: phone, message }),
    });
    await appendOutboundLog({
      channel: "whatsapp",
      to: phone,
      preview: message.slice(0, 180),
      status: res.ok ? "sent" : "failed",
      error: res.ok ? undefined : (await res.text()).slice(0, 500),
    });
    return { ok: res.ok, mode: "api" };
  } catch (error) {
    await appendOutboundLog({
      channel: "whatsapp",
      to: phone,
      preview: message.slice(0, 180),
      status: "failed",
      error: error instanceof Error ? error.message : "send failed",
    });
    return { ok: false, mode: "api" };
  }
}

export async function sendOtpEmail(input: {
  to: string;
  code: string;
}): Promise<{ ok: boolean; mode: "resend" | "logged" | "missing" }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.YVITY_EMAIL_FROM?.trim() || "YVITY <onboarding@yvity.in>";
  const { subject, text, html } = buildOtpEmailContent(input.code);

  if (!apiKey) {
    console.info("[YVITY otp email:missing-config]", input.to);
    return { ok: false, mode: "missing" };
  }

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
        subject,
        html,
        text,
      }),
    });
    await appendOutboundLog({
      channel: "email",
      to: input.to,
      subject,
      preview: text.slice(0, 180),
      status: res.ok ? "sent" : "failed",
      error: res.ok ? undefined : (await res.text()).slice(0, 500),
    });
    return { ok: res.ok, mode: "resend" };
  } catch (error) {
    await appendOutboundLog({
      channel: "email",
      to: input.to,
      subject,
      preview: text.slice(0, 180),
      status: "failed",
      error: error instanceof Error ? error.message : "send failed",
    });
    return { ok: false, mode: "missing" };
  }
}

/** Approval / notification WhatsApp — same API contract as OTP delivery. */
export async function sendWhatsAppMessage(input: {
  phone: string;
  message: string;
}): Promise<{ ok: boolean; waUrl: string; mode: "api" | "logged" }> {
  const phone = normalizeIndianPhone(input.phone);
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(input.message)}`;
  const apiUrl = process.env.WHATSAPP_API_URL?.trim();
  const apiToken = process.env.WHATSAPP_API_TOKEN?.trim();

  if (apiUrl && apiToken) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: phone, message: input.message }),
      });
      await appendOutboundLog({
        channel: "whatsapp",
        to: phone,
        preview: input.message.slice(0, 180),
        status: res.ok ? "sent" : "failed",
        error: res.ok ? undefined : (await res.text()).slice(0, 500),
      });
      return { ok: res.ok, waUrl, mode: "api" };
    } catch (error) {
      await appendOutboundLog({
        channel: "whatsapp",
        to: phone,
        preview: input.message.slice(0, 180),
        status: "failed",
        error: error instanceof Error ? error.message : "send failed",
      });
      return { ok: false, waUrl, mode: "api" };
    }
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

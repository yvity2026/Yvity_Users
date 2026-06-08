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

const FILE = "outbound-messages.json";

async function appendOutboundLog(entry: Omit<OutboundLogEntry, "id" | "createdAt">) {
  const db = await loadJsonFile<{ items: OutboundLogEntry[] }>(FILE, { items: [] });
  db.items.unshift({
    ...entry,
    id: `out_${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
  await saveJsonFile(FILE, db);
}

function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

export async function sendApprovalEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: boolean; mode: "resend" | "logged" }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.YVITY_EMAIL_FROM?.trim() || "YVITY <onboarding@yvity.in>";

  if (apiKey) {
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
      if (!res.ok) {
        const err = await res.text();
        await appendOutboundLog({
          channel: "email",
          to: input.to,
          subject: input.subject,
          preview: input.text.slice(0, 180),
          status: "failed",
          error: err.slice(0, 500),
        });
        return { ok: false, mode: "resend" };
      }
      await appendOutboundLog({
        channel: "email",
        to: input.to,
        subject: input.subject,
        preview: input.text.slice(0, 180),
        status: "sent",
      });
      return { ok: true, mode: "resend" };
    } catch (error) {
      await appendOutboundLog({
        channel: "email",
        to: input.to,
        subject: input.subject,
        preview: input.text.slice(0, 180),
        status: "failed",
        error: error instanceof Error ? error.message : "send failed",
      });
      return { ok: false, mode: "resend" };
    }
  }

  console.info("[YVITY outbound email]", input.to, input.subject);
  await appendOutboundLog({
    channel: "email",
    to: input.to,
    subject: input.subject,
    preview: input.text.slice(0, 180),
    status: "logged",
  });
  return { ok: true, mode: "logged" };
}

export async function sendApprovalWhatsApp(input: {
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

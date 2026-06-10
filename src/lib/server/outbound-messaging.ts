import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { sendWhatsAppMessage } from "@/lib/server/otp/delivery";

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
  return sendWhatsAppMessage(input);
}

import { appendOutboundLog } from "@/lib/server/outbound-log";
import { sendWhatsAppMessage } from "@/lib/server/otp/delivery";

async function sendApprovalEmailViaResend(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.YVITY_EMAIL_FROM?.trim() || "YVITY <onboarding@yvity.in>";
  if (!apiKey) return false;

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

  return res.ok;
}

async function sendApprovalEmailViaSmtp(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) return false;

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT?.trim() || "465");
  const secure = process.env.SMTP_SECURE?.trim() !== "false";
  const from = process.env.YVITY_EMAIL_FROM?.trim() || `YVITY <${user}>`;

  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    await transport.sendMail({
      from,
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
    return true;
  } catch (error) {
    await appendOutboundLog({
      channel: "email",
      to: input.to,
      subject: input.subject,
      preview: input.text.slice(0, 180),
      status: "failed",
      error: error instanceof Error ? error.message : "send failed",
    });
    return false;
  }
}

export async function sendApprovalEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: boolean; mode: "resend" | "smtp" | "logged" }> {
  if (process.env.EMAIL_USER?.trim() && process.env.EMAIL_PASS?.trim()) {
    const ok = await sendApprovalEmailViaSmtp(input);
    if (ok) return { ok: true, mode: "smtp" };
  }

  if (process.env.RESEND_API_KEY?.trim()) {
    const ok = await sendApprovalEmailViaResend(input);
    return { ok, mode: "resend" };
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

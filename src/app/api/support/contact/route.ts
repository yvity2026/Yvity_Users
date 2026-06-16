import { NextResponse } from "next/server";
import { sendApprovalEmail } from "@/lib/server/outbound-messaging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";

    if (name.length < 2) {
      return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (subject.length < 3) {
      return NextResponse.json({ error: "Please enter a subject" }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Please enter a message (at least 10 characters)" }, { status: 400 });
    }

    const supportEmail = process.env.YVITY_SUPPORT_EMAIL?.trim() || "support@yvity.com";

    await sendApprovalEmail(
      {
        to: supportEmail,
        subject: `[YVITY Support] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0A4A4A;">
  <h2 style="margin:0 0 16px;font-size:18px;">New Support Inquiry</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    <tr><td style="padding:6px 0;font-weight:600;width:80px;">Name</td><td style="padding:6px 0;">${name}</td></tr>
    <tr><td style="padding:6px 0;font-weight:600;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}">${email}</a></td></tr>
    <tr><td style="padding:6px 0;font-weight:600;">Subject</td><td style="padding:6px 0;">${subject}</td></tr>
  </table>
  <div style="background:#F8F6F1;border-radius:12px;padding:16px;white-space:pre-wrap;font-size:14px;line-height:1.6;">${message}</div>
</body>
</html>`,
      },
      "support",
    );

    // Auto-reply to sender
    await sendApprovalEmail(
      {
        to: email,
        subject: "We received your message — YVITY Support",
        text: `Hi ${name},\n\nThank you for reaching out. We've received your message and will get back to you within 24–48 business hours.\n\nYour message:\n"${message}"\n\n— Team YVITY\nsupport@yvity.com`,
        html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F6F1;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F8F6F1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #E4E2DB;">
        <tr><td style="background:linear-gradient(135deg,#0A4A4A,#0D6060);padding:24px 28px;">
          <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.75);">YVITY Support</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#fff;font-weight:700;">We got your message ✅</h1>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 14px;font-size:15px;color:#374151;">Hi <strong>${name}</strong>,</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#374151;">Thank you for contacting YVITY. We've received your message and will respond within <strong>24–48 business hours</strong>.</p>
          <div style="background:#F8F6F1;border-radius:12px;padding:14px 16px;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6B7280;">Your message</p>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#374151;">${message}</p>
          </div>
          <p style="margin:0;font-size:13px;color:#6B7280;">For urgent issues, email us directly at <a href="mailto:support@yvity.com" style="color:#0A4A4A;font-weight:600;">support@yvity.com</a></p>
          <p style="margin:20px 0 0;font-size:13px;color:#6B7280;">— Team YVITY · Credibility that Connects</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      },
      "support",
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

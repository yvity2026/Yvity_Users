type PaymentSuccessInput = {
  advisorName: string;
  planName: string;
  amountInr: number;
  invoiceId: string;
  paidAt: string;
  dashboardUrl: string;
};

type PaymentFailedInput = {
  advisorName: string;
  planName: string;
  retryUrl: string;
};

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function buildPaymentSuccessWhatsAppMessage(input: PaymentSuccessInput): string {
  return [
    "✅ *Payment Confirmed — YVITY Membership*",
    "",
    `Hi ${input.advisorName},`,
    "",
    `Your *${input.planName} membership* is now active.`,
    "",
    `🧾 Invoice ID: ${input.invoiceId}`,
    `💰 Amount paid: ${formatInr(input.amountInr)}`,
    `📅 Date: ${formatDate(input.paidAt)}`,
    "",
    "Your membership benefits are live. Visit your dashboard to view your invoice and manage your account.",
    "",
    `Dashboard: ${input.dashboardUrl}`,
    "",
    "— Team YVITY",
    "Credibility that Connects",
  ].join("\n");
}

export function buildPaymentFailedWhatsAppMessage(input: PaymentFailedInput): string {
  return [
    "⚠️ *Payment Failed — YVITY Membership*",
    "",
    `Hi ${input.advisorName},`,
    "",
    `We were unable to process your payment for the *${input.planName} membership*.`,
    "",
    "This can happen due to a bank decline, network issue, or UPI timeout.",
    "Your account has not been charged.",
    "",
    "Please retry your payment from your dashboard:",
    input.retryUrl,
    "",
    "If the problem persists, contact your bank or try a different payment method.",
    "",
    "— Team YVITY",
    "Credibility that Connects",
  ].join("\n");
}

export function buildPaymentSuccessEmail(input: PaymentSuccessInput): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Payment confirmed — YVITY ${input.planName} membership`;

  const text = [
    `Hi ${input.advisorName},`,
    "",
    `Your YVITY ${input.planName} membership payment has been confirmed.`,
    "",
    `Invoice ID: ${input.invoiceId}`,
    `Amount paid: ${formatInr(input.amountInr)}`,
    `Date: ${formatDate(input.paidAt)}`,
    "",
    "You can view and download your invoice from your dashboard.",
    `Dashboard: ${input.dashboardUrl}`,
    "",
    "Thank you for your membership.",
    "— Team YVITY",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F6F1;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0A4A4A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F8F6F1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E4E2DB;box-shadow:0 12px 40px rgba(10,74,74,0.08);">
        <tr><td style="background:linear-gradient(135deg,#0A4A4A 0%,#0D6060 55%,#F59E0B 100%);padding:28px 32px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.85);">YVITY</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;font-weight:700;">Payment Confirmed ✅</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Hi <strong style="color:#0A4A4A;">${input.advisorName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#374151;">Your <strong style="color:#0A4A4A;">${input.planName} membership</strong> payment has been confirmed and your account is now active.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#F8F6F1;border-radius:14px;border:1px solid #E4E2DB;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0A4A4A;">Invoice Summary</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size:13px;color:#6B7280;padding:4px 0;">Invoice ID</td>
                  <td style="font-size:13px;color:#111827;font-weight:600;text-align:right;">${input.invoiceId}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6B7280;padding:4px 0;">Plan</td>
                  <td style="font-size:13px;color:#111827;font-weight:600;text-align:right;">${input.planName}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#6B7280;padding:4px 0;">Date</td>
                  <td style="font-size:13px;color:#111827;font-weight:600;text-align:right;">${formatDate(input.paidAt)}</td>
                </tr>
                <tr>
                  <td style="font-size:14px;font-weight:700;color:#0A4A4A;padding:10px 0 4px;border-top:1px solid #E4E2DB;">Total Paid</td>
                  <td style="font-size:14px;font-weight:700;color:#0A4A4A;text-align:right;padding:10px 0 4px;border-top:1px solid #E4E2DB;">${formatInr(input.amountInr)}</td>
                </tr>
              </table>
            </td></tr>
          </table>
          <a href="${input.dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#FFAE26);color:#0A4A4A;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;box-shadow:0 8px 24px rgba(245,158,11,0.35);">View &amp; Download Invoice</a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6B7280;">Credibility that Connects — Team YVITY</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export function buildPaymentFailedEmail(input: PaymentFailedInput): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Payment failed — YVITY ${input.planName} membership`;

  const text = [
    `Hi ${input.advisorName},`,
    "",
    `We were unable to process your payment for the YVITY ${input.planName} membership.`,
    "",
    "Your account has not been charged.",
    "",
    "Common reasons: bank decline, UPI timeout, or network issue.",
    "",
    "Please retry your payment from your dashboard:",
    input.retryUrl,
    "",
    "If the problem persists, try a different payment method or contact your bank.",
    "— Team YVITY",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F6F1;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0A4A4A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F8F6F1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #E4E2DB;box-shadow:0 12px 40px rgba(10,74,74,0.08);">
        <tr><td style="background:linear-gradient(135deg,#0A4A4A 0%,#1a5c5c 55%,#92400E 100%);padding:28px 32px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.85);">YVITY</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;font-weight:700;">Payment Failed ⚠️</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Hi <strong style="color:#0A4A4A;">${input.advisorName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#374151;">We were unable to process your payment for the <strong style="color:#0A4A4A;">${input.planName} membership</strong>. Your account has <strong>not been charged</strong>.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#FFF9F0;border-radius:14px;border:1px solid #FCD34D;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#92400E;">Common reasons</p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">• Bank or UPI decline<br>• Network timeout during payment<br>• Insufficient balance or card limit</p>
            </td></tr>
          </table>
          <a href="${input.retryUrl}" style="display:inline-block;background:linear-gradient(135deg,#0A4A4A,#0D6060);color:#F59E0B;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;box-shadow:0 8px 24px rgba(10,74,74,0.25);">Retry Payment</a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6B7280;">Credibility that Connects — Team YVITY</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

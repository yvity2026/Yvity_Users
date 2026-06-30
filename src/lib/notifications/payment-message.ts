type PaymentSuccessInput = {
  advisorName: string;
  advisorEmail?: string | null;
  advisorPhone?: string | null;
  planName: string;
  planId: string;
  amountInr: number;
  amountBeforeCouponInr?: number | null;
  couponCode?: string | null;
  couponDiscountInr?: number | null;
  invoiceId: string;
  razorpayPaymentId?: string | null;
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

function planDurationLabel(planId: string): string {
  return "Annual Membership (12 months)";
}

function membershipValidUntil(paidAt: string): string {
  try {
    const d = new Date(paidAt);
    d.setFullYear(d.getFullYear() + 1);
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(d);
  } catch {
    return "";
  }
}

export function buildPaymentSuccessWhatsAppMessage(input: PaymentSuccessInput): string {
  const validUntil = membershipValidUntil(input.paidAt);
  const lines = [
    "✅ *Payment Confirmed — YVITY Membership*",
    "",
    `Hi ${input.advisorName},`,
    "",
    `Your *${input.planName}* is now active.`,
    "",
    `🧾 Invoice No: ${input.invoiceId}`,
    `💰 Amount Paid: ${formatInr(input.amountInr)}`,
    `📅 Date: ${formatDate(input.paidAt)}`,
    `📆 Valid Until: ${validUntil}`,
  ];
  if (input.razorpayPaymentId) {
    lines.push(`🔑 Payment ID: ${input.razorpayPaymentId}`);
  }
  lines.push(
    "",
    "Your membership benefits are now live. Log in to your dashboard to get started.",
    "",
    `Dashboard: ${input.dashboardUrl}`,
    "",
    "— Team YVITY · Medhaara Innovations Pvt Ltd",
    "Credibility that Connects",
  );
  return lines.join("\n");
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
  const subject = `Payment Receipt — YVITY ${input.planName} · ${input.invoiceId}`;
  const validUntil = membershipValidUntil(input.paidAt);
  const hasCoupon = Boolean(input.couponCode && input.couponDiscountInr && input.couponDiscountInr > 0);
  const originalAmount = input.amountBeforeCouponInr ?? input.amountInr;

  const text = [
    `Hi ${input.advisorName},`,
    "",
    `Your YVITY ${input.planName} is now active. Here is your official payment receipt.`,
    "",
    `Invoice No   : ${input.invoiceId}`,
    `Date         : ${formatDate(input.paidAt)}`,
    `Status       : PAID`,
    "",
    `Plan         : ${input.planName}`,
    `Duration     : ${planDurationLabel(input.planId)}`,
    `Valid Until  : ${validUntil}`,
    hasCoupon ? `Original     : ${formatInr(originalAmount)}` : "",
    hasCoupon ? `Coupon (${input.couponCode}) : -${formatInr(input.couponDiscountInr ?? 0)}` : "",
    `Amount Paid  : ${formatInr(input.amountInr)}`,
    `GST          : Not Applicable`,
    input.razorpayPaymentId ? `Payment ID   : ${input.razorpayPaymentId}` : "",
    "",
    "Thank you for your membership.",
    "— Team YVITY | Medhaara Innovations Pvt Ltd",
    "Credibility that Connects",
  ].filter(Boolean).join("\n");

  const couponRow = hasCoupon ? `
    <tr>
      <td colspan="2" style="padding:6px 0 2px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size:13px;color:#6B7280;">Original Price</td>
            <td style="font-size:13px;color:#6B7280;text-align:right;text-decoration:line-through;">${formatInr(originalAmount)}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#059669;">Coupon <span style="font-family:monospace;font-size:11px;background:#ECFDF5;padding:1px 6px;border-radius:4px;">${input.couponCode}</span></td>
            <td style="font-size:13px;color:#059669;text-align:right;">− ${formatInr(input.couponDiscountInr ?? 0)}</td>
          </tr>
        </table>
      </td>
    </tr>` : "";

  const paymentIdRow = input.razorpayPaymentId ? `
    <tr>
      <td style="font-size:12px;color:#9CA3AF;padding:2px 0;">Razorpay Payment ID</td>
      <td style="font-size:12px;color:#6B7280;text-align:right;font-family:monospace;">${input.razorpayPaymentId}</td>
    </tr>` : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F0EDE6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F0EDE6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;">

        <!-- ── HEADER ── -->
        <tr><td style="background:linear-gradient(135deg,#0A4A4A 0%,#0D6060 60%,#1a7a6a 100%);border-radius:16px 16px 0 0;padding:28px 36px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:0.12em;color:#F59E0B;">YVITY</p>
                <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:0.08em;">by Medhaara Innovations Pvt Ltd</p>
              </td>
              <td align="right">
                <span style="display:inline-block;background:#059669;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.1em;padding:5px 14px;border-radius:999px;">✓ PAID</span>
                <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.55);text-align:right;">OFFICIAL RECEIPT</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- ── INVOICE META STRIP ── -->
        <tr><td style="background:#0A4A4A;padding:14px 36px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size:12px;color:rgba(255,255,255,0.6);">Invoice No</td>
              <td style="font-size:12px;color:rgba(255,255,255,0.6);">Date</td>
              <td style="font-size:12px;color:rgba(255,255,255,0.6);">Valid Until</td>
            </tr>
            <tr>
              <td style="font-size:13px;font-weight:700;color:#F59E0B;padding-top:3px;font-family:monospace;">${input.invoiceId}</td>
              <td style="font-size:13px;font-weight:600;color:#ffffff;padding-top:3px;">${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(input.paidAt))}</td>
              <td style="font-size:13px;font-weight:600;color:#ffffff;padding-top:3px;">${validUntil}</td>
            </tr>
          </table>
        </td></tr>

        <!-- ── BODY ── -->
        <tr><td style="background:#ffffff;padding:28px 36px;">

          <!-- Bill To -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;">
            <tr>
              <td width="50%" valign="top">
                <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF;">Bill To</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#0A4A4A;">${input.advisorName}</p>
                ${input.advisorEmail ? `<p style="margin:3px 0 0;font-size:13px;color:#6B7280;">${input.advisorEmail}</p>` : ""}
                ${input.advisorPhone ? `<p style="margin:2px 0 0;font-size:13px;color:#6B7280;">${input.advisorPhone}</p>` : ""}
              </td>
              <td width="50%" valign="top" align="right">
                <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF;">From</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#0A4A4A;">Medhaara Innovations Pvt Ltd</p>
                <p style="margin:3px 0 0;font-size:13px;color:#6B7280;">Brand: YVITY</p>
                <p style="margin:2px 0 0;font-size:13px;color:#6B7280;">support@yvity.com</p>
              </td>
            </tr>
          </table>

          <!-- Line Items -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;margin-bottom:24px;">
            <!-- Table Header -->
            <tr style="background:#F9FAFB;">
              <td style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9CA3AF;padding:10px 16px;">Description</td>
              <td style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9CA3AF;padding:10px 16px;text-align:right;">Amount</td>
            </tr>
            <!-- Plan Row -->
            <tr style="border-top:1px solid #E5E7EB;">
              <td style="padding:14px 16px;vertical-align:top;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">YVITY ${input.planName}</p>
                <p style="margin:3px 0 0;font-size:12px;color:#6B7280;">${planDurationLabel(input.planId)}</p>
                <p style="margin:2px 0 0;font-size:12px;color:#6B7280;">Advisor Membership · Annual</p>
              </td>
              <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#111827;text-align:right;vertical-align:top;">${formatInr(originalAmount)}</td>
            </tr>
            <!-- Totals -->
            <tr style="border-top:1px solid #E5E7EB;background:#F9FAFB;">
              <td colspan="2" style="padding:12px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${couponRow}
                  <tr>
                    <td style="font-size:13px;color:#6B7280;padding:3px 0;">Subtotal</td>
                    <td style="font-size:13px;color:#374151;text-align:right;">${formatInr(input.amountInr)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#6B7280;padding:3px 0;">GST</td>
                    <td style="font-size:13px;color:#6B7280;text-align:right;font-style:italic;">Not Applicable</td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;font-weight:800;color:#0A4A4A;padding:10px 0 4px;border-top:2px solid #E5E7EB;">Total Paid</td>
                    <td style="font-size:15px;font-weight:800;color:#0A4A4A;text-align:right;padding:10px 0 4px;border-top:2px solid #E5E7EB;">${formatInr(input.amountInr)}</td>
                  </tr>
                  ${paymentIdRow}
                </table>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
            <tr><td style="border-radius:999px;background:linear-gradient(135deg,#F59E0B,#FFAE26);box-shadow:0 6px 20px rgba(245,158,11,0.35);">
              <a href="${input.dashboardUrl}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#0A4A4A;text-decoration:none;letter-spacing:0.02em;">View Membership Dashboard →</a>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;line-height:1.7;color:#9CA3AF;">Questions about this receipt? Email us at <a href="mailto:support@yvity.com" style="color:#0A4A4A;text-decoration:none;">support@yvity.com</a></p>
        </td></tr>

        <!-- ── FOOTER ── -->
        <tr><td style="background:#0A4A4A;border-radius:0 0 16px 16px;padding:18px 36px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size:12px;color:rgba(255,255,255,0.5);">Medhaara Innovations Pvt Ltd · YVITY</td>
              <td style="font-size:12px;color:#F59E0B;text-align:right;font-style:italic;">Credibility that Connects</td>
            </tr>
          </table>
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

type ApprovalMessageInput = {
  advisorName: string;
  profileUrl: string;
  approvedAt?: string | null;
};

function formatApprovedDate(iso?: string | null): string {
  if (!iso) return "today";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "today";
  }
}

export function buildProfileApprovedWhatsAppMessage(input: ApprovalMessageInput): string {
  const when = formatApprovedDate(input.approvedAt);
  return [
    "🎉 *Congratulations from YVITY!*",
    "",
    `Hi ${input.advisorName},`,
    "",
    "Your advisor profile has been *verified and approved* by our team.",
    "",
    "✅ Your public profile is now live",
    "✅ Clients can discover and trust you on YVITY",
    "✅ Your YVITY Score is fully active",
    "",
    `Approved on: ${when}`,
    "",
    `View your profile: ${input.profileUrl}`,
    "",
    "— Team YVITY",
    "Credibility that Connects",
  ].join("\n");
}

export function buildProfileApprovedEmail(input: ApprovalMessageInput): {
  subject: string;
  text: string;
  html: string;
} {
  const when = formatApprovedDate(input.approvedAt);
  const subject = "🎉 Your YVITY profile is approved — you're live!";

  const text = [
    `Hi ${input.advisorName},`,
    "",
    "Great news — your YVITY advisor profile has been verified and approved.",
    "",
    "What this means:",
    "• Your public profile is live and discoverable",
    "• Clients can view your verified credentials and YVITY Score",
    "• You can share your profile link and collect OTP-verified recommendations",
    "",
    `Approved on: ${when}`,
    `Your profile: ${input.profileUrl}`,
    "",
    "Welcome to YVITY — Credibility that Connects.",
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
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;color:#ffffff;font-weight:700;">Profile Approved 🎉</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">Hi <strong style="color:#0A4A4A;">${input.advisorName}</strong>,</p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:#374151;">Your advisor profile has been <strong style="color:#0A4A4A;">verified and approved</strong>. You're officially live on India's credibility platform for insurance advisors.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#F8F6F1;border-radius:14px;border:1px solid #E4E2DB;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0A4A4A;">What's unlocked</p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#4B5563;">✅ Public profile is discoverable<br>✅ YVITY Score is fully active<br>✅ Share link & collect verified recommendations<br>✅ Approved on ${when}</p>
            </td></tr>
          </table>
          <a href="${input.profileUrl}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#FFAE26);color:#0A4A4A;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:999px;box-shadow:0 8px 24px rgba(245,158,11,0.35);">View My Profile</a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6B7280;">Credibility that Connects — Team YVITY</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

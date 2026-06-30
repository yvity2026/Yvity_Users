import "server-only";

export type EmailSenderType = "noreply" | "hello" | "support";

/**
 * noreply — OTPs, invoices, payment confirmations (no human reply expected)
 * hello   — Profile approved, membership activated, warm brand messages
 * support — Profile rejected, payment failed, contact replies (advisor may reply)
 */
export function resolveEmailFrom(type: EmailSenderType): string {
  switch (type) {
    case "noreply":
      return (
        process.env.YVITY_EMAIL_FROM_NOREPLY?.trim() ||
        process.env.YVITY_EMAIL_FROM?.trim() ||
        "YVITY <noreply@yvity.com>"
      );
    case "hello":
      return (
        process.env.YVITY_EMAIL_FROM_HELLO?.trim() ||
        process.env.YVITY_EMAIL_FROM?.trim() ||
        "YVITY Team <hello@yvity.com>"
      );
    case "support":
      return (
        process.env.YVITY_EMAIL_FROM_SUPPORT?.trim() ||
        process.env.YVITY_EMAIL_FROM?.trim() ||
        "YVITY Support <support@yvity.com>"
      );
  }
}

export const OTP_PURPOSE = {
  LOGIN: "login",
  SIGNUP: "signup",
  EMAIL_SIGNUP: "email_signup",
  CHANGE_MOBILE: "change-mobile",
  CHANGE_EMAIL: "change-email",
  TESTIMONIAL: "testimonial",
  RECOMMENDATION: "recommendation",
  PLATFORM_REVIEW: "platform-review",
  SENSITIVE_PHONE: "sensitive-phone",
  SENSITIVE_EMAIL: "sensitive-email",
  dangerZone: (action: string) => `danger-zone:${action}`,
} as const;

export type OtpChannel = "whatsapp" | "email";

export function otpPurposeKey(identifier: string, purpose: string): string {
  return `${purpose}:${identifier.trim().toLowerCase()}`;
}

export function inferOtpChannel(identifier: string): OtpChannel {
  return identifier.includes("@") ? "email" : "whatsapp";
}

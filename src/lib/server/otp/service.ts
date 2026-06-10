import "server-only";

import { DUMMY_OTP } from "@/lib/constants";
import { normalizeEmail, normalizeIndianMobile } from "@/lib/server/normalize-identifier";
import {
  deleteOtpFromDb,
  readOtpFromDb,
  upsertOtpInDb,
} from "@/lib/server/supabase/otp-supabase";
import {
  inferOtpChannel,
  otpPurposeKey,
  type OtpChannel,
} from "@/lib/server/otp/purposes";
import {
  isEmailOtpConfigured,
  isWhatsAppOtpConfigured,
  sendOtpEmail,
  sendOtpWhatsApp,
} from "@/lib/server/otp/delivery";

const OTP_TTL_MS = 10 * 60 * 1000;

type OtpRecord = { code: string; expiresAt: number };

const memoryStore = new Map<string, OtpRecord>();
const lastIssueAt = new Map<string, number>();
const ISSUE_DEBOUNCE_MS = 3000;

export function isOtpDeliveryConfigured(): boolean {
  return isWhatsAppOtpConfigured() || isEmailOtpConfigured();
}

/** Demo OTP only when explicitly allowed or local dev without delivery configured. */
export function isDemoOtpEnabled(): boolean {
  if (process.env.YVITY_ALLOW_DEMO_OTP === "true") return true;
  if (process.env.NODE_ENV === "production") return false;
  return !isOtpDeliveryConfigured();
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeOtpIdentifier(identifier: string, channel: OtpChannel): string {
  if (channel === "email") return normalizeEmail(identifier);
  return normalizeIndianMobile(identifier);
}

async function persistOtp(purposeKey: string, identifier: string, purpose: string, code: string) {
  const expiresAt = Date.now() + OTP_TTL_MS;
  const record = { code, expiresAt };
  memoryStore.set(purposeKey, record);

  const savedToDb = await upsertOtpInDb({
    purposeKey,
    identifier,
    purpose,
    code,
    expiresAt,
  });

  if (!savedToDb) {
    console.warn("[YVITY otp] Supabase persist failed; using in-memory fallback for", purposeKey);
  }
}

async function readOtp(purposeKey: string): Promise<OtpRecord | null> {
  const fromMemory = memoryStore.get(purposeKey);
  if (fromMemory) {
    if (Date.now() > fromMemory.expiresAt) {
      memoryStore.delete(purposeKey);
    } else {
      return fromMemory;
    }
  }

  const fromDb = await readOtpFromDb(purposeKey);
  if (fromDb) {
    memoryStore.set(purposeKey, fromDb);
    return fromDb;
  }

  return null;
}

async function deleteOtp(purposeKey: string) {
  memoryStore.delete(purposeKey);
  await deleteOtpFromDb(purposeKey);
}

export type IssueOtpResult = {
  ok: boolean;
  demo?: boolean;
  message?: string;
  error?: string;
};

export async function issueOtp(input: {
  identifier: string;
  purpose: string;
  channel?: OtpChannel;
}): Promise<IssueOtpResult> {
  const channel = input.channel ?? inferOtpChannel(input.identifier);
  const identifier = normalizeOtpIdentifier(input.identifier, channel);
  const purposeKey = otpPurposeKey(identifier, input.purpose);
  const now = Date.now();

  const recentIssueAt = lastIssueAt.get(purposeKey) ?? 0;
  if (now - recentIssueAt < ISSUE_DEBOUNCE_MS) {
    const existing = await readOtp(purposeKey);
    if (existing && now < existing.expiresAt) {
      return {
        ok: true,
        message:
          channel === "whatsapp"
            ? "Verification code sent on WhatsApp."
            : "Verification code sent to your email.",
      };
    }
  }
  lastIssueAt.set(purposeKey, now);

  const useDemo = isDemoOtpEnabled();
  const code = useDemo ? DUMMY_OTP : generateOtpCode();

  if (!useDemo) {
    const deliveryReady = channel === "whatsapp" ? isWhatsAppOtpConfigured() : isEmailOtpConfigured();
    if (!deliveryReady) {
      return {
        ok: false,
        error:
          channel === "whatsapp"
            ? "WhatsApp OTP is not configured. Set WHATSAPP_API_URL, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_PHONE_NUMBER_ID."
            : "Email OTP is not configured. Set EMAIL_USER and EMAIL_PASS.",
      };
    }
  }

  if (useDemo) {
    await persistOtp(purposeKey, identifier, input.purpose, code);
    console.info(`[YVITY otp:demo] ${input.purpose} → ${identifier} (${DUMMY_OTP})`);
    return {
      ok: true,
      demo: true,
      message: "Verification code sent.",
    };
  }

  const delivery =
    channel === "whatsapp"
      ? await sendOtpWhatsApp({ phone: identifier, code })
      : await sendOtpEmail({ to: identifier, code });

  if (!delivery.ok) {
    if (channel === "whatsapp" && "error" in delivery && delivery.error) {
      console.error("[YVITY otp:whatsapp-delivery-failed]", delivery.error);
    }
    const deliveryError =
      "error" in delivery && typeof delivery.error === "string" ? delivery.error : undefined;

    return {
      ok: false,
      error:
        channel === "whatsapp"
          ? deliveryError
            ? `Could not send WhatsApp verification code: ${deliveryError}`
            : "Could not send WhatsApp verification code. Please try again."
          : "Could not send email verification code. Please try again.",
    };
  }

  await persistOtp(purposeKey, identifier, input.purpose, code);

  return {
    ok: true,
    message:
      channel === "whatsapp"
        ? "Verification code sent on WhatsApp."
        : "Verification code sent to your email.",
  };
}

export async function verifyIssuedOtp(
  identifier: string,
  purpose: string,
  token: string,
  channel?: OtpChannel,
): Promise<boolean> {
  const resolvedChannel = channel ?? inferOtpChannel(identifier);
  const normalized = normalizeOtpIdentifier(identifier, resolvedChannel);
  const purposeKey = otpPurposeKey(normalized, purpose);
  const submitted = String(token).trim();

  if (!/^\d{6}$/.test(submitted)) return false;

  if (isDemoOtpEnabled() && submitted === DUMMY_OTP) {
    const record = await readOtp(purposeKey);
    if (record?.code === DUMMY_OTP) {
      await deleteOtp(purposeKey);
      return true;
    }
  }

  const record = await readOtp(purposeKey);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    await deleteOtp(purposeKey);
    return false;
  }
  if (submitted !== record.code) return false;

  await deleteOtp(purposeKey);
  return true;
}

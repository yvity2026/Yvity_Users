import "server-only";

import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

export type StoredOtpRow = {
  code: string;
  expiresAt: number;
};

export async function upsertOtpInDb(input: {
  purposeKey: string;
  identifier: string;
  purpose: string;
  code: string;
  expiresAt: number;
}): Promise<boolean> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return false;

  const { error } = await supabase.from("otp_verifications").upsert(
    {
      purpose_key: input.purposeKey,
      identifier: input.identifier,
      purpose: input.purpose,
      code: input.code,
      expires_at: new Date(input.expiresAt).toISOString(),
      created_at: new Date().toISOString(),
    },
    { onConflict: "purpose_key" },
  );

  if (error) {
    console.warn("[otp] Supabase upsert failed:", error.message);
    return false;
  }
  return true;
}

export async function readOtpFromDb(purposeKey: string): Promise<StoredOtpRow | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("otp_verifications")
    .select("code, expires_at")
    .eq("purpose_key", purposeKey)
    .maybeSingle();

  if (error || !data) return null;

  const expiresAt = new Date(String(data.expires_at)).getTime();
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    await deleteOtpFromDb(purposeKey);
    return null;
  }

  return {
    code: String(data.code),
    expiresAt,
  };
}

export async function deleteOtpFromDb(purposeKey: string): Promise<void> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return;

  await supabase.from("otp_verifications").delete().eq("purpose_key", purposeKey);
}

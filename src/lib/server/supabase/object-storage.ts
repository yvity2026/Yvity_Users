import "server-only";

import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";

/** Bucket names — must match Yvity_Admin/supabase migrations. */
export const STORAGE_BUCKETS = {
  selfies: "selfies",
  gallery: "gallery",
  introVideo: "intro-video",
  verificationDocs: "verification-docs",
  testimonials: "testimonials",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export function useSupabaseStorage(): boolean {
  return useSupabasePersistence();
}

export function supabaseProjectUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
}

export function publicObjectUrl(bucket: StorageBucket, objectPath: string): string {
  const base = supabaseProjectUrl();
  const path = objectPath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function isSupabasePublicStorageUrl(
  url: string,
  bucket?: StorageBucket,
): boolean {
  const trimmed = url.trim();
  if (!trimmed.includes("/storage/v1/object/public/")) return false;
  if (!bucket) return true;
  return trimmed.includes(`/storage/v1/object/public/${bucket}/`);
}

/** Public buckets serve files via a public URL (selfies, gallery, intro video, testimonials). */
const PUBLIC_BUCKETS = new Set<StorageBucket>(["selfies", "gallery", "intro-video", "testimonials"]);

/**
 * Ensures a storage bucket exists with the correct public flag.
 * Creates it if missing; updates the public setting if it already exists with wrong config.
 */
async function ensureBucket(supabase: NonNullable<ReturnType<typeof getAdminClientOrNull>>, bucket: StorageBucket): Promise<void> {
  const isPublic = PUBLIC_BUCKETS.has(bucket);
  const { error } = await supabase.storage.createBucket(bucket, {
    public: isPublic,
    allowedMimeTypes: undefined, // allow all — validation is done in app layer
  });
  if (error) {
    if (!error.message.toLowerCase().includes("already exist")) {
      console.warn(`[storage] Could not ensure bucket "${bucket}": ${error.message}`);
    } else {
      // Bucket already exists — sync its public flag in case it was created with wrong settings
      await supabase.storage.updateBucket(bucket, { public: isPublic }).catch(() => {});
    }
  }
}

export async function uploadObject(
  bucket: StorageBucket,
  objectPath: string,
  body: Buffer,
  contentType: string,
  options?: { upsert?: boolean },
): Promise<void> {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");

  // Auto-create bucket if it doesn't exist (handles first-time Supabase setup)
  await ensureBucket(supabase, bucket);

  const path = objectPath.replace(/^\/+/, "");
  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType,
    upsert: options?.upsert ?? true,
  });

  if (error) throw new Error(error.message);
}

export async function downloadObject(
  bucket: StorageBucket,
  objectPath: string,
): Promise<Buffer | null> {
  const supabase = getAdminClientOrNull();
  if (!supabase) return null;

  const path = objectPath.replace(/^\/+/, "");
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

export async function uploadObjectWhenConfigured(
  bucket: StorageBucket,
  objectPath: string,
  body: Buffer,
  contentType: string,
): Promise<boolean> {
  if (!useSupabaseStorage()) return false;
  await uploadObject(bucket, objectPath, body, contentType);
  return true;
}

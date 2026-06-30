import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import {
  publicObjectUrl,
  STORAGE_BUCKETS,
  uploadObjectWhenConfigured,
} from "@/lib/server/supabase/object-storage";

export const UPLOADS_DIR = path.join(process.cwd(), ".data", "uploads");
export const VERIFICATION_DIR = path.join(process.cwd(), ".data", "verification");
export const INTRO_VIDEO_DIR = path.join(process.cwd(), ".data", "intro-video");

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const INTRO_VIDEO_MAX_BYTES = 80 * 1024 * 1024;
const INTRO_VIDEO_ALLOWED_MIME = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);

const extByMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-m4v": "m4v",
};

const VERIFICATION_MAX_BYTES = 8 * 1024 * 1024;
const VERIFICATION_ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

export function isAllowedImage(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return "Only JPEG, PNG, WebP, or GIF images are allowed.";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

export async function saveGalleryUpload(
  file: File,
  ownerUserId: string,
): Promise<{ url: string; filename: string; storagePath?: string }> {
  const err = isAllowedImage(file);
  if (err) throw new Error(err);

  const ext = extByMime[file.type] ?? "jpg";
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${ownerUserId}/${filename}`;

  if (await uploadObjectWhenConfigured(STORAGE_BUCKETS.gallery, storagePath, buffer, file.type)) {
    return {
      filename,
      storagePath,
      url: publicObjectUrl(STORAGE_BUCKETS.gallery, storagePath),
    };
  }

  const filepath = path.join(UPLOADS_DIR, filename);
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(filepath, buffer);
  return { filename, url: `/api/gallery/uploads/${filename}` };
}

export function uploadsFilePath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename || base.includes("..")) return null;
  return path.join(UPLOADS_DIR, base);
}

export function galleryStoragePath(ownerUserId: string, filename: string): string {
  return `${ownerUserId}/${path.basename(filename)}`;
}

export function isAllowedVerificationFile(file: File): string | null {
  const type = (file.type || "").toLowerCase();
  if (!VERIFICATION_ALLOWED_MIME.has(type)) {
    return "Only PDF, JPG, JPEG, or PNG files are allowed.";
  }
  if (file.size > VERIFICATION_MAX_BYTES) {
    return "Document must be 8 MB or smaller.";
  }
  return null;
}

export async function saveVerificationUpload(
  file: File,
  ownerUserId?: string,
): Promise<{ url: string; filename: string; mimeType: string; storagePath?: string }> {
  const err = isAllowedVerificationFile(file);
  if (err) throw new Error(err);

  const mimeType = (file.type || "application/octet-stream").toLowerCase();
  const ext = extByMime[mimeType] ?? "bin";
  // Embed ownerId as prefix so the serve route can reconstruct the Supabase path
  const uniquePart = `${Date.now()}-${randomBytes(10).toString("hex")}`;
  const filename = ownerUserId
    ? `${ownerUserId}-${uniquePart}.${ext}`
    : `${uniquePart}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  // Supabase path: {ownerId}/{filename} (or just {filename} when no owner)
  const storagePath = ownerUserId ? `${ownerUserId}/${filename}` : filename;

  if (await uploadObjectWhenConfigured(STORAGE_BUCKETS.verificationDocs, storagePath, buffer, mimeType)) {
    return {
      filename,
      storagePath,
      url: `/api/verification/files/${filename}`,
      mimeType,
    };
  }

  const filepath = path.join(VERIFICATION_DIR, filename);
  await fs.mkdir(VERIFICATION_DIR, { recursive: true });
  await fs.writeFile(filepath, buffer);
  return { filename, url: `/api/verification/files/${filename}`, mimeType };
}

export function verificationFilePath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename || base.includes("..")) return null;
  return path.join(VERIFICATION_DIR, base);
}

export function verificationStoragePath(ownerUserId: string | undefined, filename: string): string {
  const base = path.basename(filename);
  return ownerUserId ? `${ownerUserId}/${base}` : base;
}

export function isAllowedIntroVideo(file: File): string | null {
  const type = (file.type || "").toLowerCase();
  if (!INTRO_VIDEO_ALLOWED_MIME.has(type)) {
    return "Only MP4, MOV, or WebM video files are allowed.";
  }
  if (file.size > INTRO_VIDEO_MAX_BYTES) {
    return "Intro video must be 80 MB or smaller. Try a shorter clip or lower bitrate.";
  }
  return null;
}

export async function saveIntroVideoUpload(
  file: File,
  ownerUserId: string,
): Promise<{ url: string; filename: string; mimeType: string; storagePath?: string }> {
  const err = isAllowedIntroVideo(file);
  if (err) throw new Error(err);

  const mimeType = (file.type || "video/mp4").toLowerCase();
  const ext = extByMime[mimeType] ?? "mp4";
  const filename = `${Date.now()}-${randomBytes(10).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${ownerUserId}/${filename}`;

  if (await uploadObjectWhenConfigured(STORAGE_BUCKETS.introVideo, storagePath, buffer, mimeType)) {
    return {
      filename,
      storagePath,
      url: publicObjectUrl(STORAGE_BUCKETS.introVideo, storagePath),
      mimeType,
    };
  }

  const filepath = path.join(INTRO_VIDEO_DIR, filename);
  await fs.mkdir(INTRO_VIDEO_DIR, { recursive: true });
  await fs.writeFile(filepath, buffer);
  return { filename, url: `/api/intro-video/${filename}`, mimeType };
}

export function introVideoFilePath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename || base.includes("..")) return null;
  return path.join(INTRO_VIDEO_DIR, base);
}

export function introVideoStoragePath(ownerUserId: string, filename: string): string {
  return `${ownerUserId}/${path.basename(filename)}`;
}

export async function saveSelfieUpload(input: {
  buffer: Buffer;
  fileKey: string;
  ownerKey: string;
  contentType?: string;
}): Promise<{ url: string; storagePath?: string; backend: "supabase" | "local" }> {
  const contentType = input.contentType ?? "image/jpeg";
  const storagePath = `${input.ownerKey}/${input.fileKey}`;

  if (
    await uploadObjectWhenConfigured(STORAGE_BUCKETS.selfies, storagePath, input.buffer, contentType)
  ) {
    return {
      url: publicObjectUrl(STORAGE_BUCKETS.selfies, storagePath),
      storagePath,
      backend: "supabase",
    };
  }

  const SELFIE_DIR = path.join(process.cwd(), ".data", "selfies");
  await fs.mkdir(SELFIE_DIR, { recursive: true });
  await fs.writeFile(path.join(SELFIE_DIR, input.fileKey), input.buffer);
  return {
    url: `/api/auth/selfie/${input.fileKey}`,
    backend: "local",
  };
}

export function selfieStoragePath(ownerKey: string, fileKey: string): string {
  return `${ownerKey}/${path.basename(fileKey)}`;
}

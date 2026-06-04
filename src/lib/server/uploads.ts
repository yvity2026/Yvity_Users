import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export const UPLOADS_DIR = path.join(process.cwd(), ".data", "uploads");
export const VERIFICATION_DIR = path.join(process.cwd(), ".data", "verification");
export const INTRO_VIDEO_DIR = path.join(process.cwd(), ".data", "intro-video");

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const INTRO_VIDEO_MAX_BYTES = 80 * 1024 * 1024; // 80 MB — typical 60-90 s 1080p clip
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

export async function saveGalleryUpload(file: File): Promise<{ url: string; filename: string }> {
  const err = isAllowedImage(file);
  if (err) throw new Error(err);

  const ext = extByMime[file.type] ?? "jpg";
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return { filename, url: `/api/gallery/uploads/${filename}` };
}

export function uploadsFilePath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename || base.includes("..")) return null;
  return path.join(UPLOADS_DIR, base);
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
): Promise<{ url: string; filename: string; mimeType: string }> {
  const err = isAllowedVerificationFile(file);
  if (err) throw new Error(err);

  const mimeType = (file.type || "application/octet-stream").toLowerCase();
  const ext = extByMime[mimeType] ?? "bin";
  const filename = `${Date.now()}-${randomBytes(10).toString("hex")}.${ext}`;
  const filepath = path.join(VERIFICATION_DIR, filename);

  await fs.mkdir(VERIFICATION_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return { filename, url: `/api/verification/files/${filename}`, mimeType };
}

export function verificationFilePath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename || base.includes("..")) return null;
  return path.join(VERIFICATION_DIR, base);
}

// ─── Intro video uploads ───────────────────────────────────────────

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
): Promise<{ url: string; filename: string; mimeType: string }> {
  const err = isAllowedIntroVideo(file);
  if (err) throw new Error(err);

  const mimeType = (file.type || "video/mp4").toLowerCase();
  const ext = extByMime[mimeType] ?? "mp4";
  const filename = `${Date.now()}-${randomBytes(10).toString("hex")}.${ext}`;
  const filepath = path.join(INTRO_VIDEO_DIR, filename);

  await fs.mkdir(INTRO_VIDEO_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return { filename, url: `/api/intro-video/${filename}`, mimeType };
}

export function introVideoFilePath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename || base.includes("..")) return null;
  return path.join(INTRO_VIDEO_DIR, base);
}

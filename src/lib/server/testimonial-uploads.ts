import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import type { TestimonialType } from "@/lib/sections/types";
import {
  publicObjectUrl,
  STORAGE_BUCKETS,
  uploadObjectWhenConfigured,
} from "@/lib/server/supabase/object-storage";

export const TESTIMONIAL_UPLOADS_DIR = path.join(process.cwd(), ".data", "uploads", "testimonials");

const AUDIO_MIME = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
]);

const VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime", "video/ogg"]);

const MAX_AUDIO = 10 * 1024 * 1024;
const MAX_VIDEO = 25 * 1024 * 1024;

const extByMime: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/ogg": "ogv",
};

export function validateTestimonialMedia(file: File, type: TestimonialType): string | null {
  if (type === "text") return "No media expected for text testimonials.";
  const allowed = type === "audio" ? AUDIO_MIME : VIDEO_MIME;
  const max = type === "audio" ? MAX_AUDIO : MAX_VIDEO;
  if (!allowed.has(file.type)) {
    return type === "audio"
      ? "Use MP3, WAV, WebM, OGG, or M4A audio."
      : "Use MP4, WebM, or MOV video.";
  }
  if (file.size > max) {
    return type === "audio" ? "Audio must be 10 MB or smaller." : "Video must be 25 MB or smaller.";
  }
  return null;
}

export async function saveTestimonialMedia(
  file: File,
  type: TestimonialType,
  advisorUserId?: string,
): Promise<{ url: string; filename: string; storagePath?: string }> {
  const err = validateTestimonialMedia(file, type);
  if (err) throw new Error(err);

  const ext = extByMime[file.type] ?? (type === "audio" ? "mp3" : "mp4");
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const ownerId = advisorUserId?.trim() || "anonymous";
  const storagePath = `${ownerId}/${filename}`;

  if (await uploadObjectWhenConfigured(STORAGE_BUCKETS.testimonials, storagePath, buffer, file.type)) {
    return {
      filename,
      storagePath,
      url: publicObjectUrl(STORAGE_BUCKETS.testimonials, storagePath),
    };
  }

  const filepath = path.join(TESTIMONIAL_UPLOADS_DIR, filename);
  await fs.mkdir(TESTIMONIAL_UPLOADS_DIR, { recursive: true });
  await fs.writeFile(filepath, buffer);
  return { filename, url: `/api/testimonials/media/${filename}` };
}

export function testimonialMediaPath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename || base.includes("..")) return null;
  return path.join(TESTIMONIAL_UPLOADS_DIR, base);
}

export function testimonialStoragePath(advisorUserId: string, filename: string): string {
  return `${advisorUserId}/${path.basename(filename)}`;
}

import path from "path";
import { NextResponse } from "next/server";
import {
  testimonialMediaPath,
  testimonialStoragePath,
} from "@/lib/server/testimonial-uploads";
import { readLocalOrStorageFile } from "@/lib/server/storage/serve-local-or-storage";
import { STORAGE_BUCKETS } from "@/lib/server/supabase/object-storage";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";

const mimeByExt: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".webm": "audio/webm",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".ogv": "video/ogg",
};

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const filepath = testimonialMediaPath(filename);
  if (!filepath && filename.includes("..")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const advisorUserId = (await resolveAdvisorDataUserId()) ?? "anonymous";
  const buffer = await readLocalOrStorageFile({
    localPath: filepath,
    bucket: STORAGE_BUCKETS.testimonials,
    objectPath: testimonialStoragePath(advisorUserId, filename),
  });

  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = mimeByExt[ext] ?? "application/octet-stream";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

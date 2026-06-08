import { NextResponse } from "next/server";
import {
  introVideoFilePath,
  introVideoStoragePath,
} from "@/lib/server/uploads";
import { readLocalOrStorageFile } from "@/lib/server/storage/serve-local-or-storage";
import { STORAGE_BUCKETS } from "@/lib/server/supabase/object-storage";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";

const mimeByExt: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  webm: "video/webm",
};

/** Legacy local intro video files — new uploads use Supabase public URLs. */
export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const filepath = introVideoFilePath(filename);
  if (!filepath && filename.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const session = await getSessionUser();
  const ownerId = session?.id?.trim();
  const storagePath = ownerId ? introVideoStoragePath(ownerId, filename) : filename;

  const buffer = await readLocalOrStorageFile({
    localPath: filepath,
    bucket: STORAGE_BUCKETS.introVideo,
    objectPath: storagePath,
  });

  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "mp4";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mimeByExt[ext] ?? "video/mp4",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Accept-Ranges": "bytes",
    },
  });
}

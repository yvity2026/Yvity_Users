import { NextResponse } from "next/server";
import {
  galleryStoragePath,
  uploadsFilePath,
} from "@/lib/server/uploads";
import { readLocalOrStorageFile } from "@/lib/server/storage/serve-local-or-storage";
import { STORAGE_BUCKETS } from "@/lib/server/supabase/object-storage";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";

const mimeByExt: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const filepath = uploadsFilePath(filename);
  if (!filepath && filename.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const session = await getSessionUser();
  const ownerId = session?.id?.trim();
  const storagePath = ownerId ? galleryStoragePath(ownerId, filename) : filename;

  const buffer = await readLocalOrStorageFile({
    localPath: filepath,
    bucket: STORAGE_BUCKETS.gallery,
    objectPath: storagePath,
  });

  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mimeByExt[ext] ?? "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

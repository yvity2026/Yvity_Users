import path from "path";
import { NextResponse } from "next/server";
import { readLocalOrStorageFile } from "@/lib/server/storage/serve-local-or-storage";
import { STORAGE_BUCKETS } from "@/lib/server/supabase/object-storage";

const DOCS_DIR = path.join(process.cwd(), ".data", "verification-docs");

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);
  if (!safeName || safeName !== filename) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  // Filename format: {userId}-{timestamp}-{hex}.{ext} (userId may contain hyphens, so we
  // reconstruct the Supabase path by trying {userId}/{filename} where userId is everything
  // before the last two dash-separated segments (timestamp + hex).
  const parts = safeName.replace(/\.[^.]+$/, "").split("-");
  // Timestamp is a 13-digit number; find its index to split userId from the rest
  const tsIndex = parts.findIndex((p) => /^\d{13}$/.test(p));
  const ownerId = tsIndex > 0 ? parts.slice(0, tsIndex).join("-") : "";
  const storagePath = ownerId ? `${ownerId}/${safeName}` : safeName;

  let buffer = await readLocalOrStorageFile({
    localPath: path.join(DOCS_DIR, safeName),
    bucket: STORAGE_BUCKETS.verificationDocs,
    objectPath: storagePath,
  });

  // Fallback: old filenames had no userId prefix; try without subdirectory
  if (!buffer && storagePath !== safeName) {
    buffer = await readLocalOrStorageFile({
      localPath: null,
      bucket: STORAGE_BUCKETS.verificationDocs,
      objectPath: safeName,
    });
  }

  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = safeName.split(".").pop()?.toLowerCase() ?? "bin";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

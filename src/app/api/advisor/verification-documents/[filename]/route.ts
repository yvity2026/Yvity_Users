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

  const ownerId = safeName.split("-")[0];
  const buffer = await readLocalOrStorageFile({
    localPath: path.join(DOCS_DIR, safeName),
    bucket: STORAGE_BUCKETS.verificationDocs,
    objectPath: ownerId ? `${ownerId}/${safeName}` : safeName,
  });

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

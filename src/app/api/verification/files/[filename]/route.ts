import { NextResponse } from "next/server";
import {
  verificationFilePath,
  verificationStoragePath,
} from "@/lib/server/uploads";
import { readLocalOrStorageFile } from "@/lib/server/storage/serve-local-or-storage";
import { STORAGE_BUCKETS } from "@/lib/server/supabase/object-storage";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";

const mimeByExt: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const session = await getSessionUser();
  if (!session?.id) return unauthorized();

  const { filename } = await context.params;
  const filepath = verificationFilePath(filename);
  if (!filepath && filename.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const buffer = await readLocalOrStorageFile({
    localPath: filepath,
    bucket: STORAGE_BUCKETS.verificationDocs,
    objectPath: verificationStoragePath(session.id, filename),
  });

  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mimeByExt[ext] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}

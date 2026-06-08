import path from "path";
import { NextResponse } from "next/server";
import { readLocalOrStorageFile } from "@/lib/server/storage/serve-local-or-storage";
import { STORAGE_BUCKETS } from "@/lib/server/supabase/object-storage";
import { selfieStoragePath } from "@/lib/server/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SELFIE_DIR = path.join(process.cwd(), ".data", "selfies");

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  const safeName = path.basename(filename);

  if (!safeName || safeName !== filename) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const ownerPrefix = safeName.split("-")[0] ?? "guest";
  const buffer = await readLocalOrStorageFile({
    localPath: path.join(SELFIE_DIR, safeName),
    bucket: STORAGE_BUCKETS.selfies,
    objectPath: selfieStoragePath(ownerPrefix, safeName),
  });

  if (!buffer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

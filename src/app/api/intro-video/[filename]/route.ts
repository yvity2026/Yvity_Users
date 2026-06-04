import fs from "fs/promises";
import { NextResponse } from "next/server";
import { introVideoFilePath } from "@/lib/server/uploads";

export const runtime = "nodejs";

const mimeByExt: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  webm: "video/webm",
};

/**
 * Serves an uploaded intro video. The URL form is
 * `/api/intro-video/<filename>` and matches what
 * `saveIntroVideoUpload()` returns.
 *
 * Cached aggressively because the filename embeds a timestamp + random
 * suffix — a new upload produces a brand-new URL so cache invalidation is
 * automatic.
 */
export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const filepath = introVideoFilePath(filename);
  if (!filepath) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(filepath);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "mp4";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeByExt[ext] ?? "video/mp4",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

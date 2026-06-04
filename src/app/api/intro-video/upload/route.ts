import { NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { saveIntroVideoUpload } from "@/lib/server/uploads";

export const runtime = "nodejs";

/**
 * Accepts a single video file upload for the advisor's introduction video.
 * Mirrors the gallery upload contract: `multipart/form-data` with a `file`
 * field. Returns `{ ok: true, url, filename, mimeType }` on success.
 *
 * The returned `url` is served back by `/api/intro-video/[filename]/route.ts`.
 * The advisor's `IntroVideoUploadModal` persists this URL to the advisor
 * settings store, which makes it visible on the public home page.
 */
export async function POST(request: Request) {
  if (!(await requireSession())) return unauthorized();

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const { url, filename, mimeType } = await saveIntroVideoUpload(file);
    return NextResponse.json({ ok: true, url, filename, mimeType });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

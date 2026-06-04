import { NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { saveGalleryUpload } from "@/lib/server/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireSession())) return unauthorized();

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const { url, filename } = await saveGalleryUpload(file);
    return NextResponse.json({ ok: true, url, filename });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

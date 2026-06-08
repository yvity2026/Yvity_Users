import { NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { saveVerificationUpload } from "@/lib/server/uploads";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) return unauthorized();

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const { url, filename, mimeType } = await saveVerificationUpload(file, session.id);
    return NextResponse.json({ ok: true, url, filename, mimeType });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

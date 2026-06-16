import { NextResponse } from "next/server";
import { VERIFICATION_ACCEPTED_MIME, VERIFICATION_MAX_BYTES } from "@/lib/verification/service-config";
import { saveVerificationUpload } from "@/lib/server/uploads";
import { getSessionUser } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "File is required" }, { status: 400 });
    }

    if (file.size > VERIFICATION_MAX_BYTES) {
      return NextResponse.json({ success: false, message: "File exceeds 8 MB limit" }, { status: 400 });
    }

    const mime = file.type || "application/octet-stream";
    if (!VERIFICATION_ACCEPTED_MIME.includes(mime as (typeof VERIFICATION_ACCEPTED_MIME)[number])) {
      return NextResponse.json(
        { success: false, message: "Only PDF, JPG, JPEG, or PNG files are allowed" },
        { status: 400 },
      );
    }

    const saved = await saveVerificationUpload(file, session.id);

    return NextResponse.json({
      success: true,
      url: `/api/advisor/verification-documents/${saved.filename}`,
      name: file.name,
      mimeType: mime,
      storage: saved.storagePath ? "supabase" : "local",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { VERIFICATION_ACCEPTED_MIME, VERIFICATION_MAX_BYTES } from "@/lib/verification/service-config";
import { getSessionUser } from "@/lib/server/session";

const DOCS_DIR = path.join(process.cwd(), ".data", "verification-docs");

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

    const ext =
      mime === "application/pdf"
        ? "pdf"
        : mime.includes("png")
          ? "png"
          : "jpg";
    const safeName = `${session.id}-${randomUUID().slice(0, 8)}.${ext}`;
    await fs.mkdir(DOCS_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(DOCS_DIR, safeName), buffer);

    const url = `/api/advisor/verification-documents/${safeName}`;
    return NextResponse.json({ success: true, url, name: file.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

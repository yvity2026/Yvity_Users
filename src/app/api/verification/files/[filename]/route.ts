import fs from "fs/promises";
import { NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { verificationFilePath } from "@/lib/server/uploads";

export const runtime = "nodejs";

const mimeByExt: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/**
 * Verification documents are private — only the signed-in advisor (or admin)
 * can fetch them. Public visitors of the profile must never be able to read
 * proof documents.
 */
export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  if (!(await requireSession())) return unauthorized();

  const { filename } = await context.params;
  const filepath = verificationFilePath(filename);
  if (!filepath) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(filepath);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeByExt[ext] ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

import { NextResponse } from "next/server";
import type { GalleryItem } from "@/lib/gallery-types";
import { EMPTY_GALLERY } from "@/lib/empty-data";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { getSessionUser } from "@/lib/server/session";
import { galleryFileForUser } from "@/lib/server/user-data-files";

export async function GET() {
  const session = await getSessionUser();
  const filename = session?.id ? galleryFileForUser(session.id) : "gallery-anonymous.json";
  const items = await loadJsonFile<GalleryItem[]>(filename, EMPTY_GALLERY);
  return NextResponse.json({ data: items });
}

export async function PUT(request: Request) {
  if (!(await requireSession())) return unauthorized();
  const session = await getSessionUser();
  if (!session?.id) return unauthorized();

  const body = (await request.json()) as { data?: GalleryItem[] };
  if (!body.data || !Array.isArray(body.data)) {
    return NextResponse.json({ error: "Invalid gallery data" }, { status: 400 });
  }

  await saveJsonFile(galleryFileForUser(session.id), body.data);
  return NextResponse.json({ ok: true, data: body.data });
}

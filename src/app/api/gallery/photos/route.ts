import { NextResponse } from "next/server";
import { canAddGalleryPhoto } from "@/lib/advisor-membership/plan-enforcement";
import { getAdvisorPlanContext } from "@/lib/advisor-membership/plan-enforcement-server";
import { EMPTY_GALLERY } from "@/lib/empty-data";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { loadJsonFile } from "@/lib/server/json-store";
import { saveGalleryUpload } from "@/lib/server/uploads";
import { getSessionUser } from "@/lib/server/session";
import { galleryFileForUser } from "@/lib/server/user-data-files";
import type { GalleryItem } from "@/lib/gallery-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) return unauthorized();

  const planCtx = await getAdvisorPlanContext(session.id);
  if (planCtx) {
    const items = await loadJsonFile<GalleryItem[]>(
      galleryFileForUser(session.id),
      EMPTY_GALLERY,
    );
    const check = canAddGalleryPhoto(planCtx.limits, items.length, planCtx.planId);
    if (!check.ok) {
      return NextResponse.json({ error: check.reason ?? "Gallery photo limit reached." }, { status: 403 });
    }
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const { url, filename } = await saveGalleryUpload(file, session.id);
    return NextResponse.json({ ok: true, url, filename });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

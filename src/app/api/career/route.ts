import { NextResponse } from "next/server";
import type { CareerData } from "@/lib/career-types";
import { loadCareerForUser, saveCareerForUser } from "@/lib/server/career-persistence";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";

export async function GET() {
  const dataUserId = await resolveAdvisorDataUserId();
  const data = await loadCareerForUser(dataUserId ?? undefined);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const user = await requireSession();
  if (!user?.id) {
    return unauthorized();
  }

  // createSectionStore sends { data: T } — same as services/achievements/gallery
  let body: CareerData;
  try {
    const raw = (await request.json()) as { data?: CareerData } | CareerData;
    // Accept both { data: CareerData } (new) and bare CareerData (legacy)
    body = "data" in raw && raw.data != null ? raw.data : (raw as CareerData);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !body ||
    !Array.isArray(body.experiences) ||
    !Array.isArray(body.certifications) ||
    !Array.isArray(body.education)
  ) {
    return NextResponse.json({ error: "Invalid career data" }, { status: 400 });
  }

  let saved: CareerData;
  try {
    saved = await saveCareerForUser(user.id, body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[career PUT]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: saved });
}

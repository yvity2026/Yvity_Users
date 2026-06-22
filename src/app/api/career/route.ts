import { NextResponse } from "next/server";
import type { CareerData } from "@/lib/career-types";
import { emptyCareerData } from "@/lib/empty-data";
import { loadCareerForUser, saveCareerForUser } from "@/lib/server/career-persistence";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";

export async function GET() {
  const dataUserId = await resolveAdvisorDataUserId();
  console.log("[career GET] dataUserId:", dataUserId);
  const data = await loadCareerForUser(dataUserId ?? undefined);
  console.log("[career GET] loaded experiences:", data.experiences.length, "certs:", data.certifications.length, "edu:", data.education.length);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const user = await requireSession();
  console.log("[career PUT] session user.id:", user?.id);
  if (!user?.id) {
    return unauthorized();
  }

  let body: CareerData;
  try {
    body = (await request.json()) as CareerData;
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

  try {
    await saveCareerForUser(user.id, body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[career PUT]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: body });
}

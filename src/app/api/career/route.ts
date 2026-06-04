import { NextResponse } from "next/server";
import type { CareerData } from "@/lib/career-types";
import { emptyCareerData } from "@/lib/empty-data";
import { loadCareerForUser, saveCareerForUser } from "@/lib/server/career-persistence";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { getSessionUser } from "@/lib/server/session";

export async function GET() {
  const session = await getSessionUser();
  const data = await loadCareerForUser(session?.id);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const user = await requireSession();
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

  await saveCareerForUser(user.id, body);
  return NextResponse.json({ ok: true, data: body });
}

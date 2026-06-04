import { NextResponse } from "next/server";
import { EMPTY_ACHIEVEMENTS } from "@/lib/empty-data";
import { normalizeAchievements } from "@/lib/sections/normalize-achievements";
import type { AchievementItem } from "@/lib/sections/types";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { getSessionUser } from "@/lib/server/session";
import { achievementsFileForUser } from "@/lib/server/user-data-files";

export async function GET() {
  const session = await getSessionUser();
  const filename = session?.id
    ? achievementsFileForUser(session.id)
    : "achievements-anonymous.json";
  const raw = await loadJsonFile<unknown>(filename, EMPTY_ACHIEVEMENTS);
  const data = normalizeAchievements(raw);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  if (!(await requireSession())) return unauthorized();
  const session = await getSessionUser();
  if (!session?.id) return unauthorized();

  const body = (await request.json()) as { data?: AchievementItem[] };
  if (!body.data || !Array.isArray(body.data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await saveJsonFile(achievementsFileForUser(session.id), body.data);
  return NextResponse.json({ ok: true, data: body.data });
}

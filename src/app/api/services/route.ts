import { NextResponse } from "next/server";
import { EMPTY_SERVICES } from "@/lib/empty-data";
import { normalizeServices } from "@/lib/sections/normalize-services";
import type { ServiceItem } from "@/lib/sections/types";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { servicesFileForUser } from "@/lib/server/advisor-profile-store";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { getSessionUser } from "@/lib/server/session";

export async function GET() {
  const session = await getSessionUser();
  const filename = session?.id ? servicesFileForUser(session.id) : "services-anonymous.json";
  const raw = await loadJsonFile<unknown>(filename, EMPTY_SERVICES);
  const data = normalizeServices(raw);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (!session?.id) return unauthorized();

  const body = (await request.json()) as { data?: ServiceItem[] };
  if (!body.data || !Array.isArray(body.data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const filename = servicesFileForUser(session.id);
  await saveJsonFile(filename, body.data);
  return NextResponse.json({ ok: true, data: body.data });
}

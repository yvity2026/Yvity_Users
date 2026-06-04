import { NextResponse } from "next/server";
import { normalizeAdvisorSettings } from "@/lib/advisor-settings/normalize";
import type { AdvisorSettings } from "@/lib/advisor-settings/types";
import { unauthorized, requireSession } from "@/lib/server/api-auth";
import {
  loadAdvisorSettings,
  saveAdvisorSettings,
} from "@/lib/server/advisor-settings-persistence";

export async function GET() {
  const data = await loadAdvisorSettings();
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  if (!(await requireSession())) return unauthorized();

  let body: { data?: AdvisorSettings };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.data) {
    return NextResponse.json({ error: "Missing settings data" }, { status: 400 });
  }

  const saved = await saveAdvisorSettings(normalizeAdvisorSettings(body.data));
  return NextResponse.json({ ok: true, data: saved });
}

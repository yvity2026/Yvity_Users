import { NextResponse } from "next/server";
import type { ServiceItem } from "@/lib/sections/types";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";
import { loadServicesForUser, saveServicesForUser } from "@/lib/server/section-persistence";
import { syncServicesVerificationForApprovedProfile } from "@/lib/server/sync-services-verification";

export async function GET() {
  const dataUserId = await resolveAdvisorDataUserId();
  if (dataUserId) {
    await syncServicesVerificationForApprovedProfile(dataUserId);
  }
  const data = await loadServicesForUser(dataUserId);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (!session?.id) return unauthorized();

  const body = (await request.json()) as { data?: ServiceItem[] };
  if (!body.data || !Array.isArray(body.data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  let normalized: Awaited<ReturnType<typeof saveServicesForUser>>;
  try {
    normalized = await saveServicesForUser(session.id, body.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[services PUT]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: normalized });
}

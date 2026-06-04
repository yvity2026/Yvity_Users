import { NextResponse } from "next/server";
import { defaultServices } from "@/lib/sections/defaults";
import { normalizeServices } from "@/lib/sections/normalize-services";
import type { ServiceItem } from "@/lib/sections/types";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { markRejected, markVerified } from "@/lib/verification/defaults";

const FILE = "services.json";

export const runtime = "nodejs";

/**
 * Admin review endpoint for service verifications.
 *
 * NOTE: This is gated by `requireSession()` like the rest of the demo APIs.
 * When a real admin/RBAC system is introduced, replace the gate with an
 * admin-role check. The verification *workflow* itself is unchanged.
 */
type ReviewBody = {
  serviceId: string;
  action: "approve" | "reject";
  reason?: string;
};

export async function GET() {
  const raw = await loadJsonFile<unknown>(FILE, defaultServices);
  const services = normalizeServices(raw);
  return NextResponse.json({ data: services });
}

export async function POST(request: Request) {
  if (!(await requireSession())) return unauthorized();

  const body = (await request.json().catch(() => null)) as ReviewBody | null;
  if (!body || !body.serviceId || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (body.action === "reject" && !body.reason?.trim()) {
    return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
  }

  const raw = await loadJsonFile<unknown>(FILE, defaultServices);
  const services = normalizeServices(raw);

  const next: ServiceItem[] = services.map((s) => {
    if (s.id !== body.serviceId) return s;
    const verification =
      body.action === "approve"
        ? markVerified(s.verification)
        : markRejected(s.verification, body.reason!.trim());
    return {
      ...s,
      verification,
      verified: verification.status === "verified",
    };
  });

  await saveJsonFile(FILE, next);
  return NextResponse.json({ ok: true, data: next });
}

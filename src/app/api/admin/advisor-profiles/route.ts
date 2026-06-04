import { NextResponse } from "next/server";
import {
  approveIrdaiSubmission,
  listIrdaiApprovals,
  mapProfileToIrdaiRow,
  rejectIrdaiSubmission,
} from "@/lib/server/admin-irdai-approvals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** @deprecated Prefer GET/POST `/api/admin/approvals` (Dashboard-compatible). */
export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const { data, stats } = await listIrdaiApprovals(baseUrl);
  return NextResponse.json({ data, stats });
}

/** @deprecated Prefer POST `/api/admin/approvals` with `advisorId`. */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: "approve" | "reject";
    profileId?: string;
    advisorId?: string;
    reason?: string;
  };

  const id = body.advisorId?.trim() || body.profileId?.trim();
  if (!id || !body.action) {
    return NextResponse.json({ error: "profileId and action are required" }, { status: 400 });
  }

  const baseUrl = new URL(request.url).origin;
  const profile =
    body.action === "approve"
      ? await approveIrdaiSubmission(id)
      : await rejectIrdaiSubmission(id, body.reason);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: mapProfileToIrdaiRow(profile, baseUrl),
  });
}

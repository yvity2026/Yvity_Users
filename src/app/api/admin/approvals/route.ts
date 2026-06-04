import { NextResponse } from "next/server";
import {
  approveIrdaiSubmission,
  listIrdaiApprovals,
  mapProfileToIrdaiRow,
  rejectIrdaiSubmission,
} from "@/lib/server/admin-irdai-approvals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function goldBaseUrl(request: Request) {
  const env = process.env.YVITY_GOLD_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (env) return env.replace(/\/$/, "");
  try {
    return new URL(request.url).origin;
  } catch {
    return "http://localhost:3002";
  }
}

export async function GET(request: Request) {
  const baseUrl = goldBaseUrl(request);
  const { data, stats } = await listIrdaiApprovals(baseUrl);
  return NextResponse.json({ data, stats });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: "approve" | "reject";
    advisorId?: string;
    profileId?: string;
    reason?: string;
    note?: string;
  } | null;

  const advisorId = body?.advisorId?.trim() || body?.profileId?.trim();
  const action = body?.action;

  if (!advisorId || !action) {
    return NextResponse.json({ error: "advisorId and action are required" }, { status: 400 });
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const baseUrl = goldBaseUrl(request);
  const profile =
    action === "approve"
      ? await approveIrdaiSubmission(advisorId)
      : await rejectIrdaiSubmission(
          advisorId,
          body?.reason || body?.note || "Profile requires changes",
        );

  if (!profile) {
    return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
  }

  const row = mapProfileToIrdaiRow(profile, baseUrl);

  return NextResponse.json({
    success: true,
    advisor: {
      id: row.id,
      advisor_id: row.user_id,
      account_status: profile.account_status,
      profile_status: profile.profile_status,
    },
    data: row,
  });
}

import { NextResponse } from "next/server";
import { listIrdaiApprovals } from "@/lib/server/admin-irdai-approvals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { stats } = await listIrdaiApprovals();
  return NextResponse.json({
    data: {
      pending: stats.pending,
      approved: stats.approved,
      rejected: stats.rejected,
    },
  });
}

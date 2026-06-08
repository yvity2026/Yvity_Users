import { NextResponse } from "next/server";
import {
  getLocalSavedProfiles,
  saveLocalAdvisorProfile,
} from "@/lib/advisor/saved-profiles/localSavedProfiles";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const limit = Number(url.searchParams.get("limit") || 10);
  const result = await getLocalSavedProfiles(session.id, page, limit);

  if (result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { advisorProfileId?: string };
  const advisorProfileId = String(body?.advisorProfileId || "").trim();

  if (!advisorProfileId) {
    return NextResponse.json(
      { success: false, error: "advisorProfileId is required" },
      { status: 400 },
    );
  }

  const result = await saveLocalAdvisorProfile(session.id, advisorProfileId);

  if (result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    message: result.message,
    isNew: result.isNew,
  });
}

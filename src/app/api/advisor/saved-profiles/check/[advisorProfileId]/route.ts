import { NextResponse } from "next/server";
import { checkLocalSavedProfile } from "@/lib/advisor/saved-profiles/localSavedProfiles";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ advisorProfileId: string }> },
) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { advisorProfileId } = await context.params;
  const result = await checkLocalSavedProfile(session.id, advisorProfileId);

  return NextResponse.json({
    success: true,
    data: {
      isSaved: result.isSaved,
      savedProfileId: result.savedProfileId,
    },
  });
}

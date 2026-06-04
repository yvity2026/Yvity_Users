import { NextResponse } from "next/server";
import { removeLocalSavedProfile } from "@/lib/advisor/saved-profiles/localSavedProfiles";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ advisorProfileId: string }> },
) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { advisorProfileId } = await context.params;
  const result = removeLocalSavedProfile(session.id, advisorProfileId);

  if (result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: result.data,
    message: "Profile removed successfully",
  });
}

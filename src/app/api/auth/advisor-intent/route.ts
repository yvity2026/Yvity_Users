import { NextResponse } from "next/server";
import { grantAdvisorRoleForSession } from "@/lib/server/advisor-profile-store";

export async function POST() {
  try {
    const { user, roles } = await grantAdvisorRoleForSession();
    if (!user) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: { roles }, user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update role";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

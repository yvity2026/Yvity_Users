import { NextResponse } from "next/server";
import { validateHandle } from "@/lib/advisor/handle";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { getSessionUser } from "@/lib/server/session";
import { supabaseCollectTakenSlugs, supabaseUpsertAdvisorProfile } from "@/lib/server/advisor-profile-supabase";

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { handle } = (await request.json()) as { handle?: string };
    const raw = handle?.trim().toLowerCase() ?? "";

    const validation = validateHandle(raw);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const taken = await supabaseCollectTakenSlugs(session.id);
    if (taken.has(raw)) {
      return NextResponse.json({ error: "That handle is already taken" }, { status: 409 });
    }

    const profile = await getAdvisorProfileForUser(session.id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await supabaseUpsertAdvisorProfile({ ...profile, profile_slug: raw });

    return NextResponse.json({ handle: raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

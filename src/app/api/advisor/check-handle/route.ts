import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { supabaseCollectTakenSlugs } from "@/lib/server/advisor-profile-supabase";
import { validateHandle, normalizeHandle, suggestHandles } from "@/lib/advisor/handle";

/**
 * GET /api/advisor/check-handle?handle=krishnamohannoti
 *
 * Returns:
 *   { available: true }
 *   { available: false, suggestions: ["krishnamohannoti2", "krishnamohannoti3", ...] }
 *   { error: "..." }   — validation failure
 */
export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("handle") ?? "";
  const handle = normalizeHandle(raw);

  const validation = validateHandle(handle);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 422 });
  }

  // Exclude the current advisor's own slug so they can "re-confirm" their handle
  const taken = await supabaseCollectTakenSlugs(session.id);

  if (!taken.has(handle)) {
    return NextResponse.json({ available: true, handle });
  }

  const suggestions = suggestHandles(handle, taken);
  return NextResponse.json({ available: false, handle, suggestions });
}

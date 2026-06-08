import { NextResponse } from "next/server";
import {
  appendProfileShare,
  countSelfProfileShares,
  countUniqueClientProfileSharers,
} from "@/lib/server/profile-shares-persistence";
import { unauthorized, requireSession } from "@/lib/server/api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Share counts for the signed-in advisor's YVITY Score. */
export async function GET() {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  const [selfShareCount, clientShareCount] = await Promise.all([
    countSelfProfileShares(user.id),
    countUniqueClientProfileSharers(user.id),
  ]);

  return NextResponse.json({ selfShareCount, clientShareCount });
}

type ShareBody = {
  advisorUserId?: string;
};

/**
 * Record a profile share. Requires login — anonymous shares are ignored.
 * Self-shares (advisor sharing own profile) and client-shares (another
 * logged-in user sharing the advisor's profile) are tracked separately.
 */
export async function POST(request: Request) {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  let body: ShareBody;
  try {
    body = (await request.json()) as ShareBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const advisorUserId = body.advisorUserId?.trim();
  if (!advisorUserId) {
    return NextResponse.json({ error: "advisorUserId is required" }, { status: 400 });
  }

  const kind = user.id === advisorUserId ? "self" : "client";

  await appendProfileShare({
    advisorUserId,
    sharerUserId: user.id,
    kind,
  });

  return NextResponse.json({ ok: true, kind });
}

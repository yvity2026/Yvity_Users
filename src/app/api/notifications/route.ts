import { NextResponse } from "next/server";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { unauthorized, requireSession } from "@/lib/server/api-auth";
import {
  countUnreadNotifications,
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/server/notifications-store";
import { notifyProfileApproved } from "@/lib/server/profile-approval-notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  const profile = await getAdvisorProfileForUser(user.id);
  if (profile?.account_status === "active" && profile.approved_at) {
    await notifyProfileApproved(profile, { sendOutbound: true });
  }

  const [data, unreadCount] = await Promise.all([
    listNotificationsForUser(user.id),
    countUnreadNotifications(user.id),
  ]);

  return NextResponse.json({ data, unreadCount });
}

export async function PATCH(request: Request) {
  const user = await requireSession();
  if (!user?.id) return unauthorized();

  let body: { id?: string; markAll?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.markAll) {
    const updated = await markAllNotificationsRead(user.id);
    return NextResponse.json({ ok: true, updated });
  }

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
  }

  const ok = await markNotificationRead(user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  const unreadCount = await countUnreadNotifications(user.id);
  return NextResponse.json({ ok: true, unreadCount });
}

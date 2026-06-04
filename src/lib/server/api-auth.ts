import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}

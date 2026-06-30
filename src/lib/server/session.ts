import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/auth-store";

export const SESSION_COOKIE = "yvity-session";

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = 60 * 60 * 24 * 180) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

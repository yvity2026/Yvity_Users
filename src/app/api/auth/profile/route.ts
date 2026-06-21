import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  mergeSessionProfile,
  normalizePincode,
  resolveRegisteredUser,
  toProfileUser,
  updateRegisteredUserProfile,
} from "@/lib/server/profile";
import { getSessionUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/session";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { loadUserByIdFromDb, upsertUserToDb } from "@/lib/server/supabase/platform-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();
  if (!session?.id && !session?.identifier) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registered = resolveRegisteredUser(session);

  return NextResponse.json({
    success: true,
    data: toProfileUser(session, registered),
  });
}

export async function PATCH(request: Request) {
  const session = await getSessionUser();
  if (!session?.id && !session?.identifier) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body?.name || "").trim();
    const profession = String(body?.profession || "").trim();
    const city = String(body?.city || "").trim();
    const state = String(body?.state || "").trim();
    const addressLine = String(body?.address_line || "").trim();
    const pincode = normalizePincode(body?.pincode);
    const about = String(body?.about || "").trim();

    if (name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }

    if (pincode && pincode.length !== 6) {
      return NextResponse.json({ error: "Pin code must be 6 digits" }, { status: 400 });
    }

    if (about.length > 500) {
      return NextResponse.json(
        { error: "About section must be 500 characters or less" },
        { status: 400 },
      );
    }

    const registered = updateRegisteredUserProfile(session, {
      name,
      profession,
      city,
      state,
      address_line: addressLine,
      pincode,
      about,
    });

    // Write city/name/profession directly to Supabase so search results reflect the update
    if (useSupabasePersistence() && session.id) {
      const dbUser = await loadUserByIdFromDb(session.id);
      if (dbUser) {
        await upsertUserToDb({
          ...dbUser,
          fullName: name || dbUser.fullName,
          profession: profession || dbUser.profession,
          city: city || dbUser.city,
        });
      }
    }

    const nextSession = mergeSessionProfile(
      {
        ...session,
        name,
        profession,
        city,
        state,
        address_line: addressLine,
        pincode: pincode ?? undefined,
        about,
      },
      registered,
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, JSON.stringify(nextSession), sessionCookieOptions());

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: toProfileUser(nextSession, registered),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 },
    );
  }
}

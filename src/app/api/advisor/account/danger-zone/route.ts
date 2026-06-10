import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  deactivateAdvisorAccount,
  deleteAdvisorAccount,
} from "@/lib/server/advisor-profile-store";
import { loadAdvisorSettings, saveAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import { consumeOtp, storeOtp } from "@/lib/server/registration";
import { resolveRegisteredUser } from "@/lib/server/profile";
import { mutateRegistrationDb } from "@/lib/server/registration-store";
import { SESSION_COOKIE, getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DangerAction = "deactivate" | "delete";

function otpPurpose(action: DangerAction) {
  return `danger-zone:${action}`;
}

function contactIdentifier(session: Awaited<ReturnType<typeof getSessionUser>>) {
  const registered = session ? resolveRegisteredUser(session) : null;
  return registered?.email?.trim() || session?.email?.trim() || session?.phone?.trim() || session?.id || "";
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const body = (await request.json()) as { action?: DangerAction };
    const action = body.action;
    if (action !== "deactivate" && action !== "delete") {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    const identifier = contactIdentifier(session);
    if (!identifier) {
      return NextResponse.json({ success: false, message: "No contact on file for OTP" }, { status: 400 });
    }

    try {
      const result = await storeOtp(identifier, otpPurpose(action));
      return NextResponse.json({
        success: true,
        message: result.message ?? "Verification code sent.",
        email: registeredEmail(session),
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Unable to send OTP",
        },
        { status: 502 },
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send OTP";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const body = (await request.json()) as { action?: DangerAction; otp?: string };
    const action = body.action;
    const otp = body.otp?.trim();

    if (action !== "deactivate" && action !== "delete") {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }
    if (!otp) {
      return NextResponse.json({ success: false, message: "OTP is required" }, { status: 400 });
    }

    const identifier = contactIdentifier(session);
    if (!(await consumeOtp(identifier, otpPurpose(action), otp))) {
      return NextResponse.json({ success: false, message: "Invalid or expired OTP" }, { status: 400 });
    }

    if (action === "deactivate") {
      const settings = await loadAdvisorSettings();
      settings.publicProfile.profileActive = false;
      await saveAdvisorSettings(settings);
      await deactivateAdvisorAccount(session.id);

      const deactivatedUntil = new Date();
      deactivatedUntil.setDate(deactivatedUntil.getDate() + 30);
      mutateRegistrationDb((db) => {
        const user = db.users.find((u) => u.id === session.id);
        if (user) {
          (user as RegisteredUserWithDeactivation).deactivated_until =
            deactivatedUntil.toISOString();
        }
      });

      await clearSession();

      return NextResponse.json({
        success: true,
        message: "Account deactivated. Your public profile is hidden for 30 days.",
        redirect_url: "/?login=true",
      });
    }

    const userId = session.id;
    await deleteAdvisorAccount(userId);
    mutateRegistrationDb((db) => {
      db.users = db.users.filter((u) => u.id !== userId);
      delete db.selfieUrls[userId];
    });
    await clearSession();

    return NextResponse.json({
      success: true,
      message: "Account deleted",
      redirect_url: "/",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

type RegisteredUserWithDeactivation = { deactivated_until?: string };

function registeredEmail(session: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>) {
  const registered = resolveRegisteredUser(session);
  return registered?.email || session.email || "";
}

async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

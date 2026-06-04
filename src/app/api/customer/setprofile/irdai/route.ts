import { NextResponse } from "next/server";
import {
  advisorProfileToApi,
  updateAdvisorIrdaiProfile,
} from "@/lib/server/advisor-profile-store";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const body = (await request.json()) as {
      license_number?: string;
      certificate_url?: string;
    };

    const license = body.license_number?.replace(/\D/g, "") ?? "";
    if (license.length !== 7) {
      return NextResponse.json(
        { success: false, message: "A valid 7-digit IRDAI license number is required" },
        { status: 400 },
      );
    }

    if (!body.certificate_url?.trim()) {
      return NextResponse.json(
        { success: false, message: "Certificate URL is required" },
        { status: 400 },
      );
    }

    const profile = await updateAdvisorIrdaiProfile(session.id, {
      license_number: license,
      certificate_url: body.certificate_url,
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Advisor profile not found. Submit your profile first." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "IRDAI details saved",
      data: advisorProfileToApi(profile),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save IRDAI details";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import {
  mapSetupServicesToItems,
  type SetupServicePayload,
} from "@/lib/advisor/map-setup-services";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { submitAdvisorProfile } from "@/lib/server/advisor-profile-store";
import { saveServicesForUser } from "@/lib/server/section-persistence";
import { getSessionUser } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const body = (await request.json()) as {
      advisor_role_id?: string;
      services?: SetupServicePayload[];
      bio?: string;
      designation?: string;
      certificate_url?: string;
      document_urls?: string[];
      subscription_plan?: MembershipPlanId;
      razorpay_payment_id?: string;
    };

    const services = Array.isArray(body.services) ? body.services : [];
    if (!body.advisor_role_id || services.length === 0) {
      return NextResponse.json(
        { success: false, message: "Advisor role and at least one service are required" },
        { status: 400 },
      );
    }

    const documentUrls = Array.isArray(body.document_urls)
      ? body.document_urls.filter(Boolean)
      : body.certificate_url
        ? [body.certificate_url]
        : [];

    const items = mapSetupServicesToItems(services, documentUrls);
    await saveServicesForUser(session.id, items);

    const plan = body.subscription_plan ?? "free";
    const { profile, user } = await submitAdvisorProfile({
      advisor_role_id: body.advisor_role_id,
      services,
      bio: body.bio?.trim() || "",
      designation: body.designation?.trim() || "Insurance Advisor",
      certificate_url: body.certificate_url,
      document_urls: documentUrls,
      subscription_plan: plan,
      razorpay_payment_id: body.razorpay_payment_id,
    });

    const isPaidPlan = plan === "silver" || plan === "gold";

    return NextResponse.json({
      success: true,
      message: isPaidPlan
        ? "Profile submitted for verification"
        : "Your profile is live. Identity is verified; services are not YVITY-verified on the Free plan.",
      data: { profile, roles: user?.roles ?? [] },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import {
  advisorProfileToApi,
  updateAdvisorSubscriptionPlan,
} from "@/lib/server/advisor-profile-store";
import { getPaidPaymentForUser } from "@/lib/server/payment-store";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizePlanId(value: unknown): MembershipPlanId | null {
  const plan = String(value ?? "").trim().toLowerCase();
  if (plan === "silver" || plan === "gold") return plan;
  return null;
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const body = (await request.json()) as {
      planId?: MembershipPlanId;
      razorpay_payment_id?: string;
    };

    const planId = normalizePlanId(body.planId);
    const paymentId = body.razorpay_payment_id?.trim();

    if (!planId) {
      return NextResponse.json(
        { success: false, message: "Silver or Gold plan is required for paid checkout" },
        { status: 400 },
      );
    }
    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required" },
        { status: 400 },
      );
    }

    const paid = await getPaidPaymentForUser({
      userId: session.id,
      planId,
      razorpayPaymentId: paymentId,
    });

    if (!paid) {
      return NextResponse.json(
        { success: false, message: "Payment not verified. Please try again." },
        { status: 400 },
      );
    }

    const profile = await updateAdvisorSubscriptionPlan(session.id, planId, {
      checkoutKind: paid.checkout_kind ?? "purchase",
      paidAt: paid.paid_at ?? undefined,
    });
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Advisor profile not found" },
        { status: 404 },
      );
    }

    const checkoutKind = paid.checkout_kind ?? "purchase";
    const message =
      checkoutKind === "upgrade" && planId === "gold"
        ? "Your Gold membership is active for one year from today"
        : checkoutKind === "renew"
          ? `Your ${planId === "gold" ? "Gold" : "Silver"} membership has been renewed`
          : `Your ${planId === "gold" ? "Gold" : "Silver"} membership is active`;

    return NextResponse.json({
      success: true,
      message,
      data: advisorProfileToApi(profile),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update membership";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

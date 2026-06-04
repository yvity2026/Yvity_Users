import { NextResponse } from "next/server";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { createPendingPayment } from "@/lib/server/payment-store";
import {
  createRazorpayOrder,
  getPlanAmountInr,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from "@/lib/server/razorpay";
import { resolveRegisteredUser } from "@/lib/server/profile";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { planId?: MembershipPlanId };
    const planId = body.planId;
    if (planId !== "silver" && planId !== "gold") {
      return NextResponse.json(
        { success: false, message: "Payment is only required for Silver or Gold plans" },
        { status: 400 },
      );
    }

    const amountInr = getPlanAmountInr(planId);
    if (amountInr <= 0) {
      return NextResponse.json({ success: false, message: "Invalid plan amount" }, { status: 400 });
    }

    const order = await createRazorpayOrder({
      userId: session.id,
      planId,
      amountInr,
    });

    await createPendingPayment({
      userId: session.id,
      planId,
      amountInr,
      razorpayOrderId: order.id,
    });

    const registered = resolveRegisteredUser(session);

    return NextResponse.json({
      success: true,
      data: {
        keyId: getRazorpayKeyId(),
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planId,
        amountInr,
        prefill: {
          name: registered?.fullName ?? session.name ?? "",
          email: registered?.email ?? "",
          contact: registered?.phone ? `+91${registered.phone}` : "",
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create payment order";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

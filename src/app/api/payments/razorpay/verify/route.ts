import { NextResponse } from "next/server";
import { redeemCoupon } from "@/lib/server/coupons-store";
import { markPaymentPaid } from "@/lib/server/payment-store";
import { resolveRegisteredUser } from "@/lib/server/profile";
import { verifyRazorpayPaymentSignature, isRazorpayConfigured } from "@/lib/server/razorpay";
import { qualifyReferralOnPayment } from "@/lib/server/referrals-store";
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
      return NextResponse.json({ success: false, message: "Razorpay is not configured" }, { status: 503 });
    }

    const body = (await request.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    const orderId = body.razorpay_order_id?.trim();
    const paymentId = body.razorpay_payment_id?.trim();
    const signature = body.razorpay_signature?.trim();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, message: "Missing Razorpay payment details" },
        { status: 400 },
      );
    }

    const valid = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!valid) {
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 });
    }

    const record = await markPaymentPaid({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
    });

    if (!record || record.user_id !== session.id) {
      return NextResponse.json({ success: false, message: "Payment record not found" }, { status: 404 });
    }

    if (record.coupon_code) {
      const registered = resolveRegisteredUser(session);
      await redeemCoupon(record.coupon_code, {
        userId: session.id,
        userEmail: registered?.email ?? null,
        paymentId,
      });
    }

    try {
      await qualifyReferralOnPayment({
        userId: session.id,
        payment: record,
      });
    } catch (error) {
      console.error("[razorpay/verify] referral qualification failed:", error);
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId,
        orderId,
        planId: record.plan_id,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

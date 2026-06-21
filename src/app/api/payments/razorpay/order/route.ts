import { NextResponse } from "next/server";
import {
  resolveCheckoutQuoteForProfile,
  type CheckoutKind,
} from "@/lib/advisor-membership/checkout-pricing";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { previewCouponDiscount, reserveCouponForOrder } from "@/lib/server/coupons-store";
import { getAdminPlanPrices, getGlobalFeatureFlags } from "@/lib/server/feature-controls-store";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { createPendingPayment } from "@/lib/server/payment-store";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  isRazorpayConfigured,
} from "@/lib/server/razorpay";
import { getSessionUser } from "@/lib/server/session";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { loadUserByIdFromDb, upsertUserToDb } from "@/lib/server/supabase/platform-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeCheckoutKind(value: unknown): CheckoutKind | null {
  const kind = String(value ?? "").trim().toLowerCase();
  if (kind === "renew" || kind === "upgrade" || kind === "purchase") return kind;
  return null;
}

function normalizeTargetPlan(value: unknown): "silver" | "gold" | null {
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

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local",
        },
        { status: 503 },
      );
    }

    const [globalFlags, adminPrices] = await Promise.all([
      getGlobalFeatureFlags(),
      getAdminPlanPrices(),
    ]);
    const planPrices: Partial<Record<string, number>> = Object.fromEntries(
      Object.entries(adminPrices).map(([id, p]) => [id, p?.salePriceInr]),
    );

    if (!globalFlags.membershipCheckoutEnabled) {
      return NextResponse.json(
        { success: false, message: "Membership checkout is temporarily unavailable" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      planId?: MembershipPlanId;
      checkoutKind?: CheckoutKind;
      couponCode?: string;
    };
    const planId = normalizeTargetPlan(body.planId);
    const checkoutKind = normalizeCheckoutKind(body.checkoutKind) ?? "purchase";

    if (!planId) {
      return NextResponse.json(
        { success: false, message: "Payment is only required for Silver or Gold plans" },
        { status: 400 },
      );
    }

    // Ensure user exists in users table before inserting payment (FK: advisor_payments.user_id → users.id).
    // resolveRegisteredUser uses the local JSON store which is always empty on Vercel, so we
    // load from Supabase directly and upsert to guarantee the row exists.
    let registered = useSupabasePersistence() ? await loadUserByIdFromDb(session.id) : null;
    if (registered) {
      await upsertUserToDb(registered);
    }

    const profile = await getAdvisorProfileForUser(session.id);
    const quote = profile
      ? resolveCheckoutQuoteForProfile(profile, { checkoutKind, targetPlanId: planId, planPrices })
      : resolveCheckoutQuoteForProfile(
          {
            id: "",
            advisor_id: "",
            user_id: session.id,
            account_status: "active",
            profile_status: true,
            profile_slug: "",
            subscription_plan: "free",
          },
          { checkoutKind: "purchase", targetPlanId: planId, planPrices },
        );

    if ("error" in quote) {
      return NextResponse.json({ success: false, message: quote.error }, { status: 400 });
    }

    let amountInr = quote.amountInr;
    let couponCode: string | null = null;
    let couponDiscountInr = 0;
    const amountBeforeCouponInr = quote.amountInr;

    const rawCouponCode = body.couponCode?.trim();
    if (rawCouponCode && !globalFlags.couponRedemptionEnabled) {
      return NextResponse.json(
        { success: false, message: "Coupon redemption is temporarily unavailable" },
        { status: 503 },
      );
    }
    if (rawCouponCode) {
      const couponPreview = await previewCouponDiscount(rawCouponCode, {
        baseAmountInr: amountBeforeCouponInr,
        userId: session.id,
        userEmail: registered?.email ?? null,
        planId,
      });

      if ("error" in couponPreview) {
        return NextResponse.json({ success: false, message: couponPreview.error }, { status: 400 });
      }

      amountInr = couponPreview.amountInr;
      couponDiscountInr = couponPreview.discountInr;
      couponCode = couponPreview.coupon.code;
    }

    if (amountInr <= 0) {
      return NextResponse.json(
        { success: false, message: "No payment is required for this change" },
        { status: 400 },
      );
    }

    const order = await createRazorpayOrder({
      userId: session.id,
      planId,
      amountInr,
    });

    if (couponCode) {
      await reserveCouponForOrder(couponCode, {
        userId: session.id,
        userEmail: registered?.email ?? null,
        planId,
        orderId: order.id,
      });
    }

    await createPendingPayment({
      userId: session.id,
      planId,
      amountInr,
      razorpayOrderId: order.id,
      checkoutKind: quote.checkoutKind,
      creditInr: quote.creditInr,
      fromPlanId: quote.fromPlanId,
      couponCode,
      couponDiscountInr,
      amountBeforeCouponInr,
    });

    return NextResponse.json({
      success: true,
      data: {
        keyId: getRazorpayKeyId(),
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planId,
        checkoutKind: quote.checkoutKind,
        amountInr,
        amountBeforeCouponInr,
        listPriceInr: quote.listPriceInr,
        creditInr: quote.creditInr,
        couponCode,
        couponDiscountInr,
        summary: quote.summary,
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

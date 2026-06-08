import { NextResponse } from "next/server";
import {
  resolveCheckoutQuoteForProfile,
  type CheckoutKind,
} from "@/lib/advisor-membership/checkout-pricing";
import { previewCouponDiscount } from "@/lib/server/coupons-store";
import { getGlobalFeatureFlags } from "@/lib/server/feature-controls-store";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { resolveRegisteredUser } from "@/lib/server/profile";
import { getSessionUser } from "@/lib/server/session";

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

    const body = (await request.json()) as {
      checkoutKind?: CheckoutKind;
      planId?: "silver" | "gold";
      couponCode?: string;
    };

    const checkoutKind = normalizeCheckoutKind(body.checkoutKind);
    const targetPlanId = normalizeTargetPlan(body.planId);

    if (!checkoutKind) {
      return NextResponse.json(
        { success: false, message: "checkoutKind must be renew, upgrade, or purchase" },
        { status: 400 },
      );
    }
    if (!targetPlanId) {
      return NextResponse.json(
        { success: false, message: "Silver or Gold plan is required" },
        { status: 400 },
      );
    }

    const profile = await getAdvisorProfileForUser(session.id);
    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Advisor profile not found" },
        { status: 404 },
      );
    }

    const quote = resolveCheckoutQuoteForProfile(profile, {
      checkoutKind,
      targetPlanId,
    });

    if ("error" in quote) {
      return NextResponse.json({ success: false, message: quote.error }, { status: 400 });
    }

    if (quote.amountInr <= 0) {
      return NextResponse.json(
        { success: false, message: "No payment is required for this change" },
        { status: 400 },
      );
    }

    const couponCode = body.couponCode?.trim();
    if (!couponCode) {
      return NextResponse.json({ success: true, data: quote });
    }

    const globalFlags = await getGlobalFeatureFlags();
    if (!globalFlags.couponRedemptionEnabled) {
      return NextResponse.json(
        { success: false, message: "Coupon redemption is temporarily unavailable" },
        { status: 503 },
      );
    }

    const registered = resolveRegisteredUser(session);
    const couponPreview = await previewCouponDiscount(couponCode, {
      baseAmountInr: quote.amountInr,
      userId: session.id,
      userEmail: registered?.email ?? null,
      planId: targetPlanId,
    });

    if ("error" in couponPreview) {
      return NextResponse.json({ success: false, message: couponPreview.error }, { status: 400 });
    }

    const discountLabel =
      couponPreview.coupon.discountType === "fixed"
        ? `₹${couponPreview.coupon.discountValue.toLocaleString("en-IN")}`
        : `${couponPreview.coupon.discountValue}%`;

    return NextResponse.json({
      success: true,
      data: {
        ...quote,
        amountBeforeCouponInr: quote.amountInr,
        amountInr: couponPreview.amountInr,
        couponCode: couponPreview.coupon.code,
        couponDiscountInr: couponPreview.discountInr,
        summary: `${quote.summary} Coupon ${couponPreview.coupon.code} applied (${discountLabel} off).`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not calculate checkout quote";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

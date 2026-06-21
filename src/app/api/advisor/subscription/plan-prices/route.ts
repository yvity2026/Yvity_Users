import { NextResponse } from "next/server";
import { getAdminPlanPrices } from "@/lib/server/feature-controls-store";
import { MEMBERSHIP_PLAN_MARKETING } from "@/lib/advisor-membership/plan-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminPrices = await getAdminPlanPrices();

    const plans = MEMBERSHIP_PLAN_MARKETING.filter((p) => p.id !== "free").map((p) => {
      const override = adminPrices[p.id];
      const effectivePrice = override?.salePriceInr ?? p.priceAnnualInr;
      const originalPrice = override?.listPriceInr ?? null;
      return {
        id: p.id,
        priceAnnualInr: effectivePrice,
        originalPriceInr: originalPrice,
        priceLabel: effectivePrice === 0 ? "₹0" : `₹${effectivePrice.toLocaleString("en-IN")}/year`,
      };
    });

    return NextResponse.json({ success: true, data: plans });
  } catch {
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

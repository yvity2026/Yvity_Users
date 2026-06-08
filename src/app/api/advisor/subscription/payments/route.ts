import { NextResponse } from "next/server";
import { MEMBERSHIP_PLANS } from "@/lib/advisor-membership/plans";
import { listPaidPaymentsForUser } from "@/lib/server/payment-store";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function planName(planId: string): string {
  return MEMBERSHIP_PLANS.find((p) => p.id === planId)?.name ?? planId;
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const payments = await listPaidPaymentsForUser(session.id);

    return NextResponse.json({
      success: true,
      data: payments.map((p) => ({
        id: p.id,
        paidAt: p.paid_at ?? p.created_at,
        planId: p.plan_id,
        planName: planName(p.plan_id),
        amountInr: p.amount_inr,
        creditInr: p.credit_inr ?? 0,
        checkoutKind: p.checkout_kind ?? "purchase",
        invoiceId: `YVT-${p.id.slice(0, 8).toUpperCase()}`,
        status: "paid" as const,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load payments";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

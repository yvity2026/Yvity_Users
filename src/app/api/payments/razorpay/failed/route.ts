import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { notifyPaymentFailed } from "@/lib/server/payment-notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const body = (await request.json()) as { planId?: string };
    const planId = String(body.planId ?? "").trim();

    if (!planId) {
      return NextResponse.json({ success: false, message: "planId is required" }, { status: 400 });
    }

    notifyPaymentFailed({ userId: session.id, planId }).catch((err) =>
      console.error("[razorpay/failed] notification failed:", err),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

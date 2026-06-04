"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { MEMBERSHIP_PLANS } from "@/lib/advisor-membership/plans";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type MembershipActionSheetProps = {
  open: boolean;
  mode: "renew" | "upgrade";
  currentPlanId: MembershipPlanId;
  targetPlanId?: MembershipPlanId;
  onClose: () => void;
  onSuccess?: () => void;
};

export function MembershipActionSheet({
  open,
  mode,
  currentPlanId,
  targetPlanId,
  onClose,
  onSuccess,
}: MembershipActionSheetProps) {
  const { payForPlan } = useRazorpayCheckout();
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const current = MEMBERSHIP_PLANS.find((p) => p.id === currentPlanId)!;
  const paidTarget =
    mode === "renew"
      ? paidPlanForRenew(currentPlanId)
      : paidPlanForUpgrade(targetPlanId ?? upgradeTarget(currentPlanId));
  const target =
    MEMBERSHIP_PLANS.find((p) => p.id === (paidTarget ?? currentPlanId)) ?? current;

  const title = mode === "renew" ? "Renew membership" : "Upgrade plan";
  const description =
    mode === "renew"
      ? `Renew your ${current.name} plan (${current.priceLabel}) for another year.`
      : `Upgrade to ${target.name} (${target.priceLabel}) — ${target.tagline}.`;

  const handleConfirm = async () => {
    if (!paidTarget) {
      toast.info("Your Free plan does not require payment.");
      onClose();
      return;
    }

    try {
      setLoading(true);
      const paymentId = await payForPlan(paidTarget);
      const res = await fetch("/api/advisor/subscription/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: paidTarget, razorpay_payment_id: paymentId }),
      });
      const json = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Could not update membership");
      }
      toast.success(json.message || "Membership updated");
      onSuccess?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment failed";
      if (message !== "Payment cancelled") {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className={cn(
          "relative z-10 w-full sm:max-w-md glass-strong rounded-t-3xl sm:rounded-3xl",
          "border border-white/15 shadow-2xl p-6",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Membership</p>
            <h3 className="text-lg font-bold mt-1">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-full border border-white/12 inline-flex items-center justify-center"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        {paidTarget ? (
          <p className="mt-3 text-xs rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-muted-foreground">
            Secure checkout via Razorpay. Your plan updates immediately after payment is verified.
          </p>
        ) : (
          <p className="mt-3 text-xs rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-muted-foreground">
            No payment is required on the Free plan.
          </p>
        )}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1 rounded-xl h-11 font-semibold"
            disabled={loading}
            onClick={() => void handleConfirm()}
          >
            {loading
              ? "Processing…"
              : paidTarget
                ? mode === "renew"
                  ? `Pay & renew ${target.name}`
                  : `Pay & upgrade to ${target.name}`
                : "Got it"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-11"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function upgradeTarget(current: MembershipPlanId): MembershipPlanId {
  if (current === "free") return "silver";
  if (current === "silver") return "gold";
  return "gold";
}

function paidPlanForRenew(planId: MembershipPlanId): "silver" | "gold" | null {
  if (planId === "silver" || planId === "gold") return planId;
  return null;
}

function paidPlanForUpgrade(planId: MembershipPlanId): "silver" | "gold" | null {
  if (planId === "silver" || planId === "gold") return planId;
  return null;
}

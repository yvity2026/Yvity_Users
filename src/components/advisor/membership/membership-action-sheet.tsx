"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { CheckoutKind, CheckoutQuote } from "@/lib/advisor-membership/checkout-pricing";
import { formatMembershipInr } from "@/lib/advisor-membership";
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
  initialCouponCode?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function MembershipActionSheet({
  open,
  mode,
  currentPlanId,
  targetPlanId,
  initialCouponCode,
  onClose,
  onSuccess,
}: MembershipActionSheetProps) {
  const { payForPlan } = useRazorpayCheckout();
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  const current = MEMBERSHIP_PLANS.find((p) => p.id === currentPlanId)!;
  const paidTarget =
    mode === "renew"
      ? paidPlanForRenew(currentPlanId)
      : paidPlanForUpgrade(targetPlanId ?? upgradeTarget(currentPlanId));
  const target =
    MEMBERSHIP_PLANS.find((p) => p.id === (paidTarget ?? currentPlanId)) ?? current;
  const checkoutKind: CheckoutKind = mode === "renew" ? "renew" : "upgrade";

  useEffect(() => {
    if (!open || !paidTarget) {
      setQuote(null);
      setQuoteError(null);
      setCouponCode("");
      setAppliedCouponCode(null);
      return;
    }

    const couponForQuote = appliedCouponCode || initialCouponCode || null;
    if (initialCouponCode && !appliedCouponCode) {
      setCouponCode(initialCouponCode);
      setAppliedCouponCode(initialCouponCode);
    }

    let cancelled = false;
    setQuoteLoading(true);
    setQuoteError(null);

    void fetch("/api/advisor/subscription/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkoutKind,
        planId: paidTarget,
        ...(couponForQuote ? { couponCode: couponForQuote } : {}),
      }),
    })
      .then(async (res) => {
        const json = (await res.json()) as {
          success?: boolean;
          message?: string;
          data?: CheckoutQuote;
        };
        if (cancelled) return;
        if (!res.ok || !json.success || !json.data) {
          setQuote(null);
          setQuoteError(json.message || "Could not load pricing");
          return;
        }
        setQuote(json.data);
      })
      .catch(() => {
        if (!cancelled) {
          setQuote(null);
          setQuoteError("Could not load pricing");
        }
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, paidTarget, checkoutKind, appliedCouponCode, initialCouponCode]);

  if (!open) return null;

  const title = mode === "renew" ? "Renew membership" : "Upgrade plan";
  const description =
    mode === "renew"
      ? `Renew your ${current.name} plan for another year.`
      : `Upgrade to ${target.name} — ${target.tagline}. Gold is valid for one year from the upgrade date.`;

  const handleConfirm = async () => {
    if (!paidTarget) {
      toast.info("Your Free plan does not require payment.");
      onClose();
      return;
    }

    try {
      setLoading(true);
      const paymentId = await payForPlan(paidTarget, {
        checkoutKind,
        couponCode: appliedCouponCode ?? undefined,
      });
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

  const payLabel = quote
    ? formatMembershipInr(quote.amountInr)
    : target.priceLabel;

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

        {paidTarget && (
          <>
            <div className="mt-3 flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code (optional)"
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground outline-none focus:border-white/20"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-10 shrink-0"
                disabled={quoteLoading || !couponCode.trim()}
                onClick={() => setAppliedCouponCode(couponCode.trim() || null)}
              >
                Apply
              </Button>
            </div>
            {appliedCouponCode ? (
              <p className="mt-2 text-[11px] text-[oklch(0.82_0.16_162)]">
                Coupon <span className="font-semibold">{appliedCouponCode}</span> applied to this
                checkout.
              </p>
            ) : null}

            <div className="mt-3 text-xs rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-muted-foreground space-y-2">
              {quoteLoading ? (
                <p>Calculating price…</p>
              ) : quoteError ? (
                <p className="text-destructive">{quoteError}</p>
              ) : quote ? (
                <>
                  {quote.creditInr > 0 ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span>Gold annual price</span>
                        <span>{formatMembershipInr(quote.listPriceInr)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[oklch(0.82_0.16_162)]">
                        <span>
                          Unused Silver credit
                          {quote.remainingDays > 0 ? ` (${quote.remainingDays} days left)` : ""}
                        </span>
                        <span>− {formatMembershipInr(quote.creditInr)}</span>
                      </div>
                    </>
                  ) : null}
                  {quote.couponDiscountInr && quote.couponDiscountInr > 0 ? (
                    <div className="flex items-center justify-between gap-3 text-[oklch(0.82_0.16_162)]">
                      <span>Coupon discount</span>
                      <span>− {formatMembershipInr(quote.couponDiscountInr)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10 font-semibold text-foreground">
                    <span>Pay today</span>
                    <span>{formatMembershipInr(quote.amountInr)}</span>
                  </div>
                  <p className="pt-1 border-t border-white/10">{quote.summary}</p>
                </>
              ) : (
                <p>Secure checkout via Razorpay. Your plan updates immediately after payment.</p>
              )}
            </div>
          </>
        )}

        {!paidTarget && (
          <p className="mt-3 text-xs rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-muted-foreground">
            No payment is required on the Free plan.
          </p>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1 rounded-xl h-11 font-semibold"
            disabled={
              loading ||
              quoteLoading ||
              Boolean(quoteError) ||
              (Boolean(paidTarget) && !quote)
            }
            onClick={() => void handleConfirm()}
          >
            {loading
              ? "Processing…"
              : paidTarget
                ? mode === "renew"
                  ? `Pay ${payLabel} & renew`
                  : `Pay ${payLabel} & upgrade`
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

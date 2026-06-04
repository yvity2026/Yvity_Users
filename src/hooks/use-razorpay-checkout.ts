"use client";

import { useCallback } from "react";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => {
  open: () => void;
  on: (event: string, handler: (response: RazorpayHandlerResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const payForPlan = useCallback(async (planId: Extract<MembershipPlanId, "silver" | "gold">) => {
    const orderRes = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const orderJson = (await orderRes.json()) as {
      success?: boolean;
      message?: string;
      data?: {
        keyId: string;
        orderId: string;
        amount: number;
        currency: string;
        prefill?: { name?: string; email?: string; contact?: string };
      };
    };

    if (!orderRes.ok || !orderJson.success || !orderJson.data) {
      throw new Error(orderJson.message || "Could not start payment");
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error("Could not load Razorpay checkout");
    }

    const { keyId, orderId, amount, currency, prefill } = orderJson.data;

    return new Promise<string>((resolve, reject) => {
      const rzp = new window.Razorpay!({
        key: keyId,
        amount,
        currency,
        name: "YVITY",
        description: `${planId === "gold" ? "Gold" : "Silver"} membership (annual)`,
        order_id: orderId,
        prefill: prefill ?? {},
        theme: { color: "#0A4A4A" },
        handler: async (response: RazorpayHandlerResponse) => {
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyJson = (await verifyRes.json()) as {
              success?: boolean;
              message?: string;
              data?: { paymentId: string };
            };
            if (!verifyRes.ok || !verifyJson.success || !verifyJson.data?.paymentId) {
              throw new Error(verifyJson.message || "Payment verification failed");
            }
            resolve(verifyJson.data.paymentId);
          } catch (err) {
            reject(err instanceof Error ? err : new Error("Payment verification failed"));
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      });

      rzp.on("payment.failed", () => {
        reject(new Error("Payment failed. Please try again."));
      });

      rzp.open();
    });
  }, []);

  return { payForPlan };
}

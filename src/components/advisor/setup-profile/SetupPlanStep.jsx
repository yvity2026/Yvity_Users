"use client";

import { Check } from "lucide-react";
import { MEMBERSHIP_PLANS } from "@/lib/advisor-membership/plans";
import { cn } from "@/lib/utils";

export function SetupPlanStep({ selectedPlan, onSelectPlan, paymentDone, paidPlanId }) {
  return (
    <div className="space-y-4">
      <p className="font-poppins text-sm leading-relaxed text-[#64748B]">
        Choose how you want to launch on YVITY.{" "}
        <span className="font-semibold text-[#0F172A]">Free</span> goes live immediately (identity
        verified only). <span className="font-semibold text-[#0F172A]">Silver</span> and{" "}
        <span className="font-semibold text-[#0F172A]">Gold</span> require payment now; your profile
        and services are reviewed by YVITY before going live.
      </p>

      <ul className="grid gap-3 sm:grid-cols-3">
        {MEMBERSHIP_PLANS.map((plan) => {
          const selected = selectedPlan === plan.id;
          const paid = paymentDone && paidPlanId === plan.id;
          return (
            <li key={plan.id}>
              <button
                type="button"
                onClick={() => onSelectPlan(plan.id)}
                className={cn(
                  "flex h-full w-full flex-col rounded-2xl border p-4 text-left transition",
                  selected
                    ? "border-[#0A4A4A] bg-[#F0FAFA] shadow-[0_0_0_1px_rgba(10,74,74,0.15)]"
                    : "border-[#E2E8F0] bg-white hover:border-[#0A4A4A]/30",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-poppins text-xs font-bold uppercase tracking-wider text-[#0A4A4A]">
                    {plan.name}
                  </span>
                  {selected ? (
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#0A4A4A] text-white">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 font-poppins text-lg font-bold text-[#0F172A]">
                  {plan.priceLabel}
                </p>
                <p className="mt-1 font-poppins text-xs leading-relaxed text-[#64748B]">
                  {plan.tagline}
                </p>
                {plan.highlight ? (
                  <p className="mt-2 font-poppins text-[10px] font-semibold uppercase tracking-wide text-[#D97706]">
                    {plan.highlight}
                  </p>
                ) : null}
                {plan.id === "free" ? (
                  <p className="mt-3 font-poppins text-[10px] text-[#16A34A]">
                    Live instantly · services not YVITY-verified
                  </p>
                ) : (
                  <p className="mt-3 font-poppins text-[10px] text-[#64748B]">
                    Pay with Razorpay · admin verifies services
                  </p>
                )}
                {paid ? (
                  <p className="mt-2 rounded-lg bg-[#DCFCE7] px-2 py-1 font-poppins text-[10px] font-semibold text-[#166534]">
                    Payment completed
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

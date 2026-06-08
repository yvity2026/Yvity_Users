"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthUserContext";
import {
  BadgeCheck,
  Calendar,
  Check,
  Crown,
  Download,
  Eye,
  FileText,
  Minus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { DashboardSection } from "@/components/advisor/dashboard/dashboard-ui";
import { MembershipActionSheet } from "@/components/advisor/membership/membership-action-sheet";
import {
  allPlanComparisonLabels,
  buildMembershipModel,
  marketingFeatureRows,
  planMarketingIncludes,
  upgradePlanId,
} from "@/lib/advisor-membership";
import { openMembershipInvoice } from "@/lib/advisor-membership/membership-invoice";
import type { MembershipPlanId } from "@/lib/advisor-membership/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatInr(amount: number): string {
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type MembershipPaymentRow = {
  id: string;
  paidAt: string;
  planName: string;
  planId: string;
  amountInr: number;
  creditInr: number;
  checkoutKind: string;
  invoiceId: string;
  status: "paid";
};

export function AdvisorMembershipModule() {
  const { advisor, setAdvisor } = useAuth();
  const [payments, setPayments] = useState<MembershipPaymentRow[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const model = useMemo(
    () =>
      buildMembershipModel({
        subscriptionPlan: advisor?.subscription_plan,
        approvedAt: advisor?.approved_at,
        subscriptionStartedAt: advisor?.subscription_started_at,
        subscriptionExpiresAt: advisor?.subscription_expires_at,
      }),
    [
      advisor?.subscription_plan,
      advisor?.approved_at,
      advisor?.subscription_started_at,
      advisor?.subscription_expires_at,
    ],
  );
  const searchParams = useSearchParams();
  const [sheet, setSheet] = useState<{
    open: boolean;
    mode: "renew" | "upgrade";
    target?: MembershipPlanId;
    couponCode?: string;
  }>({ open: false, mode: "renew" });

  const upgradeTarget = upgradePlanId(model.current.planId);
  const { current, renewal } = model;

  const openRenew = () => setSheet({ open: true, mode: "renew" });
  const openUpgrade = (target?: MembershipPlanId) =>
    setSheet({
      open: true,
      mode: "upgrade",
      target: target ?? upgradeTarget ?? undefined,
    });

  useEffect(() => {
    const payPlan = searchParams.get("pay")?.trim().toLowerCase();
    const checkout = searchParams.get("checkout")?.trim().toLowerCase();
    const coupon = searchParams.get("coupon")?.trim() || undefined;
    if (!payPlan || payPlan === "free") return;

    const mode =
      checkout === "renew" ? "renew" : checkout === "upgrade" ? "upgrade" : "upgrade";

    setSheet({
      open: true,
      mode,
      target: payPlan as MembershipPlanId,
      couponCode: coupon,
    });
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setPaymentsLoading(true);
    void fetch("/api/advisor/subscription/payments", { cache: "no-store", credentials: "same-origin" })
      .then(async (res) => {
        const json = (await res.json()) as {
          success?: boolean;
          data?: MembershipPaymentRow[];
        };
        if (cancelled) return;
        setPayments(res.ok && json.success && json.data ? json.data : []);
      })
      .catch(() => {
        if (!cancelled) setPayments([]);
      })
      .finally(() => {
        if (!cancelled) setPaymentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [advisor?.subscription_plan, advisor?.subscription_expires_at]);

  return (
    <div className="space-y-3 md:space-y-10 pb-6 animate-in fade-in duration-400">
      <section
        aria-labelledby="membership-section-title"
        className="glass-strong rounded-3xl border border-white/12 overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-[oklch(0.85_0.16_78)] via-primary to-[oklch(0.82_0.13_205)]" />
        <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.85_0.16_78)] to-primary shadow-lg shadow-primary/25 ring-1 ring-white/15">
            <Crown className="size-6 text-primary-foreground" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Membership
            </p>
            <h2
              id="membership-section-title"
              className="text-xl md:text-2xl font-bold tracking-tight mt-1"
            >
              Your YVITY plan
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage plan, benefits, renewal and payments in one place.
            </p>
          </div>
        </div>
      </section>

      {renewal.showReminder && (
        <RenewalReminder
          daysRemaining={renewal.daysRemaining}
          level={renewal.reminderLevel}
          onRenew={openRenew}
          onUpgrade={() => openUpgrade()}
        />
      )}

      {/* 1. Current plan */}
      <DashboardSection title="Current plan" subtitle="Your active membership details" defaultOpen>
        <div className="glass-strong rounded-2xl border border-white/10 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Plan</p>
              <p className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                {current.planName}
              </p>
            </div>
            <StatusBadge status={current.status} />
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCell label="Start date" value={formatDate(current.startDate)} />
            <InfoCell label="Expiry date" value={formatDate(current.expiryDate)} />
            <InfoCell
              label="Days remaining"
              value={current.status === "active" ? String(current.daysRemaining) : "—"}
              highlight={current.daysRemaining <= 14 && current.status === "active"}
            />
            {current.showVerifiedBadge && (
              <div className="col-span-2 md:col-span-1 flex items-end">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[oklch(0.82_0.13_205/0.4)] bg-[oklch(0.82_0.13_205/0.12)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.88_0.12_205)]">
                  <BadgeCheck className="size-3.5" />
                  Verified badge
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <Button className="flex-1 rounded-xl h-11 font-semibold gap-2" onClick={openRenew}>
              <RefreshCw className="size-4" />
              Renew membership
            </Button>
            {upgradeTarget && (
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11 font-semibold border-[oklch(0.85_0.16_78/0.45)] text-[oklch(0.92_0.14_78)] hover:bg-[oklch(0.85_0.16_78/0.12)] gap-2"
                onClick={() => openUpgrade(upgradeTarget)}
              >
                <Sparkles className="size-4" />
                Upgrade plan
              </Button>
            )}
          </div>
        </div>
      </DashboardSection>

      {/* 2. Plan benefits */}
      <DashboardSection title="Plan benefits" subtitle="Included with your current plan">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {model.benefits.map((b) => (
            <li
              key={b.id}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm"
            >
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[oklch(0.82_0.16_162/0.2)] text-[oklch(0.82_0.16_162)]">
                <Check className="size-3.5 stroke-[3]" />
              </span>
              {b.label}
            </li>
          ))}
        </ul>
      </DashboardSection>

      {/* 3. Compare plans */}
      <DashboardSection
        title="Compare plans"
        subtitle="Choose the right level for your practice"
        action={
          upgradeTarget ? (
            <button
              type="button"
              onClick={() => openUpgrade(upgradeTarget)}
              className="text-xs font-semibold text-[oklch(0.85_0.16_78)]"
            >
              Upgrade to {upgradeTarget.toUpperCase()}
            </button>
          ) : null
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {model.plans.map((plan) => (
            <PlanCompareCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === current.planId}
              onSelect={() => {
                if (plan.id === current.planId) return;
                if (
                  plan.priceAnnualInr >
                  (model.plans.find((p) => p.id === current.planId)?.priceAnnualInr ?? 0)
                ) {
                  openUpgrade(plan.id);
                }
              }}
            />
          ))}
        </div>

        <div className="mt-4 hidden lg:block glass-strong rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Feature</th>
                {model.plans.map((p) => (
                  <th key={p.id} className="px-4 py-3 font-semibold text-center">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPlanComparisonLabels().map((label) => (
                <tr key={label} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-2.5 text-muted-foreground">{label}</td>
                  {model.plans.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 text-center">
                      {planMarketingIncludes(p.id, label) ? (
                        <Check className="size-4 mx-auto text-[oklch(0.82_0.16_162)]" />
                      ) : (
                        <Minus className="size-4 mx-auto text-white/20" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardSection>

      {/* 4. Renewal information */}
      <DashboardSection title="Renewal information" subtitle="Stay active without interruption">
        <div className="glass-strong rounded-2xl border border-white/10 p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCell
              label="Renewal date"
              value={formatDate(renewal.renewalDate)}
              icon={Calendar}
            />
            <InfoCell label="Expiry date" value={formatDate(renewal.expiryDate)} icon={Calendar} />
            <InfoCell
              label="Days remaining"
              value={String(renewal.daysRemaining)}
              highlight={renewal.daysRemaining <= 45}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/10">
            <Button className="flex-1 rounded-xl h-11 font-semibold" onClick={openRenew}>
              Renew now
            </Button>
            {upgradeTarget && (
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11 font-semibold border-white/15"
                onClick={() => openUpgrade(upgradeTarget)}
              >
                Upgrade membership
              </Button>
            )}
          </div>
        </div>
      </DashboardSection>

      {/* 5. Payment history */}
      <DashboardSection title="Payment history" subtitle="Past membership payments">
        {paymentsLoading ? (
          <p className="text-sm text-muted-foreground text-center py-8 glass-strong rounded-2xl border border-dashed border-white/15">
            Loading payments…
          </p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 glass-strong rounded-2xl border border-dashed border-white/15">
            No payments recorded yet.
          </p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="glass-strong rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Date
                    </p>
                    <p className="font-medium mt-0.5">{formatDate(p.paidAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Plan
                    </p>
                    <p className="font-medium mt-0.5">{p.planName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Amount
                    </p>
                    <p className="font-medium mt-0.5 tabular-nums">{formatInr(p.amountInr)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Status
                    </p>
                    <PaymentStatusBadge status={p.status} />
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-9 gap-1.5 flex-1 sm:flex-none border-white/12"
                    onClick={() => openMembershipInvoice(p, "view")}
                  >
                    <Eye className="size-3.5" />
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-9 gap-1.5 flex-1 sm:flex-none border-white/12"
                    onClick={() => openMembershipInvoice(p, "download")}
                  >
                    <Download className="size-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {payments.length > 0 ? (
          <p className="text-[10px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1.5">
            <FileText className="size-3" />
            Invoices open in a new tab — use Print to save as PDF.
          </p>
        ) : null}
      </DashboardSection>

      <MembershipActionSheet
        open={sheet.open}
        mode={sheet.mode}
        currentPlanId={current.planId}
        targetPlanId={sheet.target}
        initialCouponCode={sheet.couponCode}
        onClose={() => setSheet((s) => ({ ...s, open: false, couponCode: undefined }))}
        onSuccess={() => {
          void fetch("/api/advisor/auth/me", { cache: "no-store" })
            .then((res) => (res.ok ? res.json() : null))
            .then((json: { data?: typeof advisor } | null) => {
              if (json?.data) setAdvisor(json.data);
            })
            .catch(() => {});
          void fetch("/api/advisor/subscription/payments", { cache: "no-store", credentials: "same-origin" })
            .then(async (res) => {
              const json = (await res.json()) as {
                success?: boolean;
                data?: MembershipPaymentRow[];
              };
              if (res.ok && json.success && json.data) setPayments(json.data);
            })
            .catch(() => {});
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: "active" | "expired" }) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider",
        active
          ? "border-[oklch(0.82_0.16_162/0.45)] bg-[oklch(0.82_0.16_162/0.15)] text-[oklch(0.88_0.14_162)]"
          : "border-[oklch(0.72_0.18_15/0.4)] bg-[oklch(0.72_0.18_15/0.12)] text-[oklch(0.88_0.12_15)]",
      )}
    >
      {active ? "Active" : "Expired"}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: "paid" | "pending" | "failed" }) {
  const styles = {
    paid: "text-[oklch(0.82_0.16_162)]",
    pending: "text-[oklch(0.85_0.16_78)]",
    failed: "text-destructive",
  };
  const labels = { paid: "Paid", pending: "Pending", failed: "Failed" };
  return <p className={cn("font-semibold mt-0.5 capitalize", styles[status])}>{labels[status]}</p>;
}

function InfoCell({
  label,
  value,
  highlight,
  icon: Icon,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon?: typeof Calendar;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5",
        highlight && "border-[oklch(0.85_0.16_78/0.4)] bg-[oklch(0.85_0.16_78/0.08)]",
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="size-3" />}
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-semibold mt-1 tabular-nums",
          highlight && "text-[oklch(0.92_0.14_78)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function RenewalReminder({
  daysRemaining,
  level,
  onRenew,
  onUpgrade,
}: {
  daysRemaining: number;
  level: "soon" | "urgent" | "none";
  onRenew: () => void;
  onUpgrade: () => void;
}) {
  if (level === "none") return null;
  const urgent = level === "urgent" || daysRemaining <= 0;

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3",
        urgent
          ? "border-[oklch(0.72_0.18_15/0.45)] bg-[oklch(0.72_0.18_15/0.12)]"
          : "border-[oklch(0.85_0.16_78/0.45)] bg-[oklch(0.85_0.16_78/0.1)]",
      )}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold">
          {daysRemaining <= 0
            ? "Your membership has expired"
            : `Renewal in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {urgent
            ? "Renew now to keep your profile and leads inbox active."
            : "Plan ahead so your public profile stays uninterrupted."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="rounded-lg h-9" onClick={onRenew}>
          Renew now
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-lg h-9 border-white/15"
          onClick={onUpgrade}
        >
          Upgrade
        </Button>
      </div>
    </div>
  );
}

function PlanCompareCard({
  plan,
  isCurrent,
  onSelect,
}: {
  plan: (typeof import("@/lib/advisor-membership/plans").MEMBERSHIP_PLANS)[number];
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const isGold = plan.id === "gold";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-5 transition",
        isCurrent
          ? "border-primary ring-2 ring-primary/40 bg-primary/10 shadow-lg shadow-primary/15"
          : "border-white/10 glass-strong hover:border-white/20",
        isGold && !isCurrent && "border-[oklch(0.85_0.16_78/0.35)]",
      )}
    >
      {isCurrent && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          Current plan
        </span>
      )}
      {plan.highlight && !isCurrent && (
        <span className="absolute -top-2.5 right-4 rounded-full border border-white/15 bg-background/90 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
          {plan.highlight}
        </span>
      )}

      <p className="text-lg font-bold tracking-tight">{plan.name}</p>
      <p className="text-xl font-bold mt-1 text-[oklch(0.85_0.16_78)]">{plan.priceLabel}</p>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{plan.tagline}</p>

      <ul className="mt-4 space-y-2 flex-1">
        {marketingFeatureRows(plan.id).map((f) => (
          <li key={f.label} className="flex items-start gap-2 text-xs">
            {f.included ? (
              <Check className="size-3.5 shrink-0 text-[oklch(0.82_0.16_162)] mt-0.5" />
            ) : (
              <X className="size-3.5 shrink-0 text-white/25 mt-0.5" />
            )}
            <span className={f.included ? "text-foreground/90" : "text-muted-foreground/60"}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      {!isCurrent && plan.priceAnnualInr > 0 && (
        <Button
          type="button"
          variant={isGold ? "default" : "outline"}
          className="mt-4 w-full rounded-xl h-10 font-semibold"
          onClick={onSelect}
        >
          {plan.id === "free" ? "Downgrade" : "Choose plan"}
        </Button>
      )}
    </div>
  );
}

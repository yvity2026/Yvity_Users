"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { Building2, CheckCircle2, ChevronDown, FileText, Shield, Users } from "lucide-react";
import type { ServiceItem } from "@/lib/sections/types";
import {
  formatCountMetric,
  mergeCardDisplay,
  metricLabelsForCapacity,
  shouldShowServiceCardMetric,
} from "@/lib/advisor/service-card-display";
import { serviceAccents } from "@/lib/sections/services-config";
import {
  displayCategoryHeading,
  displayLicenseHolder,
  formatMetricValue,
  normalizeCompanyName,
} from "@/lib/sections/service-display";
import { resolveServiceExperience } from "@/lib/sections/service-experience";
import { VerifiedByYvityBadge } from "@/components/verification/verified-by-yvity-badge";
import { isServiceVerifiedForPlan } from "@/lib/advisor-membership/plan-enforcement";
import { useResolvedPlanLimits } from "@/hooks/use-resolved-plan-limits";
import { cn } from "@/lib/utils";

/**
 * Build a short initials label for the company avatar when no uploaded logo
 * is available. Prefers leading uppercase acronyms (so "LIC of India" → "LIC",
 * "AMFI Member" → "AMFI") and falls back to first letters of the first 3
 * words. Single-word providers return the first 2 characters.
 */
function deriveCompanyInitials(provider: string | undefined): string {
  const cleaned = (provider ?? "").trim();
  if (!cleaned) return "—";
  const leadingAcronym = /^([A-Z]{2,5})\b/.exec(cleaned);
  if (leadingAcronym) return leadingAcronym[1];
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .filter(Boolean)
    .join("");
}

type ServiceDetailCardProps = {
  item: ServiceItem;
  /**
   * Marks the card as belonging to the advisor dashboard. Today this is
   * purely informational — the actual edit action is fired from the
   * dashboard's toolbar (`ServiceDashboardCard`'s `DashboardActionsBar`),
   * not from clicking the card body. We keep the prop in the API so
   * existing call sites don't need to change.
   */
  editable?: boolean;
  /**
   * Deprecated card-level edit handler. Kept for backwards compatibility
   * but no longer wired up — the entire top region is now the accordion
   * trigger, and editing happens via the dashboard toolbar.
   */
  onEdit?: () => void;
  /**
   * Optional badge rendered in the top-right of the card. When provided it
   * fully replaces the default "Verified by YVITY" badge — used by the
   * advisor dashboard to surface pending / rejected verification states
   * without changing the rest of the card layout.
   */
  statusBadge?: React.ReactNode;
  /**
   * Zero-based position used for the staggered entrance animation. Stagger
   * is capped so very long lists never feel sluggish.
   */
  index?: number;
  /**
   * Initial open state for the accordion body. Defaults to `false` —
   * collapsed shows only the dark Service Header bar + Company
   * Information row, matching the design reference.
   */
  defaultOpen?: boolean;
  /**
   * Controlled accordion open state. When provided alongside
   * `onOpenChange`, the card becomes controlled — useful when an
   * outer wrapper (e.g. the advisor dashboard's
   * `ServiceDashboardCard`) needs to render additional UI inside the
   * collapsible body via the `footer` slot.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Optional content rendered inside the accordion body, AFTER the
   * default metrics / status / areas blocks. Used by the dashboard to
   * tuck the rejection banner + actions toolbar inside the card so
   * the collapsed state on mobile stays as clean as on desktop.
   */
  footer?: React.ReactNode;
  /** Registration / profile name — used for Self licence holder display. */
  profileOwnerName?: string | null;
  /** When true, registration services approved with the profile show YVITY verified. */
  profileApproved?: boolean;
};

/**
 * ServiceDetailCard — premium accordion card.
 *
 *  Collapsed (default):
 *    ┌──────────────────────────────────────────────┐
 *    │  Life Insurance              ✓ VERIFIED      │  ← Section 1 (header)
 *    ├──────────────────────────────────────────────┤
 *    │  [LIC] LIC of India                  ⌄       │  ← Section 2 (company)
 *    │        Life Planner • 7+ Years               │
 *    └──────────────────────────────────────────────┘
 *
 *  Expanded:
 *    …adds the rest of the card body (clients, claims, sum insured,
 *    claim ratio, claim status, areas / specializations).
 *
 *  The trigger is the entire top region — sections 1 + 2 — for an
 *  obvious, touch-friendly tap target. The chevron in the company row
 *  is a visual affordance and rotates 180° when open. The collapsing
 *  body uses the `grid-template-rows: 0fr → 1fr` pattern so the
 *  animation is smooth without measuring content height.
 */
export function ServiceDetailCard({
  item,
  editable: _editable,
  onEdit: _onEdit,
  statusBadge,
  index = 0,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  footer,
  profileOwnerName,
  profileApproved = false,
}: ServiceDetailCardProps) {
  void _editable;
  void _onEdit;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    () => defaultOpen || (typeof window !== "undefined" && window.innerWidth >= 768),
  );
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const toggleOpen = () => {
    const next = !open;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const triggerId = useId();
  const contentId = useId();

  const { limits } = useResolvedPlanLimits();
  const accent = serviceAccents[item.category];
  const showVerified = isServiceVerifiedForPlan(limits, item, profileApproved);
  const companyName = normalizeCompanyName(item.provider);
  const categoryHeading = displayCategoryHeading(item);
  const licenseHolderLine = displayLicenseHolder(item, profileOwnerName);
  // Use raw values — never show placeholder strings ("Enter your…") on the public card
  const designation = item.roleLabel?.trim() ?? "";
  const experience = resolveServiceExperience(item).trim();
  const subtitleParts = [designation, experience].filter(Boolean);
  const subtitleLine = subtitleParts.join(" • ");
  const capacityId = item.capacityId ?? "individual_agent";
  const cardDisplay = useMemo(
    () => mergeCardDisplay(capacityId, item.cardDisplay),
    [item.cardDisplay, capacityId],
  );
  const metricLabels = useMemo(() => metricLabelsForCapacity(capacityId), [capacityId]);
  const showCapacityChip = capacityId !== "individual_agent";
  const showClients = shouldShowServiceCardMetric(cardDisplay, "showClients", item);
  const showClaims = shouldShowServiceCardMetric(cardDisplay, "showClaims", item);
  const showSumInsured = shouldShowServiceCardMetric(cardDisplay, "showSumInsured", item);
  const showClaimSettled = shouldShowServiceCardMetric(cardDisplay, "showClaimSettled", item);
  const showClaimRatio = shouldShowServiceCardMetric(cardDisplay, "showClaimRatio", item);
  const showTeamSize = shouldShowServiceCardMetric(cardDisplay, "showTeamSize", item);
  const showActiveAgents = shouldShowServiceCardMetric(cardDisplay, "showActiveAgents", item);
  const showBranches = shouldShowServiceCardMetric(cardDisplay, "showBranches", item);
  const showStatus =
    cardDisplay.showStatusMessage && shouldShowServiceCardMetric(cardDisplay, "showStatusMessage", item);
  const showAreas = shouldShowServiceCardMetric(cardDisplay, "showAreas", item);
  const hasMetricGrid =
    showClients ||
    showClaims ||
    showSumInsured ||
    showClaimSettled ||
    showTeamSize ||
    showActiveAgents ||
    showBranches;
  const logoUrl = item.companyLogoUrl?.trim() ?? "";
  const hasLogo = logoUrl.length > 0;
  const initials = companyName ? deriveCompanyInitials(companyName) : null;
  const longInitials = (initials?.length ?? 0) >= 3;
  const badge =
    statusBadge !== undefined ? (
      statusBadge
    ) : showVerified ? (
      <VerifiedByYvityBadge className="shrink-0" />
    ) : null;

  return (
    <article
      className={cn(
        "group relative glass-strong rounded-2xl sm:rounded-3xl border border-white/10",
        // `w-full` is explicit so the card always spans the cell width,
        // even if a parent layout forgets to use `grid-cols-1` on
        // mobile or wraps the card in a non-flex container.
        "w-full flex flex-col h-full overflow-hidden",
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        "hover:border-white/20 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none",
      )}
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      {/* ─── TRIGGER — Sections 1 + 2 are always visible and toggle the
          accordion when tapped. ─── */}
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={toggleOpen}
        className={cn(
          "w-full text-left",
          "cursor-pointer active:scale-[0.998]",
          "transition-colors duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      >
        {/* ─── SECTION 1 — Service Header (dark premium title bar) ─── */}
        <div
          className={cn(
            "relative flex items-center justify-between gap-3",
            "px-5 sm:px-6 py-3.5 sm:py-4",
            "border-b border-white/10",
            accent.headerGradient,
          )}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />
          <h3
            className={cn(
              "min-w-0 flex-1 text-base sm:text-lg font-bold tracking-tight leading-tight",
              "text-white",
            )}
          >
            <span className="line-clamp-1">{categoryHeading}</span>
          </h3>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {/* ─── SECTION 2 — Company Information + chevron ───
             Rendered as a div, not a <header>, because the whole row
             sits inside a parent <button> — placing a sectioning element
             inside a button is invalid HTML. */}
        <div className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 sm:py-5">
          <span
            className={cn(
              "inline-flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl",
              "transition-colors duration-300",
              hasLogo
                ? "bg-white/95 ring-1 ring-white/20 overflow-hidden"
                : cn(accent.soft, "ring-1", accent.ring),
            )}
            aria-hidden={!hasLogo || undefined}
          >
            {hasLogo ? (
              <Image
                src={logoUrl}
                alt={item.provider ? `${item.provider} logo` : "Company logo"}
                width={48}
                height={48}
                className="size-full object-contain p-1"
                unoptimized={logoUrl.startsWith("/api/")}
              />
            ) : initials ? (
              <span
                className={cn(
                  "font-bold leading-none tracking-wide",
                  longInitials ? "text-[11px] sm:text-[12px]" : "text-sm sm:text-base",
                  accent.text,
                )}
                aria-label={`${item.provider} initials`}
              >
                {initials}
              </span>
            ) : (() => { const CatIcon = accent.icon; return <CatIcon className={cn("size-5", accent.text)} aria-hidden />; })()
            }
          </span>

          <div className="min-w-0 flex-1">
            {companyName ? (
              <p className="text-sm sm:text-base font-semibold truncate text-foreground">
                {companyName}
              </p>
            ) : null}
            {licenseHolderLine ? (
              <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground truncate">
                {licenseHolderLine}
              </p>
            ) : null}
            {subtitleLine ? (
              <p className={cn("mt-0.5 text-xs sm:text-sm truncate", accent.text)}>{subtitleLine}</p>
            ) : null}
            {showCapacityChip ? (
              <p className="mt-1 inline-flex max-w-full truncate rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {metricLabels.capacityChip}
              </p>
            ) : null}
          </div>

          {/* Chevron — visual cue that this card opens. Rotates when
              expanded. The chip background uses the category accent so
              the affordance feels intentional, not generic. */}
          <span
            aria-hidden
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
              "border border-white/10 bg-white/[0.04]",
              "transition-all duration-300 ease-out motion-reduce:transition-none",
              "group-hover:bg-white/[0.08]",
              open && "rotate-180",
            )}
          >
            <ChevronDown className={cn("size-4", accent.text)} strokeWidth={2.25} />
          </span>
        </div>
      </button>

      {/* ─── COLLAPSIBLE BODY — Metrics / Claim Ratio / Status / Areas ───
          Uses the `grid-template-rows: 0fr → 1fr` trick so the height
          animates smoothly without JS measurements. */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex-1 flex flex-col px-5 sm:px-6 pb-5 sm:pb-6">
            <div className="mb-4 border-t border-white/10" aria-hidden />

            {hasMetricGrid ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {showClients ? (
                  <MetricChip
                    icon={Users}
                    label={metricLabels.clients}
                    value={formatCountMetric(item.clients)}
                    accent={accent.text}
                  />
                ) : null}
                {showClaims ? (
                  <MetricChip
                    icon={FileText}
                    label={metricLabels.claims}
                    value={formatCountMetric(item.claims)}
                    accent={accent.text}
                  />
                ) : null}
                {showTeamSize ? (
                  <MetricChip
                    icon={Users}
                    label={metricLabels.teamSize}
                    value={formatCountMetric(item.teamSize)}
                    accent={accent.text}
                  />
                ) : null}
                {showActiveAgents ? (
                  <MetricChip
                    icon={Users}
                    label={metricLabels.activeAgents}
                    value={formatCountMetric(item.activeAgents)}
                    accent={accent.text}
                  />
                ) : null}
                {showBranches ? (
                  <MetricChip
                    icon={Building2}
                    label={metricLabels.branches}
                    value={formatCountMetric(item.branchCount)}
                    accent={accent.text}
                  />
                ) : null}
                {showSumInsured ? (
                  <div
                    className={cn(
                      "rounded-xl border border-white/10 p-3 text-center",
                      accent.soft,
                      !showClaimSettled ? "sm:col-span-2" : "sm:col-span-1",
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Total Sum Insured
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-bold text-foreground">
                      {formatMetricValue(item.sumInsured, "₹ 0")}
                    </p>
                  </div>
                ) : null}
                {showClaimSettled ? (
                  <div
                    className={cn(
                      "rounded-xl border border-white/10 p-3 text-center",
                      accent.soft,
                      !showSumInsured ? "sm:col-span-2" : "sm:col-span-1",
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Total Claim Settled
                    </p>
                    <p className="mt-1 text-sm sm:text-base font-bold text-foreground">
                      {formatMetricValue(item.claimSettled, "₹ 0")}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {showClaimRatio ? (
              <div
                className={cn(
                  "mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 px-3 py-2.5 bg-gradient-to-r",
                  accent.ratio,
                )}
              >
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {metricLabels.claimRatio}
                </span>
                <span className={cn("text-sm font-bold", accent.text)}>{item.claimRatio}%</span>
              </div>
            ) : null}

            {showStatus && item.statusMessage ? (
              <div className={cn("mt-3 rounded-xl border border-white/10 p-3 sm:p-4", accent.soft)}>
                <p className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
                  <CheckCircle2 className={cn("size-4 shrink-0", accent.text)} />
                  {item.statusMessage}
                </p>
                {item.statusCaption && (
                  <p className="mt-1 pl-6 text-[11px] sm:text-xs text-muted-foreground">
                    {item.statusCaption}
                  </p>
                )}
              </div>
            ) : null}

            {showAreas && item.areas.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Areas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {item.areas.map((area) => (
                    <span
                      key={area.label}
                      className={cn(
                        "inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] sm:text-xs font-medium",
                        accent.border,
                        accent.soft,
                        accent.text,
                      )}
                    >
                      <Shield className="size-3 opacity-70" />
                      {area.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {footer && <div className="mt-4">{footer}</div>}
          </div>
        </div>
      </div>
    </article>
  );
}

function MetricChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 flex flex-col items-center text-center gap-1.5">
      <Icon className={cn("size-4 shrink-0", accent)} />
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

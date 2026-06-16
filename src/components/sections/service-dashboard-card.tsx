"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, FileText, Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { ServiceDetailCard } from "@/components/sections/service-detail-card";
import { VerificationStatusBadge } from "@/components/verification/verification-status-badge";
import { displayCompanyName, displayCategoryHeading, isBannerOnlyService } from "@/lib/sections/service-display";
import { serviceAccents } from "@/lib/sections/services-config";
import type { ServiceItem } from "@/lib/sections/types";
import { isServiceVerifiedForPlan } from "@/lib/advisor-membership/plan-enforcement";
import { useResolvedPlanLimits } from "@/hooks/use-resolved-plan-limits";
import type { VerificationStatus } from "@/lib/verification/types";
import { cn } from "@/lib/utils";

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

/**
 * Dashboard wrapper for a service. Renders the SAME card layout the public
 * profile shows ({@link ServiceDetailCard}) and adds:
 *  - a status badge in place of the public "Verified by YVITY" badge
 *  - an inline rejection-reason banner (when rejected)
 *  - a compact toolbar with the four advisor actions
 *
 * Mutual Funds use the banner-only layout on the public profile, so here we
 * fall back to a compact summary card with the same toolbar — the advisor
 * can still manage them.
 */
export function ServiceDashboardCard({
  item,
  onEdit,
  onDelete,
  index = 0,
  readOnly = false,
  profileApproved = false,
  profileOwnerName,
}: {
  item: ServiceItem;
  onEdit: () => void;
  onDelete: () => void;
  index?: number;
  readOnly?: boolean;
  profileApproved?: boolean;
  profileOwnerName?: string | null;
}) {
  const verification = item.verification;
  const isRejected = verification.status === "rejected";
  const isBannerOnly = isBannerOnlyService(item);
  // Was previously approved (reviewedAt exists) but is now pending → re-approval in progress
  const isReapprovalPending =
    verification.status === "pending" && !!verification.reviewedAt;
  // Auto-expand rejected cards and re-approval cards so advisors see the reason immediately
  const [open, setOpen] = useState(isRejected || isReapprovalPending);
  const { limits } = useResolvedPlanLimits();
  const yvityVerified = isServiceVerifiedForPlan(limits, item, profileApproved);
  const badgeStatus: VerificationStatus = yvityVerified ? "verified" : verification.status;
  const badgeLabel = isReapprovalPending ? "Changes Under Review" : undefined;

  const statusBadge = (
    <VerificationStatusBadge status={badgeStatus} label={badgeLabel} size="xs" className="shrink-0" />
  );

  const rejectionBanner = isRejected && verification.rejectionReason ? (
    <div className="rounded-xl border border-[oklch(0.72_0.18_15/0.4)] bg-[oklch(0.72_0.18_15/0.1)] px-3 py-2 text-[11px] leading-relaxed">
      <p className="flex items-center gap-1.5 font-semibold text-[oklch(0.88_0.12_15)]">
        <AlertTriangle className="size-3" />
        Verification rejected
      </p>
      <p className="mt-0.5 text-foreground/85">{verification.rejectionReason}</p>
    </div>
  ) : null;

  // The rejection banner + actions toolbar are tucked INSIDE the accordion
  // body so the collapsed dashboard card matches the clean look of the
  // public profile card on every viewport — especially mobile, where the
  // toolbar previously stacked below and made the list look cluttered.
  const dashboardFooter = readOnly ? null : (
    <div className="flex flex-col gap-2.5 border-t border-white/10 pt-4">
      {rejectionBanner}

      <DashboardActionsBar
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        isRejected={isRejected}
        isReapprovalPending={isReapprovalPending}
        profileApproved={profileApproved}
      />
    </div>
  );

  return (
    <div
      className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      {isBannerOnly ? (
        <div className="flex flex-col gap-2.5">
          <BannerOnlyServiceCard
            item={item}
            statusBadge={statusBadge}
            onEdit={readOnly ? undefined : onEdit}
          />
          {rejectionBanner}
          {!readOnly ? (
            <DashboardActionsBar
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              isRejected={isRejected}
              isReapprovalPending={isReapprovalPending}
              profileApproved={profileApproved}
            />
          ) : null}
        </div>
      ) : (
        <ServiceDetailCard
          item={item}
          editable={!readOnly}
          onEdit={readOnly ? undefined : onEdit}
          statusBadge={statusBadge}
          open={open}
          onOpenChange={setOpen}
          footer={dashboardFooter}
          profileOwnerName={profileOwnerName}
        />
      )}
    </div>
  );
}

function DashboardActionsBar({
  item,
  onEdit,
  onDelete,
  isRejected,
  isReapprovalPending = false,
  profileApproved = false,
}: {
  item: ServiceItem;
  onEdit: () => void;
  onDelete: () => void;
  isRejected: boolean;
  isReapprovalPending?: boolean;
  profileApproved?: boolean;
}) {
  const verification = item.verification;
  const { limits } = useResolvedPlanLimits();
  const yvityVerified = isServiceVerifiedForPlan(limits, item, profileApproved);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <FileText className="size-3" />
          {verification.documents.length}{" "}
          {verification.documents.length === 1 ? "document" : "documents"}
        </span>
        <span aria-hidden>·</span>
        <span>Last updated {formatDate(verification.updatedAt)}</span>
        {yvityVerified && (
          <>
            <span aria-hidden>·</span>
            <span>Visible on public profile</span>
          </>
        )}
        {!yvityVerified && isReapprovalPending && (
          <>
            <span aria-hidden>·</span>
            <span className="text-[oklch(0.85_0.16_78)]">Hidden · Changes awaiting re-approval</span>
          </>
        )}
        {!yvityVerified && !isReapprovalPending && verification.status === "pending" && verification.documents.length === 0 && (
          <>
            <span aria-hidden>·</span>
            <span className="text-[oklch(0.85_0.16_78)]">Hidden · Upload documents to go live</span>
          </>
        )}
        {!yvityVerified && !isReapprovalPending && verification.status === "pending" && verification.documents.length > 0 && (
          <>
            <span aria-hidden>·</span>
            <span>Hidden · Awaiting admin approval</span>
          </>
        )}
      </p>

      {isReapprovalPending && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-[oklch(0.85_0.16_78/0.35)] bg-[oklch(0.85_0.16_78/0.08)] px-3 py-2 text-[11px] text-[oklch(0.92_0.14_78)]">
          <AlertTriangle className="size-3 shrink-0 mt-0.5" />
          <span>Your service details have changed and are under review. This service is temporarily hidden from your public profile until admin re-approves the updated information.</span>
        </div>
      )}
      {!isReapprovalPending && verification.documents.length === 0 && !yvityVerified && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-[oklch(0.85_0.16_78/0.35)] bg-[oklch(0.85_0.16_78/0.08)] px-3 py-2 text-[11px] text-[oklch(0.92_0.14_78)]">
          <AlertTriangle className="size-3 shrink-0" />
          Upload at least one verification document to submit for review
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <ActionButton onClick={onEdit} icon={Pencil}>
          Edit
        </ActionButton>
        {isRejected && (
          <ActionButton onClick={onEdit} icon={RefreshCcw} variant="primary">
            Resubmit Verification
          </ActionButton>
        )}
        {isReapprovalPending && (
          <ActionButton onClick={onEdit} icon={RefreshCcw} variant="primary">
            Update & Resubmit
          </ActionButton>
        )}
        <ActionButton onClick={onDelete} icon={Trash2} variant="destructive">
          Delete Service
        </ActionButton>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  children,
  variant = "default",
}: {
  onClick: () => void;
  icon: typeof Pencil;
  children: React.ReactNode;
  variant?: "default" | "primary" | "destructive";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition",
        variant === "default" &&
          "border-white/12 bg-white/[0.04] hover:bg-white/10 text-foreground/85 hover:text-foreground",
        variant === "primary" && "border-primary/40 bg-primary/15 text-primary hover:bg-primary/25",
        variant === "destructive" &&
          "border-white/12 bg-white/[0.04] text-muted-foreground hover:text-[oklch(0.88_0.12_15)] hover:border-[oklch(0.72_0.18_15/0.5)]",
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}

/**
 * Compact card for banner-only services (Mutual Funds today). Visually echoes
 * the banner item style so the dashboard feels consistent with the public
 * profile, where these items never get a detail card of their own.
 */
function BannerOnlyServiceCard({
  item,
  statusBadge,
  onEdit,
}: {
  item: ServiceItem;
  statusBadge: React.ReactNode;
  onEdit?: () => void;
}) {
  const accent = serviceAccents[item.category];
  const Icon = accent.icon;
  const logoUrl = item.companyLogoUrl?.trim() ?? "";
  const hasLogo = logoUrl.length > 0;
  const Wrapper = onEdit ? "button" : "div";
  return (
    <Wrapper
      {...(onEdit
        ? { type: "button" as const, onClick: onEdit }
        : {})}
      className={cn(
        "glass-strong w-full rounded-2xl border border-white/12 p-5 text-left",
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        onEdit &&
          "hover:border-white/20 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 active:scale-[0.99]",
      )}
    >
      <div className="flex flex-wrap items-start gap-4">
        <span className="relative inline-flex size-12 shrink-0 items-center justify-center">
          <span
            className={cn(
              "inline-flex size-full items-center justify-center rounded-xl overflow-hidden",
              hasLogo ? "bg-white/95 ring-1 ring-white/20" : cn("glass", accent.ring),
            )}
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
            ) : (
              <Icon className={cn("size-6", accent.text)} />
            )}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight truncate min-w-0">
              {displayCategoryHeading(item)}
            </h3>
            {statusBadge}
          </div>
          <p
            className={cn(
              "mt-0.5 text-sm truncate",
              item.provider?.trim() ? "text-foreground/85" : "text-muted-foreground italic",
            )}
          >
            {displayCompanyName(item.provider)}
          </p>
          {item.roleLabel && <p className={cn("mt-1 text-xs", accent.text)}>{item.roleLabel}</p>}
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            Shows in banner · No detail card
          </p>
        </div>
      </div>
    </Wrapper>
  );
}

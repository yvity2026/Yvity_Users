"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VerificationStatusBadge } from "@/components/verification/verification-status-badge";
import { SERVICE_CATEGORY_LABEL } from "@/lib/verification/service-config";
import type { ServiceItem } from "@/lib/sections/types";
import type {
  VerificationDocument,
  VerificationRecord,
  VerificationStatus,
} from "@/lib/verification/types";
import { cn } from "@/lib/utils";

type EntityKind = "services" | "experiences" | "certifications" | "achievements";

type AdminEntity = {
  id: string;
  title: string;
  subtitle?: string;
  verification: VerificationRecord;
};

const ENTITY_TABS: {
  id: EntityKind;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "services", label: "Services", icon: Sparkles },
  { id: "experiences", label: "Career", icon: Briefcase },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "achievements", label: "Achievements", icon: Trophy },
];

type Filter = VerificationStatus | "all";
const FILTER_TABS: { id: Filter; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "verified", label: "Verified" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/* ------------------------------------------------------------------ */
/*  Adapters — services use a different legacy endpoint                */
/* ------------------------------------------------------------------ */

function serviceToEntity(s: ServiceItem): AdminEntity {
  return {
    id: s.id,
    title: s.title || "Untitled service",
    subtitle: [SERVICE_CATEGORY_LABEL[s.category], s.provider].filter(Boolean).join(" · "),
    verification: s.verification,
  };
}

async function fetchEntities(kind: EntityKind): Promise<AdminEntity[]> {
  if (kind === "services") {
    const res = await fetch("/api/admin/verifications", { cache: "no-store" });
    const json = (await res.json()) as { data?: ServiceItem[] };
    return (json.data ?? []).map(serviceToEntity);
  }
  const res = await fetch(`/api/admin/verifications/${kind}`, { cache: "no-store" });
  const json = (await res.json()) as { data?: AdminEntity[] };
  return json.data ?? [];
}

async function postReview(
  kind: EntityKind,
  entityId: string,
  action: "approve" | "reject",
  reason?: string,
): Promise<AdminEntity[]> {
  if (kind === "services") {
    const res = await fetch("/api/admin/verifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: entityId, action, reason }),
    });
    const json = (await res.json()) as { data?: ServiceItem[]; error?: string };
    if (!res.ok || !json.data) throw new Error(json.error ?? "Action failed");
    return json.data.map(serviceToEntity);
  }
  const res = await fetch(`/api/admin/verifications/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entityId, action, reason }),
  });
  const json = (await res.json()) as { data?: AdminEntity[]; error?: string };
  if (!res.ok || !json.data) throw new Error(json.error ?? "Action failed");
  return json.data;
}

/* ------------------------------------------------------------------ */
/*  Module                                                             */
/* ------------------------------------------------------------------ */

export function AdminVerificationsModule() {
  const [kind, setKind] = useState<EntityKind>("services");
  const [items, setItems] = useState<AdminEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonByEntity, setReasonByEntity] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEntities(kind);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const list = filter === "all" ? items : items.filter((i) => i.verification.status === filter);
    return [...list].sort(
      (a, b) =>
        new Date(b.verification.updatedAt).getTime() - new Date(a.verification.updatedAt).getTime(),
    );
  }, [items, filter]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      pending: 0,
      verified: 0,
      rejected: 0,
      all: items.length,
    };
    items.forEach((i) => {
      c[i.verification.status] += 1;
    });
    return c;
  }, [items]);

  const review = async (entityId: string, action: "approve" | "reject") => {
    setError(null);
    if (action === "reject") {
      const reason = reasonByEntity[entityId]?.trim();
      if (!reason) {
        setError("Please provide a rejection reason before rejecting.");
        return;
      }
    }
    setBusyId(entityId);
    try {
      const data = await postReview(
        kind,
        entityId,
        action,
        action === "reject" ? reasonByEntity[entityId]?.trim() : undefined,
      );
      setItems(data);
      setReasonByEntity((prev) => {
        const { [entityId]: _omit, ...rest } = prev;
        void _omit;
        return rest;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Entity-kind tabs. Switching reloads and resets filters/reasons. */}
      <div
        className="flex items-center gap-1 p-1 rounded-2xl glass border border-white/10 overflow-x-auto max-w-full scrollbar-none"
        role="tablist"
        aria-label="Verification entity"
      >
        {ENTITY_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = kind === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setKind(tab.id)}
              className={cn(
                "shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap",
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-white/12 text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] justify-center rounded-full px-1 text-[10px] font-semibold",
                  active ? "bg-white/20" : "bg-white/8",
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading verifications…
        </p>
      ) : filtered.length === 0 ? (
        <div className="glass-strong rounded-3xl border border-dashed border-white/15 p-12 text-center text-muted-foreground">
          Nothing in this bucket right now.
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item) => (
            <EntityCard
              key={item.id}
              item={item}
              busy={busyId === item.id}
              reason={reasonByEntity[item.id] ?? ""}
              onReasonChange={(reason) =>
                setReasonByEntity((prev) => ({ ...prev, [item.id]: reason }))
              }
              onApprove={() => void review(item.id, "approve")}
              onReject={() => void review(item.id, "reject")}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function EntityCard({
  item,
  busy,
  reason,
  onReasonChange,
  onApprove,
  onReject,
}: {
  item: AdminEntity;
  busy: boolean;
  reason: string;
  onReasonChange: (reason: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <li className="glass-strong rounded-2xl border border-white/12 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
            <VerificationStatusBadge status={item.verification.status} size="xs" />
          </div>
          {item.subtitle && <p className="mt-0.5 text-sm text-foreground/80">{item.subtitle}</p>}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Submitted {formatDate(item.verification.submittedAt)}
            {item.verification.reviewedAt &&
              ` · Reviewed ${formatDate(item.verification.reviewedAt)}`}
          </p>
        </div>
      </div>

      {item.verification.rejectionReason && item.verification.status === "rejected" && (
        <p className="mt-3 rounded-lg border border-[oklch(0.72_0.18_15/0.4)] bg-[oklch(0.72_0.18_15/0.1)] px-3 py-2 text-xs text-foreground/85">
          <span className="font-semibold text-[oklch(0.88_0.12_15)]">Reason: </span>
          {item.verification.rejectionReason}
        </p>
      )}

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          Uploaded documents
        </p>
        <DocumentList documents={item.verification.documents} />
      </div>

      {item.verification.status !== "verified" && (
        <div className="mt-4 space-y-2">
          <Textarea
            rows={2}
            placeholder="Rejection reason (required when rejecting)"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="text-sm"
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {item.verification.status !== "verified" && (
          <Button
            onClick={onApprove}
            disabled={busy || item.verification.documents.length === 0}
            className="gap-2"
          >
            <CheckCircle2 className="size-4" /> Approve
          </Button>
        )}
        {item.verification.status !== "rejected" && (
          <Button variant="outline" onClick={onReject} disabled={busy} className="gap-2">
            <XCircle className="size-4" /> Reject
          </Button>
        )}
        {busy && (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Updating…
          </p>
        )}
      </div>
    </li>
  );
}

function DocumentList({ documents }: { documents: VerificationDocument[] }) {
  if (documents.length === 0) {
    return <p className="text-xs text-muted-foreground">No documents uploaded.</p>;
  }
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] p-3"
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
            {doc.mimeType.startsWith("image/") ? (
              <ImageIcon className="size-4" />
            ) : (
              <FileText className="size-4" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">
              {doc.label?.trim() || "Untitled document"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{doc.filename}</p>
          </div>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/12 text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
            aria-label={`Open ${doc.filename}`}
          >
            <ExternalLink className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

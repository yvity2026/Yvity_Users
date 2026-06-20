"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IrdaiApprovalRow, IrdaiApprovalStats } from "@/lib/server/admin-irdai-approvals";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Filter = "all" | "pending" | "approved" | "rejected";

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function planLabel(plan: string) {
  const p = plan.toLowerCase();
  if (p === "gold") return "GOLD";
  if (p === "silver") return "SILVER";
  return "FREE";
}

export function IrdaiApprovalsModule() {
  const [rows, setRows] = useState<IrdaiApprovalRow[]>([]);
  const [stats, setStats] = useState<IrdaiApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("pending");
  const [selected, setSelected] = useState<IrdaiApprovalRow | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/approvals", { cache: "no-store" });
      const json = (await res.json()) as {
        data?: IrdaiApprovalRow[];
        stats?: IrdaiApprovalStats;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "Failed to load approvals");
      setRows(json.data ?? []);
      setStats(json.stats ?? null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load approvals");
      setRows([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchFilter = filter === "all" || row.status === filter;
      if (!matchFilter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        (row.email ?? "").toLowerCase().includes(q) ||
        row.location.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q)
      );
    });
  }, [rows, search, filter]);

  const updateApproval = async (action: "approve" | "reject", advisorId: string, reason?: string) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          advisorId,
          reason,
          note: reason,
        }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string; message?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "Update failed");
      }
      toast.success(action === "approve" ? "Advisor approved" : "Advisor rejected");
      await load();
      setSelected(null);
      setRejectOpen(false);
      setRejectReason("");
      setRejectNote("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update approval");
    } finally {
      setProcessing(false);
    }
  };

  const filterTabs: { id: Filter; label: string; count: number }[] = [
    { id: "pending", label: "Pending", count: stats?.pending ?? 0 },
    { id: "approved", label: "Approved", count: stats?.approved ?? 0 },
    { id: "rejected", label: "Rejected", count: stats?.rejected ?? 0 },
    { id: "all", label: "All", count: rows.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="size-5 animate-spin" />
        Loading IRDAI submissions…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Pending review"
          value={stats?.pending ?? 0}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Approved"
          value={stats?.approved ?? 0}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Rejected"
          value={stats?.rejected ?? 0}
          icon={XCircle}
          tone="red"
        />
      </div>

      <div className="glass-strong rounded-3xl border border-white/12 p-4 md:p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">IRDAI submissions</h2>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, city…"
              className="pl-9 rounded-xl h-10 bg-background/50"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                filter === tab.id
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-white/10 text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No submissions match this filter.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((row) => (
              <li
                key={row.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    {row.profile_pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.profile_pic}
                        alt=""
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="size-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{row.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {row.type} · {row.location} · {planLabel(row.plan)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Submitted {formatDate(row.submittedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <StatusBadge status={row.status} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-9"
                    onClick={() => setSelected(row)}
                  >
                    Review
                  </Button>
                  {row.status === "pending" && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-lg h-9"
                        disabled={processing}
                        onClick={() => void updateApproval("approve", row.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-lg h-9 border-destructive/40 text-destructive hover:bg-destructive/10"
                        disabled={processing}
                        onClick={() => {
                          setSelected(row);
                          setRejectOpen(true);
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={Boolean(selected) && !rejectOpen} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg rounded-3xl border border-white/12 glass-strong">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Detail label="Email" value={selected.email ?? "—"} />
                <Detail label="Phone" value={selected.phone ?? "—"} />
                <Detail label="Location" value={selected.location} />
                <Detail label="Plan" value={planLabel(selected.plan)} />
                <Detail label="Designation" value={selected.type} />
                <Detail label="License ref" value={selected.licenseNo} />
                <Detail label="Submitted" value={formatDate(selected.submittedAt)} />
                <Detail label="Status" value={selected.status} />
              </dl>
              {selected.rejectionReason && (
                <p className="text-xs rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                  {selected.rejectionReason}
                </p>
              )}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Uploaded proof</p>
                {(selected.licenseUrl || selected.document_urls.length > 0) ? (
                  <div className="flex flex-wrap gap-2">
                    {selected.licenseUrl && (
                      <a
                        href={selected.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="size-3.5" />
                        View IRDAI certificate
                      </a>
                    )}
                    {selected.document_urls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs rounded-lg border border-white/10 px-2 py-1 hover:bg-white/5"
                      >
                        <FileText className="size-3" />
                        Document
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No documents uploaded by this advisor.</p>
                )}
              </div>
              {selected.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 rounded-xl"
                    disabled={processing}
                    onClick={() => void updateApproval("approve", selected.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl border-destructive/40 text-destructive"
                    disabled={processing}
                    onClick={() => setRejectOpen(true)}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={(open) => !open && setRejectOpen(false)}>
        <DialogContent className="max-w-md rounded-3xl border border-white/12 glass-strong">
          <DialogHeader>
            <DialogTitle>Reject submission</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            The advisor will see &quot;Action required&quot; and your reason in the workspace.
          </p>
          <label className="block text-xs font-medium text-muted-foreground mt-2">Reason</label>
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Certificate unclear or license mismatch"
            className="rounded-xl mt-1"
          />
          <label className="block text-xs font-medium text-muted-foreground mt-3">Note (optional)</label>
          <Textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={3}
            className="rounded-xl mt-1"
          />
          <div className="flex gap-2 pt-2">
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              disabled={processing || !rejectReason.trim() || !selected}
              onClick={() =>
                selected &&
                void updateApproval(
                  "reject",
                  selected.id,
                  [rejectReason.trim(), rejectNote.trim()].filter(Boolean).join(" — "),
                )
              }
            >
              Confirm reject
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              disabled={processing}
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Clock;
  tone: "amber" | "green" | "red";
}) {
  const toneClass =
    tone === "amber"
      ? "text-amber-600 bg-amber-500/10"
      : tone === "green"
        ? "text-emerald-600 bg-emerald-500/10"
        : "text-red-600 bg-red-500/10";

  return (
    <div className="glass-strong rounded-2xl border border-white/12 p-4">
      <div className={cn("inline-flex size-9 items-center justify-center rounded-xl mb-3", toneClass)}>
        <Icon className="size-4" />
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: IrdaiApprovalRow["status"] }) {
  const styles = {
    pending: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    rejected: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

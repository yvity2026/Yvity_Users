"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone, Trash2, X } from "lucide-react";
import { SelectionCard } from "@/components/advisor/leads/selection-card";
import { FOLLOW_UP_TYPES, LEAD_STATUSES, sourceLabel } from "@/lib/leads/config";
import type { FollowUpType, Lead, LeadStatus } from "@/lib/leads/types";
import { telHref, whatsAppHref } from "@/lib/leads/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LeadManageSheetProps = {
  lead: Lead | null;
  onClose: () => void;
  onSave: (patch: {
    status: LeadStatus;
    followUpType?: FollowUpType | null;
    followUpDate?: string | null;
    followUpTime?: string | null;
    notes: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
};

const STATUS_ACTIVE: Record<LeadStatus, string> = {
  new: "ring-2 ring-[oklch(0.85_0.16_78/0.4)] border-[oklch(0.85_0.16_78/0.55)] bg-[oklch(0.85_0.16_78/0.18)]",
  interested:
    "ring-2 ring-[oklch(0.82_0.16_162/0.4)] border-[oklch(0.82_0.16_162/0.55)] bg-[oklch(0.82_0.16_162/0.18)]",
  follow_up:
    "ring-2 ring-[oklch(0.82_0.13_205/0.4)] border-[oklch(0.82_0.13_205/0.55)] bg-[oklch(0.82_0.13_205/0.18)]",
  proposal_shared:
    "ring-2 ring-[oklch(0.78_0.15_295/0.4)] border-[oklch(0.78_0.15_295/0.55)] bg-[oklch(0.78_0.15_295/0.18)]",
  converted:
    "ring-2 ring-[oklch(0.82_0.16_162/0.5)] border-[oklch(0.82_0.16_162/0.6)] bg-[oklch(0.82_0.16_162/0.22)]",
  not_interested:
    "ring-2 ring-[oklch(0.72_0.18_15/0.35)] border-[oklch(0.72_0.18_15/0.5)] bg-[oklch(0.72_0.18_15/0.15)]",
  not_contactable: "ring-2 ring-white/25 border-white/35 bg-white/12",
};

export function LeadManageSheet({ lead, onClose, onSave, onDelete }: LeadManageSheetProps) {
  const [status, setStatus] = useState<LeadStatus>("new");
  const [followUpType, setFollowUpType] = useState<FollowUpType | "">("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lead) return;
    setStatus(lead.status);
    setFollowUpType(lead.followUpType ?? "");
    setFollowUpDate(lead.followUpDate?.slice(0, 10) ?? "");
    setFollowUpTime(lead.followUpTime ?? "");
    setNotes(lead.notes);
    setError(null);
  }, [lead]);

  useEffect(() => {
    if (!lead) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lead]);

  if (!lead) return null;

  const waMessage = `Hi ${lead.fullName.split(" ")[0]}, following up regarding your enquiry on my YVITY profile.`;

  const toggleFollowUp = (id: FollowUpType) => {
    setFollowUpType((prev) => (prev === id ? "" : id));
  };

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSave({
        status,
        followUpType: followUpType || null,
        followUpDate: followUpDate || null,
        followUpTime: followUpTime || null,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    setBusy(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-end sm:items-stretch sm:justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={() => !busy && onClose()}
        aria-label="Close"
      />
      <div
        className={cn(
          "relative w-full sm:max-w-lg glass-strong border-t sm:border-t-0 sm:border-l border-white/15",
          "shadow-2xl max-h-[92vh] sm:h-full sm:max-h-none overflow-y-auto",
          "rounded-t-3xl sm:rounded-none animate-in slide-in-from-bottom-4 sm:slide-in-from-right duration-300",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-background/90 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-bold tracking-tight">{lead.fullName}</h2>
            <p className="text-xs text-muted-foreground">{sourceLabel(lead.channel)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="size-9 rounded-full border border-white/12 inline-flex items-center justify-center"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-6 pb-8">
          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Follow-Up Type
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FOLLOW_UP_TYPES.map((t) => (
                <SelectionCard
                  key={t.id}
                  label={t.label}
                  selected={followUpType === t.id}
                  disabled={busy}
                  onClick={() => toggleFollowUp(t.id)}
                  activeClassName="ring-2 ring-[oklch(0.82_0.13_205/0.45)] border-[oklch(0.82_0.13_205/0.55)] bg-[oklch(0.82_0.13_205/0.18)]"
                  className="min-h-[44px] py-2.5"
                />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Next follow-up date
              </Label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Time
              </Label>
              <input
                type="time"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Lead Status
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LEAD_STATUSES.map((s) => (
                <SelectionCard
                  key={s.id}
                  label={s.label}
                  leading={<span className="text-base">{s.emoji}</span>}
                  selected={status === s.id}
                  disabled={busy}
                  onClick={() => setStatus(s.id)}
                  activeClassName={STATUS_ACTIVE[s.id]}
                  className="min-h-[44px] py-2.5"
                />
              ))}
            </div>
          </section>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Notes
            </Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={busy}
              placeholder="e.g. Interested in Term Insurance — call next Monday"
              className={cn(
                "w-full rounded-xl border border-white/12 bg-white/[0.04]",
                "px-3 py-3 text-sm leading-relaxed resize-none",
                "focus:outline-none focus:ring-2 focus:ring-primary/40",
              )}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 rounded-xl h-11">
              <a href={telHref(lead.mobile)}>
                <Phone className="size-4" /> Call Now
              </a>
            </Button>
            <Button
              asChild
              className="flex-1 rounded-xl h-11 bg-[oklch(0.52_0.14_155)] hover:bg-[oklch(0.56_0.15_155)]"
            >
              <a
                href={whatsAppHref(lead.mobile, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </Button>
          </div>

          <Button
            type="button"
            disabled={busy}
            onClick={() => void handleSave()}
            className="w-full h-12 rounded-2xl font-semibold shadow-lg shadow-primary/25"
          >
            {busy ? "Saving…" : "Save Changes"}
          </Button>

          <button
            type="button"
            disabled={busy}
            onClick={() => void handleDelete()}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition"
          >
            <Trash2 className="size-4" />
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  );
}

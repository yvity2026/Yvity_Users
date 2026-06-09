"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useModalFocusTrap } from "@/hooks/use-modal-focus-trap";
import { Check, X } from "lucide-react";
import { SelectionCard } from "@/components/advisor/leads/selection-card";
import { LEAD_PRIORITIES, SELF_LEAD_SOURCES } from "@/lib/leads/config";
import {
  LEAD_SERVICE_TYPES,
  getLeadToneSelected,
  type LeadServiceType,
} from "@/lib/leads/service-types";
import type { CreateLeadInput, LeadPriority, SelfLeadChannel } from "@/lib/leads/types";
import { formatCreatedDateTime, phoneDigits } from "@/lib/leads/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AddLeadModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateLeadInput) => Promise<void>;
};

export function AddLeadModal({ open, onClose, onSubmit }: AddLeadModalProps) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [channel, setChannel] = useState<SelfLeadChannel>("self_manual");
  const [serviceType, setServiceType] = useState<LeadServiceType | "">("");
  const [priority, setPriority] = useState<LeadPriority>("medium");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useModalFocusTrap({
    isOpen: open,
    panelRef,
    onEscape: () => {
      if (!busy) onClose();
    },
  });

  useEffect(() => {
    if (!open) return;
    setFullName("");
    setMobile("");
    setCity("");
    setChannel("self_manual");
    setServiceType("");
    setPriority("medium");
    setNotes("");
    setError(null);
    setSuccess(false);
    setCreatedAt(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    if (busy) return;
    onClose();
  };

  const validate = (): string | null => {
    if (fullName.trim().length < 2) return "Please enter full name.";
    if (phoneDigits(mobile).length < 10) return "Please enter a valid 10-digit mobile number.";
    if (!serviceType) return "Please select a service type.";
    if (!channel) return "Please select lead source.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setBusy(true);
    const now = new Date().toISOString();
    try {
      await onSubmit({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        city: city.trim() || undefined,
        channel,
        serviceType: serviceType as LeadServiceType,
        priority,
        notes: notes.trim() || undefined,
      });
      setCreatedAt(now);
      setSuccess(true);
      // 1.2s — long enough to register the green confirmation tick
      // without slowing the next action; 800ms felt like a flash.
      window.setTimeout(handleClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add lead");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-lead-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={handleClose}
        disabled={busy}
        aria-label="Close"
      />
      <div
        ref={panelRef}
        className="relative z-10 flex flex-col w-full sm:max-w-xl glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl max-h-[92dvh] sm:max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle (signals bottom-sheet on phones). */}
        <div className="sm:hidden flex justify-center pt-2.5" aria-hidden>
          <span className="h-1.5 w-10 rounded-full bg-white/20" />
        </div>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/10 bg-background/90 backdrop-blur-xl rounded-t-3xl sm:rounded-t-3xl">
          <div className="min-w-0">
            <h2 id="add-lead-title" className="text-base sm:text-lg font-bold tracking-tight">
              Add New Lead
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              Date & time captured automatically when you save
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/12 hover:bg-white/5 active:scale-[0.97] transition"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {success ? (
          <div className="p-10 flex flex-col items-center text-center flex-1">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-[oklch(0.82_0.16_162/0.2)] text-[oklch(0.82_0.16_162)] mb-4">
              <Check className="size-7" />
            </span>
            <p className="font-semibold text-lg">Lead added</p>
            {createdAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Created {formatCreatedDateTime(createdAt)}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 sm:py-5 space-y-5 sm:space-y-6">
              <section className="space-y-2.5 sm:space-y-3">
                <SectionLabel required>Full Name</SectionLabel>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="h-12 rounded-xl text-base"
                  disabled={busy}
                  autoFocus
                  autoComplete="name"
                />
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2.5 sm:space-y-3">
                  <SectionLabel required>Mobile Number</SectionLabel>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    className="h-12 rounded-xl text-base"
                    disabled={busy}
                  />
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  <SectionLabel>City / Location</SectionLabel>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Nellore"
                    className="h-12 rounded-xl text-base"
                    disabled={busy}
                    autoComplete="address-level2"
                  />
                </div>
              </section>

              <section className="space-y-2.5 sm:space-y-3">
                <SectionLabel required>Service Type</SectionLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LEAD_SERVICE_TYPES.map((s) => (
                    <SelectionCard
                      key={s.id}
                      label={s.label}
                      selected={serviceType === s.id}
                      disabled={busy}
                      onClick={() => setServiceType(s.id)}
                      activeClassName={getLeadToneSelected(s.tone)}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-2.5 sm:space-y-3">
                <SectionLabel required>Lead Source</SectionLabel>
                <div className="grid grid-cols-2 gap-2">
                  {SELF_LEAD_SOURCES.map((s) => (
                    <SelectionCard
                      key={s.id}
                      label={s.label}
                      selected={channel === s.id}
                      disabled={busy}
                      onClick={() => setChannel(s.id)}
                      activeClassName="ring-2 ring-[oklch(0.82_0.13_205/0.4)] border-[oklch(0.82_0.13_205/0.55)] bg-[oklch(0.82_0.13_205/0.18)]"
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-2.5 sm:space-y-3">
                <SectionLabel>Priority</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {LEAD_PRIORITIES.map((p) => (
                    <SelectionCard
                      key={p.id}
                      label={p.label}
                      leading={<span className="text-base">{p.emoji}</span>}
                      selected={priority === p.id}
                      disabled={busy}
                      onClick={() => setPriority(p.id)}
                      activeClassName={p.activeClass}
                      idleClassName={p.idleClass}
                      className="py-3.5 text-center [&_span]:justify-center"
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-2.5 sm:space-y-3">
                <SectionLabel>Notes</SectionLabel>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  disabled={busy}
                  placeholder="e.g. Interested in ₹1 Cr Term Insurance · callback on Sunday"
                  className={cn(
                    "w-full rounded-xl border border-white/12 bg-white/[0.04]",
                    "px-3 py-3 text-base sm:text-sm leading-relaxed resize-none",
                    "placeholder:text-muted-foreground/70",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50",
                  )}
                />
              </section>

              {error && (
                <p className="text-sm text-destructive rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5">
                  {error}
                </p>
              )}
            </div>

            <div
              className="sticky bottom-0 flex gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-t border-white/10 bg-background/95 backdrop-blur-xl"
              style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
            >
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={handleClose}
                className="flex-1 h-12 rounded-2xl font-semibold border-white/15"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="flex-[1.2] h-12 rounded-2xl font-semibold shadow-lg shadow-primary/30"
              >
                {busy ? "Saving…" : "Add Lead"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
      {required && <span className="text-primary ml-0.5">*</span>}
    </Label>
  );
}

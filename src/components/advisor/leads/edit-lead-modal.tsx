"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SelectionCard } from "@/components/advisor/leads/selection-card";
import { isPlatformLead, LEAD_PRIORITIES, SELF_LEAD_SOURCES } from "@/lib/leads/config";
import {
  LEAD_SERVICE_TYPES,
  getLeadToneSelected,
  type LeadServiceType,
} from "@/lib/leads/service-types";
import type { Lead, LeadPriority, SelfLeadChannel } from "@/lib/leads/types";
import { phoneDigits } from "@/lib/leads/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatedModalShell } from "@/components/ui/animated-modal-shell";

type EditLeadModalProps = {
  lead: Lead | null;
  onClose: () => void;
  onSave: (patch: {
    fullName: string;
    mobile: string;
    city?: string;
    channel?: SelfLeadChannel;
    serviceType: LeadServiceType;
    priority: LeadPriority;
    notes: string;
  }) => Promise<void>;
};

export function EditLeadModal({ lead, onClose, onSave }: EditLeadModalProps) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [channel, setChannel] = useState<SelfLeadChannel>("self_manual");
  const [serviceType, setServiceType] = useState<LeadServiceType>("general");
  const [priority, setPriority] = useState<LeadPriority>("medium");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lead) return;
    setFullName(lead.fullName);
    setMobile(lead.mobile);
    setCity(lead.city ?? "");
    setChannel(lead.channel === "self_referral" ? "self_referral" : "self_manual");
    setServiceType(lead.serviceType);
    setPriority(lead.priority ?? "medium");
    setNotes(lead.notes);
    setError(null);
  }, [lead]);

  useEffect(() => {
    if (!lead) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lead, busy, onClose]);

  if (!lead) return null;

  const platform = isPlatformLead(lead.channel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      setError("Please enter full name.");
      return;
    }
    if (phoneDigits(mobile).length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        city: city.trim() || undefined,
        channel: platform ? undefined : channel,
        serviceType,
        priority,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatedModalShell
      className="z-[120]"
      onClose={onClose}
      closeDisabled={busy}
      panelClassName="flex flex-col w-full sm:max-w-xl glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl max-h-[92dvh] sm:max-h-[94vh]"
    >
        <div className="sm:hidden flex justify-center pt-2.5" aria-hidden>
          <span className="h-1.5 w-10 rounded-full bg-white/20" />
        </div>
        <div className="sticky top-0 flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/10 bg-background/90 backdrop-blur-xl rounded-t-3xl">
          <h2 className="text-base sm:text-lg font-bold">Edit Lead</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="size-10 rounded-full border border-white/12 inline-flex items-center justify-center hover:bg-white/5 active:scale-[0.97] transition"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 sm:py-5 space-y-4 sm:space-y-5">
            {platform && (
              <p className="text-xs text-muted-foreground rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                Public Profile lead — source is system-managed.
              </p>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name *
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl text-base"
                disabled={busy}
                autoComplete="name"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Mobile *
                </Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="h-12 rounded-xl text-base"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  City
                </Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12 rounded-xl text-base"
                  disabled={busy}
                  autoComplete="address-level2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Service Type *
              </Label>
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
            </div>
            {!platform && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lead Source
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {SELF_LEAD_SOURCES.map((o) => (
                    <SelectionCard
                      key={o.id}
                      label={o.label}
                      selected={channel === o.id}
                      disabled={busy}
                      onClick={() => setChannel(o.id)}
                      activeClassName="ring-2 ring-[oklch(0.82_0.13_205/0.4)] border-[oklch(0.82_0.13_205/0.55)] bg-[oklch(0.82_0.13_205/0.18)]"
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority
              </Label>
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
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                disabled={busy}
                className={cn(
                  "w-full rounded-xl border border-white/12 bg-white/[0.04]",
                  "px-3 py-3 text-base sm:text-sm leading-relaxed resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40",
                )}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div
            className="sticky bottom-0 flex gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-t border-white/10 bg-background/95 backdrop-blur-xl"
            style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
          >
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl font-semibold border-white/15"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="flex-[1.2] h-12 rounded-2xl font-semibold"
            >
              {busy ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
    </AnimatedModalShell>
  );
}

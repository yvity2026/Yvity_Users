"use client";

import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import { AddLeadModal } from "@/components/advisor/leads/add-lead-modal";
import { EditLeadModal } from "@/components/advisor/leads/edit-lead-modal";
import { LeadListCard } from "@/components/advisor/leads/lead-list-card";
import { LeadManageSheet } from "@/components/advisor/leads/lead-manage-sheet";
import { useLeads } from "@/hooks/use-leads";
import type { Lead } from "@/lib/leads/types";
import { computeOverviewStats, sortLeadsNewestFirst } from "@/lib/leads/utils";
import { Button } from "@/components/ui/button";

export function AdvisorLeadsModule() {
  const { leads, meta, loading, refreshing, error, createLead, patchLead, removeLead, reload } =
    useLeads();
  const [addOpen, setAddOpen] = useState(false);
  const [manageLead, setManageLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  const sorted = useMemo(() => sortLeadsNewestFirst(leads), [leads]);
  const stats = useMemo(() => computeOverviewStats(leads), [leads]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 rounded-xl bg-white/5 ml-auto max-w-[160px]" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-400">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Pipeline</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.total} leads · {stats.new} new · {stats.converted} converted
          </p>
        </div>
        <Button
          type="button"
          className="rounded-full gap-1.5 h-10 px-4 shadow-md shadow-primary/25 shrink-0"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add New Lead</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {meta.lockedCount > 0 && (
        <div className="rounded-2xl border border-[oklch(0.85_0.16_78/0.35)] bg-[oklch(0.85_0.16_78/0.08)] px-4 py-3">
          <p className="text-sm font-semibold">
            {meta.lockedCount} more lead{meta.lockedCount === 1 ? "" : "s"} hidden on your plan
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your plan shows the first {meta.limit} leads. Upgrade to Silver or Gold to view all{" "}
            {meta.total} leads.
          </p>
        </div>
      )}

      {refreshing && <p className="text-[10px] text-center text-muted-foreground">Syncing…</p>}

      {error && (
        <p className="text-sm text-destructive text-center">
          {error}{" "}
          <button type="button" className="underline" onClick={() => void reload(false)}>
            Retry
          </button>
        </p>
      )}

      {sorted.length === 0 ? (
        <div className="glass rounded-3xl border border-dashed border-white/15 p-12 text-center">
          <Users className="size-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold">No leads yet</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
            Add a lead manually or share your public profile — enquiries appear automatically.
          </p>
          <Button className="mt-6 rounded-full" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add New Lead
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5 md:gap-3 w-full">
          {sorted.map((lead, i) => (
            <li key={lead.id}>
              <LeadListCard
                lead={lead}
                index={i}
                onEdit={() => setEditLead(lead)}
                onManage={() => setManageLead(lead)}
              />
            </li>
          ))}
        </ul>
      )}

      <AddLeadModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (input) => {
          await createLead(input);
        }}
      />

      <EditLeadModal
        lead={editLead}
        onClose={() => setEditLead(null)}
        onSave={async (patch) => {
          if (!editLead) return;
          await patchLead(editLead.id, patch);
          setEditLead(null);
        }}
      />

      <LeadManageSheet
        lead={manageLead}
        onClose={() => setManageLead(null)}
        onSave={async (patch) => {
          if (!manageLead) return;
          await patchLead(manageLead.id, {
            ...patch,
            lastActivityAt: new Date().toISOString(),
          });
        }}
        onDelete={async () => {
          if (!manageLead) return;
          await removeLead(manageLead.id);
        }}
      />
    </div>
  );
}

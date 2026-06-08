"use client";

import { useMemo, useState } from "react";
import { Award, Plus } from "lucide-react";
import { SectionCompletionGuidance } from "@/components/advisor/guidance/section-completion-guidance";
import { AchievementDetailCard } from "@/components/sections/achievement-detail-card";
import { AchievementsBanner } from "@/components/sections/achievements-banner";
import { AchievementsEditorModal } from "@/components/sections/achievements-editor-modal";
import {
  AchievementsFilterBar,
  type AchievementFilter,
} from "@/components/sections/achievements-filter-bar";
import { AchievementsVerificationFooter } from "@/components/sections/achievements-verification-footer";
import { SectionAdvisorCta } from "@/components/sections/section-advisor-cta";
import { MobilePreviewExpand } from "@/components/shared/mobile-preview-expand";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionEmptyCard } from "@/components/ui/section-empty-card";
import { useAchievementsData } from "@/lib/sections/stores";
import type { AchievementItem } from "@/lib/sections/types";
import { uid } from "@/lib/section-store";
import { formatMdrtStatusLabel } from "@/lib/sections/achievement-tiers";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { cn } from "@/lib/utils";

function newAchievement(): AchievementItem {
  return {
    id: uid("ach"),
    title: "New Achievement",
    subtitle: "",
    description: "",
    category: "other",
    iconStyle: "trophy",
    achievedCount: 1,
    years: [String(new Date().getFullYear())],
  };
}

export function AchievementsShowcase({
  editable = false,
  embedded = false,
}: {
  editable?: boolean;
  embedded?: boolean;
}) {
  const [items, setItems, loading] = useAchievementsData();
  const advisorProfile = useAdvisorDisplayProfile();
  const [filter, setFilter] = useState<AchievementFilter>("all");
  const [editId, setEditId] = useState<string | null>(null);
  // Inline confirm-dialog (replaces window.confirm so the dismissal
  // is keyboard-accessible and styled with the rest of the modals).
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const draft = editId ? items.find((i) => i.id === editId) : null;
  const deleteTarget = deleteId ? items.find((i) => i.id === deleteId) : null;

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const saveItem = (item: AchievementItem) => {
    const exists = items.some((i) => i.id === item.id);
    setItems(exists ? items.map((i) => (i.id === item.id ? item : i)) : [...items, item]);
  };

  const requestDeleteItem = (id: string) => setDeleteId(id);

  const confirmDeleteItem = () => {
    if (!deleteId) return;
    setItems(items.filter((i) => i.id !== deleteId));
    if (editId === deleteId) setEditId(null);
    setDeleteId(null);
  };

  const addAchievement = () => {
    const item = newAchievement();
    setItems([...items, item]);
    setEditId(item.id);
  };

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-sm text-muted-foreground",
          embedded ? "min-h-[240px]" : "min-h-[40vh]",
        )}
      >
        Loading achievements…
      </div>
    );
  }

  return (
    <div className={cn("relative", embedded ? "" : "min-h-[calc(100vh-4rem)]")}>
      <div
        className={cn("mx-auto max-w-6xl px-4 md:px-6", embedded ? "py-2" : "pt-8 md:pt-12 pb-2")}
      >
        {editable ? <SectionCompletionGuidance healthId="achievements" icon={Award} /> : null}

        {embedded && editable && (
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
            Manage section · saves to public profile
          </p>
        )}

        {editable && (
          <div
            className={cn(
              // Sticky only on the standalone page (top-16 clears the
              // public-profile navbar). Inside the workspace the page
              // already has a sticky workspace header at top-0, so we
              // intentionally don't pin a second toolbar over it.
              !embedded && "sticky top-16 z-40",
              "mb-6 glass-strong rounded-2xl border border-white/10 p-2 flex items-center justify-between gap-3",
            )}
          >
            <p className="text-xs text-muted-foreground px-2">
              <span className="text-foreground font-semibold">{items.length}</span> achievements
            </p>
            <button
              type="button"
              onClick={addAchievement}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90"
            >
              <Plus className="size-4" /> Add achievement
            </button>
          </div>
        )}

        <AchievementsBanner
          totalAwards={items.length}
          mdrtLabel={formatMdrtStatusLabel(items)}
          experienceDisplay={advisorProfile.experienceDisplay}
          className="mb-8 sm:mb-10"
        />

        <AchievementsFilterBar active={filter} onChange={setFilter} items={items} />

        {items.length === 0 && editable ? (
          <SectionEmptyCard
            icon={Award}
            title="No achievements yet"
            description="Showcase MDRT, COT, club wins, or industry awards. Each entry becomes a card on your public profile."
            hint="Build credibility"
            action={
              <button
                type="button"
                onClick={addAchievement}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md shadow-primary/25"
              >
                <Plus className="size-4" /> Add achievement
              </button>
            }
            className="mb-8"
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No achievements published yet"
            description="Awards and milestones will appear here once the advisor adds them."
            className="mb-8"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No achievements in this category"
            description="Try another filter or add a new achievement."
            className="mb-8"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8 sm:mb-10">
            {editable ? (
              filtered.map((item, i) => (
                <AchievementDetailCard
                  key={item.id}
                  item={item}
                  index={i}
                  editable={editable}
                  onEdit={() => setEditId(item.id)}
                />
              ))
            ) : (
              <MobilePreviewExpand
                mobilePreview={3}
                totalLabel={(n) => `${n} achievements`}
                toggleClassName="mt-1"
              >
                {filtered.map((item, i) => (
                  <AchievementDetailCard key={item.id} item={item} index={i} />
                ))}
              </MobilePreviewExpand>
            )}
          </div>
        )}

        <AchievementsVerificationFooter className="mb-8 sm:mb-10" />

        {!embedded && <SectionAdvisorCta />}
      </div>

      {editable && draft && (
        <AchievementsEditorModal
          item={draft}
          onClose={() => setEditId(null)}
          onSave={saveItem}
          onDelete={requestDeleteItem}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next) setDeleteId(null);
        }}
        title="Delete achievement?"
        description={
          deleteTarget
            ? `\u201C${deleteTarget.title}\u201D will be removed from your public profile and cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDeleteItem}
      />
    </div>
  );
}

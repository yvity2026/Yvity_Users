"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquareQuote } from "lucide-react";
import { SectionCompletionGuidance } from "@/components/advisor/guidance/section-completion-guidance";
import { HeldContentUpgradeBanner } from "@/components/advisor/membership/held-content-upgrade-banner";
import { AdvisorReplyModal } from "@/components/testimonials/advisor-reply-modal";
import { SectionAdvisorCta } from "@/components/sections/section-advisor-cta";
import { useTestimonialSubmit } from "@/lib/testimonial-submit-store";
import { TestimonialDetailCard } from "@/components/sections/testimonial-detail-card";
import { TestimonialsBanner } from "@/components/sections/testimonials-banner";
import {
  TestimonialsFilters,
  type TestimonialServiceFilter,
  type TestimonialTypeFilter,
} from "@/components/sections/testimonials-filters";
import { MobilePreviewExpand } from "@/components/shared/mobile-preview-expand";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionEmptyCard } from "@/components/ui/section-empty-card";
import { useRegisteredTestimonialServices } from "@/hooks/use-registered-testimonial-services";
import { useIsAdvisorWorkspacePreview } from "@/hooks/use-is-viewing-own-advisor-profile";
import { useTestimonialVisibility } from "@/hooks/use-content-visibility";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useTestimonialsData } from "@/lib/sections/stores";
import type { TestimonialItem } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export function TestimonialsShowcase({
  editable = false,
  embedded = false,
}: {
  editable?: boolean;
  embedded?: boolean;
}) {
  const { settings } = useAdvisorSettings();
  const isWorkspacePreview = useIsAdvisorWorkspacePreview();
  // On the public profile page (editable=false, embedded=false), always show Give
  // Testimonial. `editable` is the reliable signal — isWorkspacePreview can return
  // true for logged-in advisors visiting their own public URL when publicView context
  // is not set on that route.
  const canAcceptPublicTestimonials = !embedded && (!editable || (settings.leads.testimonialRequests && !isWorkspacePreview));
  const [items, setItems, loading] = useTestimonialsData();
  const [optimisticItems, setOptimisticItems] = useState<TestimonialItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<TestimonialTypeFilter>("all");
  const [serviceFilter, setServiceFilter] = useState<TestimonialServiceFilter>("all");
  const [replyTarget, setReplyTarget] = useState<TestimonialItem | null>(null);
  const [replyMode, setReplyMode] = useState<"create" | "edit">("create");
  const [replyBusyId, setReplyBusyId] = useState<string | null>(null);
  const [pendingDeleteReply, setPendingDeleteReply] = useState<TestimonialItem | null>(null);
  const [pendingDeleteTestimonial, setPendingDeleteTestimonial] = useState<TestimonialItem | null>(null);
  const { openGiveTestimonial, openRequestTestimonial, registerOnPublished } =
    useTestimonialSubmit();
  const { filterOptions: serviceFilterOptions } = useRegisteredTestimonialServices();

  const displayItems = useMemo(() => {
    const ids = new Set(items.map((i) => i.id));
    const extra = optimisticItems.filter((i) => !ids.has(i.id));
    return [...extra, ...items];
  }, [items, optimisticItems]);

  const { visibilityFor, heldCount, heldByType, upgradePlan } = useTestimonialVisibility(displayItems);

  const patchItem = useCallback(
    (updated: TestimonialItem) => {
      if (items.some((i) => i.id === updated.id)) {
        setItems(items.map((i) => (i.id === updated.id ? updated : i)));
      }
      setOptimisticItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    },
    [items, setItems],
  );

  const handlePublished = useCallback((item: TestimonialItem) => {
    setOptimisticItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
    setTypeFilter("all");
  }, []);

  useEffect(() => {
    registerOnPublished(handlePublished);
  }, [registerOnPublished, handlePublished]);

  useEffect(() => {
    setOptimisticItems((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.filter((o) => !items.some((i) => i.id === o.id));
      return next.length === prev.length ? prev : next;
    });
  }, [items]);

  useEffect(() => {
    if (serviceFilter === "all") return;
    const allowed = serviceFilterOptions.some((opt) => opt.value === serviceFilter);
    if (!allowed) setServiceFilter("all");
  }, [serviceFilter, serviceFilterOptions]);

  const filtered = useMemo(() => {
    return displayItems.filter((item) => {
      const typeOk = typeFilter === "all" || item.type === typeFilter;
      const serviceOk = serviceFilter === "all" || item.service === serviceFilter;
      return typeOk && serviceOk;
    });
  }, [displayItems, typeFilter, serviceFilter]);

  const openReply = (item: TestimonialItem, mode: "create" | "edit") => {
    setReplyTarget(item);
    setReplyMode(mode);
  };

  const performServiceChange = async (item: TestimonialItem, service: TestimonialItem["service"]) => {
    patchItem({ ...item, service });
    try {
      const res = await fetch(`/api/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });
      const data = (await res.json()) as { data?: TestimonialItem };
      if (res.ok && data.data) patchItem(data.data);
      else patchItem(item); // revert on error
    } catch {
      patchItem(item);
    }
  };

  const performDeleteTestimonial = async (item: TestimonialItem) => {
    setItems(items.filter((i) => i.id !== item.id));
    setOptimisticItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await fetch(`/api/testimonials/${item.id}`, { method: "DELETE" });
    } catch {
      setItems((prev) => [item, ...prev]);
    }
  };

  const performDeleteReply = async (item: TestimonialItem) => {
    setReplyBusyId(item.id);
    const previous = item.advisorReply;
    patchItem({ ...item, advisorReply: undefined });
    try {
      const res = await fetch(`/api/testimonials/${item.id}/reply`, { method: "DELETE" });
      const data = (await res.json()) as { data?: TestimonialItem; error?: string };
      if (!res.ok) {
        patchItem({ ...item, advisorReply: previous });
        return;
      }
      if (data.data) patchItem(data.data);
    } catch {
      patchItem({ ...item, advisorReply: previous });
    } finally {
      setReplyBusyId(null);
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-sm text-muted-foreground",
          embedded ? "min-h-[240px]" : "min-h-[40vh]",
        )}
      >
        Loading testimonials…
      </div>
    );
  }

  return (
    <div className={cn("relative", embedded ? "" : "min-h-[calc(100vh-4rem)]")}>
      <div
        className={cn("mx-auto max-w-6xl px-4 md:px-6", embedded ? "py-2" : "pt-8 md:pt-12 pb-2")}
      >
        {editable ? (
          <SectionCompletionGuidance healthId="testimonials" icon={MessageSquareQuote} />
        ) : null}

        {editable ? (
          <HeldContentUpgradeBanner
            heldTestimonialCount={heldCount}
            heldByTestimonialType={heldByType}
            upgradePlan={upgradePlan}
            className="mb-4"
          />
        ) : null}

        {embedded && editable && (
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
            Manage section · testimonials are read-only · reply from each card
          </p>
        )}

        <TestimonialsBanner items={displayItems} className="mb-8 sm:mb-10" />

        {displayItems.length > 0 ? (
          <TestimonialsFilters
            typeFilter={typeFilter}
            serviceFilter={serviceFilter}
            onTypeChange={setTypeFilter}
            onServiceChange={setServiceFilter}
            items={displayItems}
            serviceOptions={serviceFilterOptions}
            showGiveTestimonial={canAcceptPublicTestimonials}
            showRequestTestimonial={embedded && editable && settings.leads.recommendationRequests}
            onGiveTestimonial={canAcceptPublicTestimonials ? openGiveTestimonial : undefined}
            onRequestTestimonial={openRequestTestimonial}
          />
        ) : null}

        {displayItems.length === 0 && editable ? (
          <SectionEmptyCard
            icon={MessageSquareQuote}
            title="No testimonials yet"
            description="Request a short review from a recent client — text, audio, or video. Two or more testimonials strengthen your YVITY Score."
            hint="Social proof"
            action={
              settings.leads.recommendationRequests ? (
                <button
                  type="button"
                  onClick={openRequestTestimonial}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Request a testimonial
                </button>
              ) : null
            }
            className="mb-8"
          />
        ) : displayItems.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No testimonials yet"
            description="Client reviews will appear here once they are shared on this profile."
            action={
              canAcceptPublicTestimonials ? (
                <button
                  type="button"
                  onClick={openGiveTestimonial}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-95 active:scale-[0.98] transition"
                >
                  Give Testimonial
                </button>
              ) : null
            }
            className="mb-8"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquareQuote}
            title="No testimonials match these filters"
            description="Try clearing the filters above, or invite a recent client to share their experience."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {editable ? (
              filtered.map((item, i) => (
                <TestimonialDetailCard
                  key={item.id}
                  item={item}
                  index={i}
                  manageReplies
                  publicVisibility={visibilityFor(item.id)}
                  onReply={() => openReply(item, "create")}
                  onEditReply={() => openReply(item, "edit")}
                  onDeleteReply={() => setPendingDeleteReply(item)}
                  onDelete={() => setPendingDeleteTestimonial(item)}
                  onUpgrade={upgradePlan ? () => { window.location.href = "/pricing"; } : undefined}
                  onServiceChange={(service) => void performServiceChange(item, service)}
                  replyBusy={replyBusyId === item.id}
                />
              ))
            ) : (
              <MobilePreviewExpand
                mobilePreview={2}
                totalLabel={(n) => `${n} testimonials`}
                toggleClassName="mt-1"
              >
                {filtered.map((item, i) => (
                  <TestimonialDetailCard key={item.id} item={item} index={i} />
                ))}
              </MobilePreviewExpand>
            )}
          </div>
        )}

        {!embedded && <SectionAdvisorCta className="mt-8 sm:mt-10" />}
      </div>

      {replyTarget && (
        <AdvisorReplyModal
          item={replyTarget}
          mode={replyMode}
          onClose={() => setReplyTarget(null)}
          onSaved={patchItem}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteReply)}
        onOpenChange={(next) => {
          if (!next) setPendingDeleteReply(null);
        }}
        title="Delete your reply?"
        description="Your response will be removed from the public profile and cannot be undone."
        confirmLabel="Delete reply"
        tone="destructive"
        onConfirm={async () => {
          if (!pendingDeleteReply) return;
          await performDeleteReply(pendingDeleteReply);
          setPendingDeleteReply(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteTestimonial)}
        onOpenChange={(next) => {
          if (!next) setPendingDeleteTestimonial(null);
        }}
        title="Delete this testimonial?"
        description="This will permanently remove the testimonial from your profile. This cannot be undone."
        confirmLabel="Delete testimonial"
        tone="destructive"
        onConfirm={async () => {
          if (!pendingDeleteTestimonial) return;
          await performDeleteTestimonial(pendingDeleteTestimonial);
          setPendingDeleteTestimonial(null);
        }}
      />
    </div>
  );
}

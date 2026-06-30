"use client";

import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import {
  SectionCompletionGuidance,
  ServicesReviewGuidance,
} from "@/components/advisor/guidance/section-completion-guidance";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceDetailCard } from "@/components/sections/service-detail-card";
import { ServicesBanner } from "@/components/sections/services-banner";
import { ServicesEditorModal } from "@/components/sections/services-editor-modal";
import { ServiceDashboardCard } from "@/components/sections/service-dashboard-card";
import { SectionAdvisorCta } from "@/components/sections/section-advisor-cta";
import { MobilePreviewExpand } from "@/components/shared/mobile-preview-expand";
import { SectionEmptyCard } from "@/components/ui/section-empty-card";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useAuth } from "@/context/AuthUserContext";
import { usePublicProfileView } from "@/context/public-profile-view-context";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { useServicesData } from "@/lib/sections/stores";
import type { ServiceItem } from "@/lib/sections/types";
import { categoryHeadingFor } from "@/lib/sections/services-config";
import { formatExperienceFromStart } from "@/lib/sections/service-experience";
import { defaultCardDisplayForCapacity } from "@/lib/advisor/service-card-display";
import type { ServiceCapacityId } from "@/lib/advisor/serviceCapacity";
import { uid } from "@/lib/section-store";
import { emptyVerification, isServiceVisibleOnPublicProfile } from "@/lib/verification/defaults";
import { cn } from "@/lib/utils";

function newService(): ServiceItem {
  const category: ServiceItem["category"] = "life";
  return {
    id: uid("svc"),
    category,
    title: categoryHeadingFor(category),
    provider: "",
    experience: "",
    roleLabel: "",
    serviceStartDate: undefined,
    clients: 0,
    claims: 0,
    sumInsured: "₹ 0",
    claimSettled: "₹ 0",
    claimRatio: 0,
    statusMessage: "",
    statusCaption: "",
    areas: [],
    verified: false,
    verification: emptyVerification(),
    capacityId: "individual_agent" as ServiceCapacityId,
    cardDisplay: defaultCardDisplayForCapacity("individual_agent"),
    showDetailCard: true,
  };
}

export function ServicesShowcase({
  editable = false,
  embedded = false,
  reviewReadOnly = false,
  highlightCategory,
}: {
  editable?: boolean;
  embedded?: boolean;
  /** Submitted services visible but not editable during admin review. */
  reviewReadOnly?: boolean;
  /** When set (from ?category= query param), auto-scrolls to the first matching service card. */
  highlightCategory?: ServiceItem["category"];
}) {
  const [items, setItems, loading] = useServicesData();
  const { settings } = useAdvisorSettings();
  const { advisor, user } = useAuth();
  const publicView = usePublicProfileView();
  const profileApproved = publicView
    ? isAdvisorProfileApproved(publicView.profile)
    : isAdvisorProfileApproved(advisor);
  const [editId, setEditId] = useState<string | null>(null);
  // Draft for a brand-new service. It is NOT added to `items` until the
  // advisor clicks Save in the editor, so closing the modal (X / backdrop /
  // Discard) leaves no orphan card behind in the dashboard.
  const [pendingNew, setPendingNew] = useState<ServiceItem | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const profileOwnerName = publicView?.name ?? user?.name ?? null;

  const draft = pendingNew ?? (editId ? items.find((i) => i.id === editId) : null);
  const isNewDraft = Boolean(pendingNew);
  const showDetailCards = embedded || settings.visibility.individualServices;
  const pendingDeleteTarget = pendingDeleteId ? items.find((i) => i.id === pendingDeleteId) : null;

  // On the public profile only verified services are visible (banner + detail
  // cards). In the editable dashboard, advisors see every saved service so
  // they can act on pending/rejected ones.
  const publicItems = editable
    ? items
    : items.filter((i) => isServiceVisibleOnPublicProfile(i, profileApproved));
  const bannerItems = publicItems;

  const detailItems = showDetailCards
    ? publicItems.filter((i) => i.showDetailCard !== false && i.category !== "mutual")
    : [];

  const dashboardItems = editable ? items : [];

  const closeEditor = () => {
    setEditId(null);
    setPendingNew(null);
  };

  const saveItem = (item: ServiceItem) => {
    const exists = items.some((i) => i.id === item.id);
    setItems(exists ? items.map((i) => (i.id === item.id ? item : i)) : [...items, item]);
    closeEditor();
  };

  const deleteItem = (id: string) => {
    // A new draft hasn't been persisted yet — just discard it.
    if (pendingNew?.id === id) {
      closeEditor();
      return;
    }
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    setItems(items.filter((i) => i.id !== pendingDeleteId));
    if (editId === pendingDeleteId) closeEditor();
    setPendingDeleteId(null);
  };

  const addService = () => {
    setPendingNew(newService());
  };

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-sm text-muted-foreground",
          embedded ? "min-h-[240px]" : "min-h-[40vh]",
        )}
      >
        Loading services…
      </div>
    );
  }

  if (reviewReadOnly) {
    return (
      <div className="space-y-4">
        <ServicesReviewGuidance />
        {items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Services pending sync"
            description="Your submitted services will appear here shortly."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {items.map((item, i) => (
              <ServiceDashboardCard
                key={item.id}
                item={item}
                index={i}
                onEdit={() => {}}
                onDelete={() => {}}
                readOnly
                profileApproved={profileApproved}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", embedded ? "" : "min-h-[calc(100vh-4rem)]")}>
      <div
        className={cn("mx-auto max-w-6xl px-4 md:px-6", embedded ? "py-2" : "pt-8 md:pt-12 pb-2")}
      >
        {editable ? <SectionCompletionGuidance healthId="services" icon={Briefcase} /> : null}

        {embedded && editable && (
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
            Manage section · saves to public profile
          </p>
        )}

        {editable && (
          <div
            className={cn(
              // Only pin in standalone mode; embedded mode already has a
              // sticky workspace header above it.
              !embedded && "sticky top-16 z-40",
              "mb-6 glass-strong rounded-2xl border border-white/10 p-2 flex items-center justify-between gap-3",
            )}
          >
            <p className="text-xs text-muted-foreground px-2">
              <span className="text-foreground font-semibold">{items.length}</span> services
            </p>
            <Button onClick={addService} size="sm" className="gap-1.5 rounded-xl">
              <Plus className="size-4" /> Add service
            </Button>
          </div>
        )}

        <ServicesBanner items={bannerItems} className="mb-8 sm:mb-10" />

        {editable ? (
          dashboardItems.length === 0 ? (
            <SectionEmptyCard
              icon={Briefcase}
              title="No services yet"
              description="Add your first insurance or financial service. Include company name, designation, and license so clients know what you offer."
              hint="Shows on your public profile"
              action={
                <Button onClick={addService} size="sm" className="gap-1.5 rounded-xl">
                  <Plus className="size-4" /> Add your first service
                </Button>
              }
              className="mb-8"
            />
          ) : (
            // IMPORTANT: `grid-cols-1` is required at the mobile breakpoint —
            // without it the grid falls back to `grid-auto-columns: auto`,
            // which sizes the single column to content instead of stretching
            // to the container width, leaving the card off-center on phones.
            <div className="grid grid-cols-1 gap-5 md:gap-6 md:grid-cols-2 items-start">
              {dashboardItems.map((item, i) => (
                <ServiceDashboardCard
                  key={item.id}
                  item={item}
                  index={i}
                  onEdit={() => setEditId(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  profileApproved={profileApproved}
                  profileOwnerName={profileOwnerName}
                />
              ))}
            </div>
          )
        ) : !showDetailCards ? (
          <EmptyState
            icon={Briefcase}
            title="Detailed service cards are hidden"
            description="Enable them in Settings \u2192 Profile visibility to show the full card layout."
          />
        ) : detailItems.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No insurance services to display yet"
            description={
              profileApproved
                ? "Add or complete your services in My Space — clients will see them here once saved."
                : "Verified services will appear here as soon as the advisor publishes them."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:gap-6 md:grid-cols-2">
            <MobilePreviewExpand
              mobilePreview={2}
              totalLabel={(n) => `${n} services`}
              toggleClassName="mt-1"
            >
              {detailItems.map((item, i) => (
                <div
                  key={item.id}
                  id={`service-${item.category}`}
                  className={highlightCategory === item.category ? "ring-2 ring-primary/40 rounded-3xl" : ""}
                >
                  <ServiceDetailCard
                    item={item}
                    editable={false}
                    index={i}
                    profileApproved={profileApproved}
                    profileOwnerName={profileOwnerName}
                  />
                </div>
              ))}
            </MobilePreviewExpand>
          </div>
        )}

        {!embedded && <SectionAdvisorCta className="mt-8 sm:mt-10" />}
      </div>

      {editable && draft && (
        <ServicesEditorModal
          item={draft}
          isNew={isNewDraft}
          onClose={closeEditor}
          onSave={saveItem}
          onDelete={deleteItem}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteTarget)}
        onOpenChange={(next) => {
          if (!next) setPendingDeleteId(null);
        }}
        title="Delete service?"
        description={
          pendingDeleteTarget
            ? `\u201C${pendingDeleteTarget.title}\u201D will be removed from your dashboard and public profile.`
            : ""
        }
        confirmLabel="Delete"
        tone="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

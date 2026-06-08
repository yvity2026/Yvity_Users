"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Expand, ImageIcon, Plus, Sparkles, X } from "lucide-react";
import { SectionCompletionGuidance } from "@/components/advisor/guidance/section-completion-guidance";
import { PlanLimitBanner } from "@/components/advisor/membership/plan-limit-banner";
import { planLimitUsage } from "@/lib/advisor-membership/plan-limit-usage";
import { nextUpgradePlan } from "@/lib/advisor-membership/plan-limits";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { galleryCategories } from "@/lib/gallery-defaults";
import type { GalleryCategory, GalleryItem, GalleryLayout } from "@/lib/gallery-types";
import { useGalleryData, uid } from "@/lib/gallery-store";
import { GalleryBanner } from "@/components/gallery/gallery-banner";
import { GalleryEditorLightbox } from "@/components/gallery/gallery-editor-lightbox";
import {
  formatGalleryCategory,
  GalleryCategoryBadge,
  GalleryItemMeta,
} from "@/components/gallery/gallery-item-meta";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionEmptyCard } from "@/components/ui/section-empty-card";
import { SectionAdvisorCta } from "@/components/sections/section-advisor-cta";
import { MobilePreviewExpand } from "@/components/shared/mobile-preview-expand";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categoryAccent: Record<GalleryCategory, string> = {
  milestones: "from-[oklch(0.82_0.13_205)] to-primary",
  events: "from-[oklch(0.72_0.17_295)] to-[oklch(0.55_0.13_260)]",
  team: "from-[oklch(0.82_0.16_162)] to-[oklch(0.65_0.13_185)]",
  awards: "from-[oklch(0.85_0.16_85)] to-[oklch(0.7_0.18_45)]",
  speaking: "from-[oklch(0.78_0.13_200)] to-accent",
};

function layoutClass(layout: GalleryLayout = "default") {
  switch (layout) {
    case "hero":
      return "md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[420px]";
    case "wide":
      return "md:col-span-2 min-h-[220px]";
    case "tall":
      return "md:row-span-2 min-h-[320px] md:min-h-[420px]";
    default:
      return "min-h-[220px]";
  }
}

function GalleryCard({
  item,
  index,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  onOpen: () => void;
}) {
  const accent = categoryAccent[item.category];
  const isLocalUpload = item.imageUrl.startsWith("/api/");

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl border border-white/10 text-left",
        "glass-strong shadow-xl shadow-black/20 transition-all duration-500",
        "hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        layoutClass(item.layout),
        "animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both",
      )}
      style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
    >
      <Image
        src={item.imageUrl}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        unoptimized={isLocalUpload}
      />
      <CardGlow accent={accent} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/25 to-transparent" />
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.06] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-white/25 text-white shadow-sm">
          {formatGalleryCategory(item.category)}
        </span>
        {item.category === "awards" && (
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full bg-gradient-to-br ring-1 ring-white/20",
              accent,
            )}
          >
            <Sparkles className="size-3.5 text-white" />
          </span>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/70 mb-1.5">
          {formatGalleryCategory(item.category)} · {item.date}
        </p>
        <h3 className="text-base md:text-lg font-semibold tracking-tight leading-snug line-clamp-2">
          {item.title}
        </h3>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground line-clamp-2 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-16 transition-all duration-500">
          {item.caption}
        </p>
      </div>
      <span className="absolute bottom-4 right-4 inline-flex size-9 items-center justify-center rounded-full glass border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Expand className="size-4" />
      </span>
    </button>
  );
}

function CardGlow({ accent }: { accent: string }) {
  return (
    <div
      className={cn(
        "absolute -top-16 -right-16 size-40 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40",
        accent,
      )}
    />
  );
}

function FeaturedSpotlight({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  const accent = categoryAccent[item.category];
  const isLocalUpload = item.imageUrl.startsWith("/api/");

  return (
    <section className="mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "group relative w-full overflow-hidden rounded-[2rem] border border-white/12 text-left",
          "glass-strong min-h-[340px] md:min-h-[420px] shadow-2xl shadow-black/30",
          "transition-all duration-500 hover:border-white/20 hover:shadow-primary/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          priority
          sizes="100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          unoptimized={isLocalUpload}
        />
        <div
          className={cn(
            "absolute -top-20 -right-20 size-56 rounded-full bg-gradient-to-br opacity-30 blur-3xl",
            accent,
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/55 to-transparent" />
        <FeaturedContent item={item} />
      </button>
    </section>
  );
}

function FeaturedContent({ item }: { item: GalleryItem }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-2xl">
      <span className="inline-flex w-fit items-center gap-2 rounded-full glass border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
        <Sparkles className="size-3.5 text-[oklch(0.82_0.16_162)]" /> Featured moment
      </span>
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">{item.title}</h2>
      <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
        {item.caption}
      </p>
      <GalleryItemMeta item={item} className="mt-4" />
      <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30 group-hover:bg-primary/90 transition">
        View full story <Expand className="size-3.5" />
      </span>
    </div>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onNext, onPrev]);

  if (!item) return null;

  const isLocalUpload = item.imageUrl.startsWith("/api/");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/90 backdrop-blur-xl"
        onClick={onClose}
        aria-label="Close gallery"
      />

      <div className="relative z-10 w-full max-w-5xl animate-in zoom-in-95 duration-300">
        <div className="glass-strong rounded-[2rem] border border-white/15 overflow-hidden shadow-2xl shadow-black/50">
          <div className="relative aspect-[16/10] md:aspect-[16/9] w-full bg-black/40">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={isLocalUpload}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30 pointer-events-none" />
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <GalleryCategoryBadge category={item.category} />
              <span className="inline-flex items-center rounded-full border border-white/25 bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                {index + 1} of {items.length}
              </span>
            </div>
          </div>
          <div className="p-5 md:p-7 border-t border-white/10 bg-[oklch(0.2_0.035_235/0.95)]">
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-foreground/75 leading-relaxed">{item.caption}</p>
            <GalleryItemMeta item={item} className="mt-4" />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 right-0 md:-right-2 md:-top-2 inline-flex size-10 items-center justify-center rounded-full glass border border-white/15 hover:bg-white/10 transition"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
        {index > 0 && (
          <button
            type="button"
            onClick={onPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-14 inline-flex size-11 items-center justify-center rounded-full glass border border-white/15 hover:bg-white/10 transition"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        {index < items.length - 1 && (
          <button
            type="button"
            onClick={onNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-14 inline-flex size-11 items-center justify-center rounded-full glass border border-white/15 hover:bg-white/10 transition"
            aria-label="Next image"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function CategoryFilterBar({
  active,
  onChange,
  count,
  editable,
  onAdd,
  addDisabled,
  embedded,
}: {
  active: GalleryCategory | "all";
  onChange: (c: GalleryCategory | "all") => void;
  count: number;
  editable?: boolean;
  onAdd?: () => void;
  addDisabled?: boolean;
  /** When `true` the bar does NOT pin — the workspace already has a
   *  sticky workspace header at top-0 and a second sticky strip would
   *  cover the breadcrumb. */
  embedded?: boolean;
}) {
  return (
    <div
      className={cn(
        !embedded && "sticky top-16 z-40",
        "mb-8 md:mb-10 -mx-1 px-1 py-3 animate-in fade-in slide-in-from-bottom-2 duration-500",
      )}
    >
      <div className="glass-strong rounded-2xl border border-white/10 p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 flex-1 min-w-0">
          {galleryCategories.map((cat) => {
            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange(cat.id)}
                className={cn(
                  "shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 shrink-0 px-2">
          <p className="text-xs text-muted-foreground hidden sm:block">
            <span className="text-foreground font-semibold">{count}</span>{" "}
            {count === 1 ? "moment" : "moments"}
          </p>
          {editable && onAdd && (
            <Button
              onClick={onAdd}
              size="sm"
              disabled={addDisabled}
              className="gap-1.5 rounded-xl shadow-md shadow-primary/30"
            >
              <Plus className="size-4" /> Add photo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function GalleryEmptyState() {
  return (
    <EmptyState
      icon={ImageIcon}
      title="No moments in this category yet"
      description="Try another filter to explore the collection."
    />
  );
}

export function GalleryShowcase({
  editable = false,
  embedded = false,
}: {
  editable?: boolean;
  embedded?: boolean;
}) {
  const [items, setItems, loading] = useGalleryData();
  const { planId, galleryCap, canAddGalleryItem } = usePlanLimits();
  const galleryUsage = useMemo(
    () => planLimitUsage(items.length, galleryCap),
    [items.length, galleryCap],
  );
  const galleryAtLimit = !canAddGalleryItem(items.length).ok;
  const [activeCategory, setActiveCategory] = useState<GalleryCategory | "all">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [activeCategory, items]);

  const featured = useMemo(() => items.find((item) => item.featured) ?? items[0], [items]);

  const gridItems = useMemo(() => {
    if (!featured) return filtered;
    if (activeCategory === "all") return filtered.filter((item) => item.id !== featured.id);
    return filtered;
  }, [activeCategory, featured, filtered]);

  const persistItems = useCallback(
    (next: GalleryItem[]) => {
      setItems(next);
    },
    [setItems],
  );

  const saveItem = useCallback(
    (updated: GalleryItem) => {
      let next = items.map((item) => (item.id === updated.id ? updated : item));
      if (updated.featured) {
        next = next.map((item) => ({ ...item, featured: item.id === updated.id }));
      }
      persistItems(next);
      setLightboxIndex(null);
    },
    [items, persistItems],
  );

  const deleteItem = useCallback(
    (id: string) => {
      persistItems(items.filter((item) => item.id !== id));
      setLightboxIndex(null);
    },
    [items, persistItems],
  );

  const addPhoto = useCallback(() => {
    const check = canAddGalleryItem(items.length);
    if (!check.ok) {
      toast.error(check.reason ?? "Gallery limit reached", {
        description: check.upgradePlan
          ? `Upgrade to ${check.upgradePlan === "gold" ? "Gold" : "Silver"} for more photos.`
          : undefined,
      });
      return;
    }

    const newItem: GalleryItem = {
      id: uid("gal"),
      title: "New moment",
      caption: "Describe this moment…",
      category: activeCategory === "all" ? "events" : activeCategory,
      date: new Date().getFullYear().toString(),
      location: "Hyderabad",
      imageUrl: "",
      layout: "default",
    };
    const next = [...items, newItem];
    persistItems(next);
    const idx = (
      activeCategory === "all" ? next : next.filter((i) => i.category === activeCategory)
    ).findIndex((i) => i.id === newItem.id);
    if (idx >= 0) setLightboxIndex(idx);
  }, [activeCategory, canAddGalleryItem, items, persistItems]);

  const openLightbox = useCallback(
    (id: string) => {
      const idx = filtered.findIndex((item) => item.id === id);
      if (idx >= 0) setLightboxIndex(idx);
    },
    [filtered],
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const goNext = useCallback(
    () => setLightboxIndex((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i)),
    [filtered.length],
  );

  // When embedded inside the advisor workspace, the parent `<main>` lives
  // in `AdvisorDashboard`, so this surface must be a `<section>` to keep
  // the document landmark tree valid. Standalone (`/gallery`) routes
  // still render as `<main>` so screen-reader users get the page landmark.
  // We render through a tiny helper rather than `keyof IntrinsicElements`
  // because the project's tsconfig doesn't expose the global `JSX`
  // namespace under the React 19 JSX transform.
  const renderOuter = (children: ReactNode, className: string, extra?: { busy?: boolean }) => {
    const props = {
      className,
      ...(extra?.busy ? { "aria-busy": true, "aria-live": "polite" as const } : {}),
    };
    return embedded ? <section {...props}>{children}</section> : <main {...props}>{children}</main>;
  };

  if (loading) {
    return renderOuter(
      <>Loading gallery&hellip;</>,
      cn(
        "flex items-center justify-center text-sm text-muted-foreground",
        embedded ? "min-h-[320px]" : "min-h-[calc(100vh-4rem)]",
      ),
      { busy: true },
    );
  }

  return renderOuter(
    <>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-[520px] rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute top-1/3 right-0 size-[420px] rounded-full bg-[oklch(0.72_0.17_295/0.2)] blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[400px] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div
        className={cn("mx-auto max-w-6xl px-4 md:px-6", embedded ? "py-2" : "pt-8 md:pt-14 pb-2")}
      >
        {editable ? <SectionCompletionGuidance healthId="gallery" icon={ImageIcon} /> : null}

        {editable ? (
          <PlanLimitBanner
            usage={galleryUsage}
            resourceLabel="gallery photos"
            upgradePlan={nextUpgradePlan(planId)}
            className="mb-4"
          />
        ) : null}

        <GalleryBanner items={items} className="mb-6 sm:mb-8" />
        {embedded && editable && (
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
            Manage gallery · saves to public profile
          </p>
        )}

        {featured && activeCategory === "all" && (
          <FeaturedSpotlight item={featured} onOpen={() => openLightbox(featured.id)} />
        )}

        <CategoryFilterBar
          active={activeCategory}
          onChange={setActiveCategory}
          count={filtered.length}
          editable={editable}
          onAdd={editable ? addPhoto : undefined}
          addDisabled={galleryAtLimit}
          embedded={embedded}
        />

        {items.length === 0 && editable ? (
          <SectionEmptyCard
            icon={ImageIcon}
            title="Your gallery is empty"
            description="Upload photos from events, awards, or team moments. Aim for at least three images to complete this section."
            hint="Visual story"
            action={
              <Button type="button" size="sm" className="rounded-xl" onClick={addPhoto}>
                Upload your first photo
              </Button>
            }
            className="mb-8"
          />
        ) : filtered.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(220px,auto)] gap-4 md:gap-5">
            {editable ? (
              gridItems.map((item, i) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  index={i}
                  onOpen={() => openLightbox(item.id)}
                />
              ))
            ) : (
              <MobilePreviewExpand
                mobilePreview={3}
                totalLabel={(n) => `${n} moments`}
                toggleClassName="mt-1"
              >
                {gridItems.map((item, i) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    index={i}
                    onOpen={() => openLightbox(item.id)}
                  />
                ))}
              </MobilePreviewExpand>
            )}
          </div>
        )}

        {!embedded && <SectionAdvisorCta className="mt-8 sm:mt-10" />}
      </div>

      {lightboxIndex !== null && editable && (
        <GalleryEditorLightbox
          items={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
          onSave={saveItem}
          onDelete={deleteItem}
        />
      )}
      {lightboxIndex !== null && !editable && (
        <Lightbox
          items={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>,
    cn("relative overflow-hidden", embedded ? "pb-4" : "min-h-[calc(100vh-4rem)]"),
  );
}

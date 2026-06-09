import { BadgeCheck, GraduationCap, MapPin, BookOpen } from "lucide-react";
import { SectionEmptyCard } from "@/components/ui/section-empty-card";
import type { Education } from "@/lib/career-types";
import {
  CareerItemActions,
  type CareerSectionEditable,
} from "@/components/career/career-item-actions";
import { cn } from "@/lib/utils";

const tones = [
  { text: "text-[oklch(0.85_0.16_78)]", ring: "ring-glow-amber", dot: "bg-[oklch(0.85_0.16_78)]" },
  {
    text: "text-[oklch(0.78_0.15_295)]",
    ring: "ring-glow-violet",
    dot: "bg-[oklch(0.78_0.15_295)]",
  },
  {
    text: "text-[oklch(0.82_0.16_162)]",
    ring: "ring-glow-emerald",
    dot: "bg-[oklch(0.82_0.16_162)]",
  },
  { text: "text-[oklch(0.82_0.13_205)]", ring: "ring-glow-cyan", dot: "bg-[oklch(0.82_0.13_205)]" },
];

export function EducationHeader({
  compact = false,
  showVerifiedBadge = false,
}: {
  compact?: boolean;
  showVerifiedBadge?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-3 text-left min-w-0",
        compact ? "flex-wrap" : "flex-wrap justify-between gap-4 w-full",
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="size-10 sm:size-12 rounded-2xl glass flex items-center justify-center ring-glow-violet shrink-0">
          <GraduationCap className="size-4 sm:size-5 text-[oklch(0.78_0.15_295)]" />
        </div>
        <div className="min-w-0">
          <h2
            className={cn(
              "font-bold tracking-tight",
              compact ? "text-base sm:text-lg" : "text-2xl sm:text-3xl md:text-5xl",
            )}
          >
            Education <span className="text-gradient-brand">Journey</span>
          </h2>
          <p
            className={cn(
              "text-xs text-muted-foreground mt-0.5",
              compact ? "line-clamp-2" : "text-sm",
            )}
          >
            My academic path that built the foundation for my career.
          </p>
        </div>
      </div>
      {showVerifiedBadge ? (
        <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold bg-[oklch(0.78_0.15_295/0.15)] text-[oklch(0.85_0.13_295)] border border-[oklch(0.78_0.15_295/0.4)] ring-glow-violet shrink-0">
          <BadgeCheck className="size-3.5" /> YVITY VERIFIED
        </span>
      ) : null}
    </div>
  );
}

export function EducationSection({
  items,
  embedded = false,
  editable,
}: {
  items: Education[];
  embedded?: boolean;
  editable?: CareerSectionEditable;
}) {
  const body = (
    <>
      {items.length === 0 ? (
        <SectionEmptyCard
          icon={GraduationCap}
          title="No education added yet"
          description="Add degrees and institutions so clients see your academic background."
          hint="Education journey"
          className="mb-6"
        />
      ) : null}
      <div className="relative">
      <div className="absolute left-[64px] sm:left-[80px] md:left-[110px] top-4 bottom-4 w-px bg-gradient-to-b from-[oklch(0.85_0.16_78/0.6)] via-[oklch(0.78_0.15_295/0.6)] to-[oklch(0.82_0.13_205/0.6)]" />
      <div className="space-y-6 sm:space-y-8">
        {items.length === 0 ? null : items.map((e, i) => {
          const t = tones[i % tones.length];
          const Icon = i === 2 ? BookOpen : GraduationCap;
          return (
            <div
              key={e.id}
              className={cn(
                "grid grid-cols-[56px_40px_1fr] sm:grid-cols-[80px_24px_1fr] md:grid-cols-[110px_24px_1fr] gap-x-3 items-center",
                "transition-all duration-500 ease-out motion-reduce:transition-none",
                "hover:-translate-y-0.5",
                "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none",
              )}
              style={{
                animationDelay: `${Math.min(i * 80, 320)}ms`,
                animationFillMode: "backwards",
              }}
            >
              <div className={cn("text-right text-lg sm:text-xl md:text-2xl font-bold", t.text)}>
                {e.year}
              </div>
              <div className="flex justify-center">
                <div
                  className={cn(
                    "size-10 sm:size-12 rounded-full glass flex items-center justify-center",
                    t.ring,
                  )}
                >
                  <Icon className={cn("size-4 sm:size-5", t.text)} />
                </div>
              </div>
              <div className="pl-1 sm:pl-2 min-w-0">
                {editable && (
                  <div className="flex justify-end mb-1">
                    <CareerItemActions
                      onEdit={() => editable.onEdit(e.id)}
                      onDelete={() => editable.onDelete(e.id)}
                    />
                  </div>
                )}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold leading-tight">
                    {e.degree}
                  </h3>
                  {e.specialization && (
                    <>
                      <span className={cn("opacity-60 hidden sm:inline", t.text)}>—</span>
                      <span className={cn("text-sm sm:text-lg md:text-xl font-semibold", t.text)}>
                        {e.specialization}
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-1 inline-flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="size-3.5 sm:size-4 mt-0.5 shrink-0" />{" "}
                  <span className="break-words">
                    {e.institution}, {e.location}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );

  if (embedded) {
    return <div className="pt-2">{body}</div>;
  }

  return (
    <section className="glass-strong rounded-3xl p-6 md:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl glass flex items-center justify-center ring-glow-violet">
            <GraduationCap className="size-6 text-[oklch(0.78_0.15_295)]" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">
              Education <span className="text-gradient-brand">Journey</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              My academic path that built the foundation for my career.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold bg-[oklch(0.78_0.15_295/0.15)] text-[oklch(0.85_0.13_295)] border border-[oklch(0.78_0.15_295/0.4)] ring-glow-violet">
          <BadgeCheck className="size-4" /> YVITY VERIFIED
        </span>
      </header>
      {body}
    </section>
  );
}

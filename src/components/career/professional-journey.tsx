import {
  BadgeCheck,
  Briefcase,
  Calendar,
  MapPin,
  GraduationCap,
  TrendingUp,
  Shield,
  User,
} from "lucide-react";
import type { Experience } from "@/lib/career-types";
import { durationLabel, formatRange, yearRangeLabel } from "@/lib/duration";
import { VERIFIED_BY_YVITY_LABEL } from "@/lib/verification/copy";
import {
  CareerItemActions,
  type CareerSectionEditable,
} from "@/components/career/career-item-actions";
import { isYvityVerified } from "@/lib/verification/defaults";
import { SectionEmptyCard } from "@/components/ui/section-empty-card";
import { cn } from "@/lib/utils";

const palettes = [
  {
    ring: "ring-glow-cyan",
    text: "text-[oklch(0.82_0.13_205)]",
    border: "border-[oklch(0.82_0.13_205/0.35)]",
    chip: "bg-[oklch(0.82_0.13_205/0.12)] text-[oklch(0.82_0.13_205)]",
  },
  {
    ring: "ring-glow-violet",
    text: "text-[oklch(0.78_0.15_295)]",
    border: "border-[oklch(0.78_0.15_295/0.35)]",
    chip: "bg-[oklch(0.78_0.15_295/0.12)] text-[oklch(0.82_0.14_295)]",
  },
  {
    ring: "ring-glow-emerald",
    text: "text-[oklch(0.82_0.16_162)]",
    border: "border-[oklch(0.82_0.16_162/0.35)]",
    chip: "bg-[oklch(0.82_0.16_162/0.12)] text-[oklch(0.82_0.16_162)]",
  },
  {
    ring: "ring-glow-amber",
    text: "text-[oklch(0.85_0.16_78)]",
    border: "border-[oklch(0.85_0.16_78/0.35)]",
    chip: "bg-[oklch(0.85_0.16_78/0.12)] text-[oklch(0.85_0.16_78)]",
  },
];

function pickIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("edu")) return GraduationCap;
  if (c.includes("bus")) return TrendingUp;
  if (c.includes("ins")) return Shield;
  return User;
}

function VerifiedBadge({ tone = "emerald" }: { tone?: "emerald" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase",
        "bg-[oklch(0.82_0.16_162/0.12)] text-[oklch(0.82_0.16_162)] border border-[oklch(0.82_0.16_162/0.4)]",
      )}
    >
      <BadgeCheck className="size-3.5" /> {VERIFIED_BY_YVITY_LABEL}
    </span>
  );
}


function JourneyVerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider bg-[oklch(0.82_0.13_205/0.15)] text-[oklch(0.85_0.13_205)] border border-[oklch(0.82_0.13_205/0.4)] ring-glow-cyan shrink-0">
      <BadgeCheck className="size-3.5" /> {VERIFIED_BY_YVITY_LABEL}
    </span>
  );
}

export function ProfessionalJourneyHeader({
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
        compact ? "flex-wrap justify-between gap-2" : "flex-wrap justify-between gap-4 w-full",
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="size-10 sm:size-12 rounded-2xl glass flex items-center justify-center ring-glow-cyan shrink-0">
          <Briefcase className="size-4 sm:size-5 text-[oklch(0.82_0.13_205)]" />
        </div>
        <div className="min-w-0">
          <h2
            className={cn(
              "font-bold tracking-tight",
              compact ? "text-base sm:text-lg" : "text-2xl sm:text-3xl md:text-5xl",
            )}
          >
            Professional <span className="text-gradient-brand">Journey</span>
          </h2>
          <p
            className={cn(
              "text-xs text-muted-foreground mt-0.5",
              compact ? "line-clamp-2" : "sm:text-sm",
            )}
          >
            My work experience across different roles and domains.
          </p>
        </div>
      </div>
      {showVerifiedBadge ? <JourneyVerifiedBadge /> : null}
    </div>
  );
}

export function ProfessionalJourneySection({
  experiences,
  embedded = false,
  editable,
  showVerifiedBadge = false,
}: {
  experiences: Experience[];
  embedded?: boolean;
  editable?: CareerSectionEditable;
  showVerifiedBadge?: boolean;
}) {
  const body = (
    <>
      {experiences.length === 0 ? (
        <SectionEmptyCard
          icon={Briefcase}
          title="No work experience yet"
          description="Add roles with dates and highlights so clients see your professional path."
          hint="Career journey"
          className="mb-6"
        />
      ) : null}
      <div className="relative">
        {/* vertical spine — only when there are entries, hidden on mobile */}
        {experiences.length > 0 && (
          <div className="hidden sm:block absolute left-[88px] md:left-[140px] top-2 bottom-2 w-px bg-gradient-to-b from-[oklch(0.82_0.13_205/0.5)] via-[oklch(0.78_0.15_295/0.5)] to-[oklch(0.82_0.16_78/0.5)]" />
        )}

        <div className="space-y-6">
          {experiences.length === 0 ? null : experiences.map((exp, i) => {
            const p = palettes[i % palettes.length];
            const Icon = pickIcon(exp.category);
            return (
              <div
                key={exp.id}
                className="grid grid-cols-1 sm:grid-cols-[88px_24px_1fr] md:grid-cols-[140px_24px_1fr] gap-x-3 gap-y-2 items-start animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{
                  animationDelay: `${Math.min(i * 80, 320)}ms`,
                  animationFillMode: "backwards",
                }}
              >
                {/* Year + duration: row above card on mobile, left column on sm+ */}
                <div className="flex items-baseline gap-3 sm:block sm:text-right sm:pt-5">
                  <div className={cn("font-semibold text-sm md:text-base", p.text)}>
                    {yearRangeLabel(exp.start, exp.end)}
                  </div>
                  <div className="text-[11px] md:text-xs text-muted-foreground sm:mt-0.5">
                    {durationLabel(exp.start, exp.end)}
                  </div>
                </div>
                <div className="hidden sm:flex justify-center pt-6">
                  <div
                    className={cn("size-3.5 rounded-full bg-background border-2", p.border, p.ring)}
                  />
                </div>
                <article
                  className={cn(
                    "glass rounded-2xl p-4 sm:p-5 md:p-6 border",
                    "transition-all duration-500 ease-out motion-reduce:transition-none",
                    "hover:border-white/25 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5",
                    p.border,
                  )}
                >
                  <div className="flex flex-wrap items-start gap-3 sm:gap-4">
                    <div
                      className={cn(
                        "size-11 sm:size-12 md:size-14 rounded-2xl glass flex items-center justify-center shrink-0",
                        p.ring,
                      )}
                    >
                      <Icon className={cn("size-5 sm:size-6", p.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editable && (
                        <div className="flex justify-end mb-1 -mt-1">
                          <CareerItemActions
                            onEdit={() => editable.onEdit(exp.id)}
                            onDelete={() => editable.onDelete(exp.id)}
                          />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight">
                          {exp.role}
                        </h3>
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-medium",
                            p.chip,
                          )}
                        >
                          {exp.category}
                        </span>
                        {/* Verification badges. Public profile shows the
                            "Verified by YVITY" badge only when an admin has
                            approved. Dashboard (editable) additionally shows
                            "Under review" while documents are pending. */}
                        {isYvityVerified(exp.verification) ? (
                          <VerifiedBadge />
                        ) : null}
                      </div>
                      <div className="mt-1 font-medium text-sm sm:text-base break-words">
                        {exp.company}
                      </div>
                      <div
                        className={cn(
                          "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] sm:text-xs",
                          p.text,
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3.5" /> {formatRange(exp.start, exp.end)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="size-3.5" /> {exp.location}
                        </span>
                      </div>

                      {exp.bullets.length > 0 && (
                        <ul className="mt-4 space-y-2 border-t border-dashed border-white/10 pt-4">
                          {exp.bullets.map((b, k) => (
                            <li
                              key={k}
                              className="flex gap-2 text-[13px] sm:text-sm text-foreground/85"
                            >
                              <span
                                className={cn("mt-1.5 size-1.5 rounded-full shrink-0", p.text)}
                                style={{ background: "currentColor" }}
                              />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {exp.subRoles && exp.subRoles.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-dashed border-white/10">
                          <div className="relative pt-3">
                            <div
                              className={cn(
                                "absolute left-0 right-0 top-4 h-px",
                                "bg-gradient-to-r from-transparent via-[oklch(0.82_0.16_162/0.5)] to-transparent",
                              )}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              {exp.subRoles.map((sr) => (
                                <div key={sr.id} className="relative">
                                  <div className="absolute -top-[3px] left-2 size-2 rounded-full bg-[oklch(0.82_0.16_162)] ring-glow-emerald" />
                                  <div className="pt-5">
                                    <div className="text-sm font-semibold text-[oklch(0.82_0.16_162)]">
                                      {sr.title}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mb-2">
                                      {formatRange(sr.start, sr.end)}
                                    </div>
                                    <ul className="space-y-1.5">
                                      {sr.bullets.map((b, j) => (
                                        <li
                                          key={j}
                                          className="text-[11.5px] text-foreground/80 flex gap-1.5"
                                        >
                                          <span className="mt-1 size-1 rounded-full bg-[oklch(0.82_0.16_162)] shrink-0" />
                                          <span>{b}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {showVerifiedBadge ? (
        <p className="text-center text-xs text-muted-foreground mt-8">
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck className="size-3.5" /> Verified by YVITY for authenticity and credibility.
          </span>
        </p>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className="pt-2">{body}</div>;
  }

  return (
    <section className="glass-strong rounded-3xl p-6 md:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="size-12 sm:size-14 rounded-2xl glass flex items-center justify-center ring-glow-cyan shrink-0">
            <Briefcase className="size-5 sm:size-6 text-[oklch(0.82_0.13_205)]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">
              Professional <span className="text-gradient-brand">Journey</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              My work experience across different roles and domains.
            </p>
          </div>
        </div>
        {showVerifiedBadge ? <JourneyVerifiedBadge /> : null}
      </header>
      {body}
    </section>
  );
}

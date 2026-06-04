import { BadgeCheck, Award, Calendar, Building2, Clock, Eye, Upload } from "lucide-react";
import { SectionEmptyCard } from "@/components/ui/section-empty-card";
import type { Certification } from "@/lib/career-types";
import {
  CareerItemActions,
  type CareerSectionEditable,
} from "@/components/career/career-item-actions";
import { isYvityVerified } from "@/lib/verification/defaults";
import { cn } from "@/lib/utils";

export function CertificationsHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-3 text-left min-w-0",
        compact ? "" : "flex-col text-center w-full",
      )}
    >
      <div className="size-10 sm:size-12 rounded-2xl glass flex items-center justify-center ring-glow-emerald shrink-0">
        <Award className="size-4 sm:size-5 text-[oklch(0.82_0.16_162)]" />
      </div>
      <div className="min-w-0 flex-1">
        <h2
          className={cn(
            "font-bold tracking-tight",
            compact ? "text-base sm:text-lg" : "text-2xl sm:text-3xl md:text-5xl",
          )}
        >
          Certification <span className="text-gradient-brand">Showcase</span>
        </h2>
        <p
          className={cn(
            "text-xs text-muted-foreground mt-0.5",
            compact ? "line-clamp-2" : "mt-2 text-sm",
          )}
        >
          Industry credentials and verified achievements.
        </p>
      </div>
    </div>
  );
}

export function CertificationsSection({
  items,
  embedded = false,
  editable,
}: {
  items: Certification[];
  embedded?: boolean;
  editable?: CareerSectionEditable;
}) {
  const body = (
    <>
      {items.length === 0 ? (
        <SectionEmptyCard
          icon={Award}
          title="No certifications yet"
          description="Add IRDAI, MDRT, or other credentials. Verified badges appear after YVITY review."
          hint="Credentials"
          className="mb-6"
        />
      ) : null}
      <div className="grid gap-6">
      {items.length === 0 ? null : items.map((c, i) => {
        // Verified iff the YVITY verification record is approved. Falls back
        // to the legacy `status` field so older seeded data keeps its badge.
        const verified =
          isYvityVerified(c.verification) || (!c.verification && c.status === "verified");
        const underReview = c.verification?.status === "pending" && !verified;
        const tone = verified
          ? {
              text: "text-[oklch(0.82_0.16_162)]",
              border: "border-[oklch(0.82_0.16_162/0.35)]",
              ring: "ring-glow-emerald",
            }
          : {
              text: "text-[oklch(0.85_0.16_78)]",
              border: "border-[oklch(0.85_0.16_78/0.35)]",
              ring: "ring-glow-amber",
            };

        return (
          <article
            key={c.id}
            className={cn(
              "glass rounded-2xl p-4 sm:p-5 md:p-7 border grid md:grid-cols-[1fr_280px] gap-5 sm:gap-6",
              "transition-all duration-500 ease-out motion-reduce:transition-none",
              "hover:border-white/25 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5",
              "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none",
              tone.border,
            )}
            style={{ animationDelay: `${Math.min(i * 80, 320)}ms` }}
          >
            <div className="flex gap-5">
              <div
                className={cn(
                  "size-16 rounded-2xl glass flex items-center justify-center shrink-0",
                  tone.ring,
                )}
              >
                <Award className={cn("size-7", tone.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl md:text-2xl font-bold leading-tight">{c.name}</h3>
                  {editable && (
                    <CareerItemActions
                      onEdit={() => editable.onEdit(c.id)}
                      onDelete={() => editable.onDelete(c.id)}
                    />
                  )}
                </div>
                <div
                  className={cn(
                    "mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm",
                    tone.text,
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="size-4" /> {c.year || "—"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="size-4" /> {c.issuer}
                  </span>
                </div>
                <div className={cn("h-px my-4 border-t border-dashed", tone.border)} />
                <ul className="space-y-2">
                  {c.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-foreground/85">
                      <span
                        className={cn("mt-1.5 size-1.5 rounded-full shrink-0", tone.text)}
                        style={{ background: "currentColor" }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {verified ? (
                <div className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-[oklch(0.82_0.16_162/0.18)] text-[oklch(0.82_0.16_162)] border border-[oklch(0.82_0.16_162/0.4)]">
                  <BadgeCheck className="size-4" /> VERIFIED BY YVITY
                </div>
              ) : underReview ? (
                <div className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[oklch(0.85_0.16_78/0.18)] text-[oklch(0.85_0.16_78)] border border-[oklch(0.85_0.16_78/0.4)]">
                  <Clock className="size-4" /> UNDER REVIEW
                </div>
              ) : null}

              <div>
                <div className={cn("text-xs font-semibold uppercase tracking-wider", tone.text)}>
                  Certificate ID
                </div>
                {c.certificateId ? (
                  <div className="mt-1 font-mono text-sm">{c.certificateId}</div>
                ) : (
                  <div className="mt-2 rounded-xl border border-dashed border-white/15 p-5 text-center text-xs text-muted-foreground">
                    <Upload className="size-5 mx-auto mb-2 opacity-60" />
                    <div className="font-semibold text-foreground/80">Upload Certificate</div>
                    <div>JPG, PNG, PDF (Max 2MB)</div>
                  </div>
                )}
              </div>

              {verified && (
                <button
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border",
                    tone.border,
                    tone.text,
                    "hover:bg-white/5 transition",
                  )}
                >
                  <Eye className="size-4" /> View Certificate
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
    </>
  );

  if (embedded) {
    return <div className="pt-2">{body}</div>;
  }

  return (
    <section className="glass-strong rounded-3xl p-6 md:p-10">
      <header className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Certification <span className="text-gradient-brand">Showcase</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Industry credentials and verified achievements.
        </p>
      </header>
      {body}
    </section>
  );
}

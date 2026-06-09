"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Briefcase, Clock } from "lucide-react";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useCareerData } from "@/lib/career-store";
import { resolveCareerExperienceDisplay } from "@/lib/advisor/profession-experience";
import { cn } from "@/lib/utils";

function formatRolePeriod(start: string, end: string): string {
  const startLabel = start?.trim() || "";
  const endLabel = end?.trim() ? end.trim() : "Present";
  if (!startLabel) return endLabel;
  return `${startLabel} – ${endLabel}`;
}

export function HomeCareerTeaserSection() {
  const display = useAdvisorDisplayProfile();
  const { settings } = useAdvisorSettings();
  const [career, , loading] = useCareerData();

  const showCareer =
    settings.visibility.careerJourney || settings.visibility.educationalJourney;

  const journeyExperience = useMemo(
    () => resolveCareerExperienceDisplay(career),
    [career],
  );

  const latestRole = useMemo(() => {
    if (!settings.visibility.careerJourney) return null;
    const experiences = career.experiences ?? [];
    if (experiences.length === 0) return null;
    const sorted = [...experiences].sort((a, b) => b.start.localeCompare(a.start));
    const role = sorted[0];
    return {
      title: role.role,
      company: role.company,
      period: formatRolePeriod(role.start, role.end),
    };
  }, [career.experiences, settings.visibility.careerJourney]);

  const latestEducation = useMemo(() => {
    if (!settings.visibility.educationalJourney) return null;
    const education = career.education ?? [];
    if (education.length === 0) return null;
    const sorted = [...education].sort((a, b) => b.year.localeCompare(a.year));
    const item = sorted[0];
    return {
      degree: item.degree,
      institution: item.institution,
      year: item.year,
    };
  }, [career.education, settings.visibility.educationalJourney]);

  if (!showCareer) return null;
  if (loading) return null;
  if (!latestRole && !latestEducation && !journeyExperience) return null;

  return (
    <section className="w-full" aria-labelledby="career-teaser-heading">
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {display.journeyLabel}
      </p>
      <h2
        id="career-teaser-heading"
        className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.08]"
      >
        <span className="text-gradient-brand">{display.journeyHeadline}</span>
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
        {display.journeyDescription}
      </p>

      <article
        className={cn(
          "mt-5 sm:mt-6 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10",
          "glass-strong p-5 sm:p-6",
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-3">
            {journeyExperience ? (
              <p className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[11px] sm:text-xs text-muted-foreground">
                <Clock className="size-3.5 text-[oklch(0.82_0.13_205)]" />
                {journeyExperience} professional experience
              </p>
            ) : null}

            {latestRole ? (
              <div className="flex gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 ring-1 ring-white/10">
                  <Briefcase className="size-4.5 text-[oklch(0.82_0.13_205)]" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{latestRole.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {latestRole.company}
                    {latestRole.period ? ` · ${latestRole.period}` : ""}
                  </p>
                </div>
              </div>
            ) : null}

            {latestEducation ? (
              <div className="min-w-0 pl-[3.25rem] sm:pl-0">
                <p className="text-sm font-semibold text-foreground">{latestEducation.degree}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {latestEducation.institution}
                  {latestEducation.year ? ` · ${latestEducation.year}` : ""}
                </p>
              </div>
            ) : null}
          </div>

          <Link
            href="/my-career"
            className={cn(
              "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5",
              "text-sm font-semibold border border-white/15 bg-white/[0.04]",
              "hover:bg-white/[0.08] transition active:scale-[0.98]",
            )}
          >
            View full journey
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>
    </section>
  );
}

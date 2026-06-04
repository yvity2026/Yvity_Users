"use client";

import {
  ArrowUpRight,
  Award,
  Eye,
  Lightbulb,
  MessageSquare,
  Search,
  Share2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import {
  DashboardLinkButton,
  DashboardSection,
  DashboardStatCard,
  ProgressRing,
} from "@/components/advisor/dashboard/dashboard-ui";
import { useAdvisorInsightsModel } from "@/hooks/use-advisor-insights-model";
import type { AdvisorProfileSection, AdvisorTopSection } from "@/lib/advisor-nav";
import type {
  CredibilitySuggestion,
  LeadSourceInsight,
  ServicePerformanceRow,
} from "@/lib/advisor-insights/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AdvisorInsightsModuleProps = {
  onNavigateTop?: (section: AdvisorTopSection) => void;
  onNavigateProfile?: (section: AdvisorProfileSection) => void;
};

const strengthColors = {
  Starter: "text-muted-foreground",
  Growing: "text-[oklch(0.82_0.13_205)]",
  Strong: "text-[oklch(0.82_0.16_162)]",
  Elite: "text-[oklch(0.85_0.16_78)]",
} as const;

export function AdvisorInsightsModule({
  onNavigateTop,
  onNavigateProfile,
}: AdvisorInsightsModuleProps) {
  const { model, loading } = useAdvisorInsightsModel();

  if (loading || !model) {
    return (
      <div
        className="space-y-4 animate-pulse"
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading insights"
      >
        <div className="h-24 rounded-3xl bg-white/5" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const { profilePerformance: pp, leadInsights: li, credibility: cred } = model;

  const runSuggestion = (s: CredibilitySuggestion) => {
    if (s.profileSection && onNavigateProfile) {
      onNavigateTop?.("profile");
      onNavigateProfile(s.profileSection);
      return;
    }
    onNavigateTop?.("profile");
  };

  return (
    <div className="space-y-3 md:space-y-10 pb-6 animate-in fade-in duration-400">
      <section
        aria-labelledby="insights-section-title"
        className="glass-strong rounded-3xl border border-white/12 p-5 md:p-6"
      >
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Insights snapshot
        </p>
        <h2
          id="insights-section-title"
          className="text-xl md:text-2xl font-bold tracking-tight mt-1"
        >
          Growth &amp; credibility snapshot
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Simple, actionable metrics to improve your public profile, convert more leads, and
          strengthen your YVITY presence.
        </p>
      </section>

      <DashboardSection
        title="Profile Performance"
        subtitle="How visitors discover and engage with your public profile"
        defaultOpen
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <DashboardStatCard
            label="Total Profile Views"
            value={pp.totalProfileViews.toLocaleString("en-IN")}
            icon={Eye}
            accent="cyan"
          />
          <DashboardStatCard
            label="This Month Views"
            value={pp.monthProfileViews.toLocaleString("en-IN")}
            delta={pp.monthViewsDelta}
            icon={TrendingUp}
            accent="emerald"
          />
          <DashboardStatCard
            label="Search Appearances"
            value={pp.searchAppearances.toLocaleString("en-IN")}
            delta={pp.searchDelta}
            icon={Search}
            accent="violet"
          />
          <DashboardStatCard
            label="Profile Shares"
            value={pp.profileShares.toLocaleString("en-IN")}
            delta={pp.sharesDelta}
            icon={Share2}
            accent="amber"
          />
          <DashboardStatCard
            label="Contact Requests"
            value={pp.contactRequests.toLocaleString("en-IN")}
            delta={pp.contactDelta}
            icon={MessageSquare}
            accent="rose"
            className="col-span-2 md:col-span-1"
          />
        </div>
      </DashboardSection>

      <DashboardSection
        title="Lead Insights"
        subtitle="Pipeline health and where your leads come from"
        action={
          onNavigateTop ? (
            <DashboardLinkButton onClick={() => onNavigateTop("leads")}>
              Open leads
            </DashboardLinkButton>
          ) : null
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <DashboardStatCard label="Total Leads" value={li.totalLeads} icon={Users} accent="cyan" />
          <DashboardStatCard label="New Leads" value={li.newLeads} icon={UserPlus} accent="amber" />
          <DashboardStatCard
            label="Converted"
            value={li.convertedLeads}
            icon={Target}
            accent="emerald"
          />
          <DashboardStatCard
            label="Conversion Rate"
            value={`${li.conversionRate}%`}
            icon={TrendingUp}
            accent="violet"
          />
        </div>
        <div className="glass-strong rounded-2xl border border-white/10 p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Leads by source
          </p>
          <div className="space-y-3">
            {li.bySource.map((row) => (
              <SourceRow key={row.id} row={row} total={li.totalLeads} />
            ))}
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Service Performance"
        subtitle="Interest and leads by service area (profile engagement + your pipeline)"
      >
        <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/10">
          <div className="hidden sm:grid sm:grid-cols-[1fr_5rem_5rem] gap-3 px-4 md:px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-white/[0.02]">
            <span>Service</span>
            <span className="text-right">Views</span>
            <span className="text-right">Leads</span>
          </div>
          {model.servicePerformance.map((row) => (
            <ServiceRow key={row.id} row={row} />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection
        title="Credibility Insights"
        subtitle="Your YVITY score and practical steps to grow trust"
      >
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
          <div className="glass-strong rounded-2xl border border-white/10 p-5 md:p-6 flex flex-col items-center gap-5 text-center">
            <div className="relative flex items-center justify-center">
              <ProgressRing percent={cred.yvityScore} size="xl" />
              <span className="absolute text-2xl font-bold tabular-nums">{cred.yvityScore}</span>
            </div>
            <div className="text-center flex-1 w-full">
              <p className="text-sm font-semibold">YVITY Score</p>
              <p className="text-xs text-[oklch(0.82_0.16_162)] font-medium mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="size-3.5" />
                {cred.scoreTrend}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">Profile strength</p>
              <p className={cn("text-sm font-bold", strengthColors[cred.profileStrength])}>
                {cred.profileStrength}
              </p>
              <div className="mt-4 flex flex-col items-center justify-center gap-2">
                <ProgressRing percent={cred.completionPercent} size="sm" />
                <div>
                  <p className="text-lg font-bold tabular-nums">{cred.completionPercent}%</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Profile complete
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5">
              <Lightbulb className="size-3.5 text-[oklch(0.85_0.16_78)]" />
              Improvement suggestions
            </p>
            {cred.suggestions.length === 0 ? (
              <div className="glass-strong rounded-2xl border border-[oklch(0.82_0.16_162/0.35)] p-5 text-sm text-[oklch(0.88_0.14_162)]">
                Your profile is in great shape. Keep engaging leads and collecting testimonials.
              </div>
            ) : (
              cred.suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => runSuggestion(s)}
                  className={cn(
                    "w-full text-left glass-strong rounded-xl border border-white/10 p-4",
                    "hover:border-[oklch(0.82_0.13_205/0.4)] hover:bg-white/[0.04] transition",
                    "active:scale-[0.99]",
                  )}
                >
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {s.description}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[oklch(0.82_0.13_205)]">
                    Take action <ArrowUpRight className="size-3" />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Testimonial Insights"
        subtitle="Social proof that supports conversions"
        action={
          onNavigateProfile ? (
            <DashboardLinkButton
              onClick={() => {
                onNavigateTop?.("profile");
                onNavigateProfile("testimonials");
              }}
            >
              Manage
            </DashboardLinkButton>
          ) : null
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DashboardStatCard
            label="Total Testimonials"
            value={model.testimonialInsights.total}
            icon={MessageSquare}
            accent="cyan"
          />
          <DashboardStatCard
            label="Average Rating"
            value={
              model.testimonialInsights.total > 0
                ? `${model.testimonialInsights.averageRating} ★`
                : "—"
            }
            icon={Star}
            accent="amber"
          />
          <DashboardStatCard
            label="New This Month"
            value={model.testimonialInsights.newThisMonth}
            icon={Award}
            accent="emerald"
          />
        </div>
        {onNavigateProfile && (
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full sm:w-auto rounded-xl border-white/15 gap-2"
            onClick={() => {
              onNavigateTop?.("profile");
              onNavigateProfile("testimonials");
            }}
          >
            <Sparkles className="size-4" />
            Request or review testimonials
          </Button>
        )}
      </DashboardSection>

      <p className="text-[10px] text-center text-muted-foreground px-4">
        Profile views and service-engagement metrics are illustrative estimates while live analytics
        are being connected. Lead and credibility numbers reflect your actual workspace data.
      </p>
    </div>
  );
}

function SourceRow({ row, total }: { row: LeadSourceInsight; total: number }) {
  const width = total === 0 ? 0 : Math.max(row.percent, row.count > 0 ? 8 : 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm mb-1.5">
        <span className="font-medium">{row.label}</span>
        <span className="text-muted-foreground tabular-nums text-xs">
          {row.count} · {row.percent}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          // Animate only the bar's width — `transition-all` was forcing
          // gradient/transform repaints alongside the width tween.
          className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.82_0.13_205)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={row.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${row.label}: ${row.count} leads (${row.percent}%)`}
        />
      </div>
    </div>
  );
}

function ServiceRow({ row }: { row: ServicePerformanceRow }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_5rem_5rem] gap-2 sm:gap-3 items-center px-4 md:px-5 py-3.5 hover:bg-white/[0.02] transition">
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="size-4" />
        </span>
        <span className="font-medium text-sm truncate">{row.label}</span>
      </div>
      <div className="flex sm:block items-center justify-between sm:text-right text-sm">
        <span className="sm:hidden text-[10px] uppercase tracking-wider text-muted-foreground">
          Views
        </span>
        <span className="font-semibold tabular-nums">{row.views.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex sm:block items-center justify-between sm:text-right text-sm">
        <span className="sm:hidden text-[10px] uppercase tracking-wider text-muted-foreground">
          Leads
        </span>
        <span
          className={cn(
            "font-semibold tabular-nums",
            row.leads > 0 ? "text-[oklch(0.82_0.16_162)]" : "text-muted-foreground",
          )}
        >
          {row.leads}
        </span>
      </div>
    </div>
  );
}

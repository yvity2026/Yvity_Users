"use client";

import { useState } from "react";
import {
  Award,
  Check,
  Crown,
  Eye,
  ImageIcon,
  MessageCircle,
  Quote,
  Search,
  Share2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  Video,
  Zap,
} from "lucide-react";
import {
  DashboardLinkButton,
  DashboardSection,
  DashboardStatCard,
  ProgressRing,
} from "@/components/advisor/dashboard/dashboard-ui";
import { HeldContentUpgradeBanner } from "@/components/advisor/membership/held-content-upgrade-banner";
import { toast } from "sonner";
import { IntroVideoUploadModal } from "@/components/intro-video/intro-video-upload-modal";
import { AdvisorAmbassadorReferralCard } from "@/components/advisor/dashboard/advisor-ambassador-referral-card";
import { DashboardApprovalBanner } from "@/components/dashboard/DashboardNotifications";
import { useAdvisorDashboardModel } from "@/hooks/use-advisor-dashboard-model";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { useVerifiedRecommendationCount } from "@/hooks/use-verified-recommendation-count";
import { useTestimonialVisibility } from "@/hooks/use-content-visibility";
import { useTestimonialsData } from "@/lib/sections/stores";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useShareProfileLink } from "@/hooks/use-share-profile-link";
import { useTestimonialSubmit } from "@/lib/testimonial-submit-store";
import { usePublicProfileUrls } from "@/hooks/use-public-profile-urls";
import type { AdvisorProfileSection, AdvisorTopSection } from "@/lib/advisor-nav";
import type { DashboardAction } from "@/lib/advisor-dashboard/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AdvisorDashboardOverviewProps = {
  onNavigateTop: (section: AdvisorTopSection) => void;
  onNavigateProfile: (section: AdvisorProfileSection) => void;
  onOpenRequestTestimonial: () => void;
  /** Hides demo traffic numbers while services are under admin review. */
  underReview?: boolean;
};

const strengthColors = {
  Starter: "text-muted-foreground",
  Growing: "text-[oklch(0.82_0.13_205)]",
  Strong: "text-[oklch(0.82_0.16_162)]",
  Elite: "text-[oklch(0.85_0.16_78)]",
} as const;

export function AdvisorDashboardOverview({
  onNavigateTop,
  onNavigateProfile,
  onOpenRequestTestimonial,
  underReview = false,
}: AdvisorDashboardOverviewProps) {
  const { model, loading } = useAdvisorDashboardModel();
  const { canAppearInSearch } = usePlanLimits();
  const { heldCount: heldRecommendationCount } = useVerifiedRecommendationCount();
  const [testimonials] = useTestimonialsData();
  const { heldCount: heldTestimonialCount, heldByType, upgradePlan } =
    useTestimonialVisibility(testimonials);
  const { settings } = useAdvisorSettings();
  const { share, copied: shareDone, canShare } = useShareProfileLink();
  const { openRequestRecommend } = useTestimonialSubmit();
  const { previewPath } = usePublicProfileUrls();
  const [introVideoModalOpen, setIntroVideoModalOpen] = useState(false);

  if (loading || !model) {
    // Skeleton matches the live layout: hero strip + three sections
    // of stat tiles (Performance Snapshot, Lead Summary, Profile
    // Health bar). Reduces the visual snap when the data lands.
    return (
      <div
        className="space-y-4 md:space-y-8 animate-pulse"
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading dashboard"
      >
        <div className="h-36 rounded-3xl bg-white/5" />
        <div className="space-y-3">
          <div className="h-4 w-44 rounded bg-white/5" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`perf-${i}`} className="h-28 rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-36 rounded bg-white/5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`leads-${i}`} className="h-24 rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-white/5" />
          <div className="h-40 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  const initials = model.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const maxTrend = Math.max(...model.viewsTrend, 1);

  const handleShareProfile = async () => {
    if (!settings.publicProfile.shareProfile) {
      toast.error("Profile sharing is disabled.", {
        description: "Enable it under Settings \u2192 Public profile controls.",
      });
      return;
    }
    await share();
  };

  const runAction = (action: DashboardAction) => {
    // Typed `kind` discriminator (see DashboardAction) — keeps custom
    // handlers strongly typed instead of relying on magic `id` strings.
    switch (action.kind) {
      case "open-intro-video":
        setIntroVideoModalOpen(true);
        return;
    }
    if (action.topSection) onNavigateTop(action.topSection);
    if (action.profileSection) onNavigateProfile(action.profileSection);
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-4 animate-in fade-in duration-500">
      <DashboardApprovalBanner />

      {/* 1. Welcome section */}
      <section
        aria-labelledby="dashboard-welcome-title"
        className="glass-strong rounded-3xl border border-white/12 overflow-hidden"
      >
        <div className="h-1 bg-gradient-to-r from-primary via-[oklch(0.82_0.13_205)] to-[oklch(0.82_0.16_162)]" />
        <div className="p-5 md:p-7 flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="size-16 md:size-20 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground ring-2 ring-white/20 shadow-lg">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Welcome back
              </p>
              <h2
                id="dashboard-welcome-title"
                className="text-2xl md:text-3xl font-bold tracking-tight truncate"
              >
                {model.displayName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.85_0.16_78/0.4)] bg-[oklch(0.85_0.16_78/0.12)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--yvity-accent-gold-strong)]">
                  <Crown className="size-3" />
                  {model.membershipPlan}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    strengthColors[model.profileStrength],
                  )}
                >
                  {model.profileStrength} profile
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
            <div className="relative flex items-center justify-center">
              <ProgressRing percent={model.profileCompletionPercent} size="lg" />
              <span className="absolute text-base font-bold tabular-nums">
                {model.profileCompletionPercent}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider text-center sm:text-right">
              Profile complete
            </p>
          </div>
        </div>
      </section>

      {/* 2. Performance Snapshot */}
      <DashboardSection
        title="Performance Snapshot"
        subtitle={
          underReview
            ? "Starts at zero until your profile is approved"
            : "How your profile is performing this month"
        }
        defaultOpen
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <DashboardStatCard
            label="YVITY Score"
            value={`${model.performance.yvityScore} / 100`}
            icon={Zap}
            accent="amber"
            large
            className="col-span-2 lg:col-span-1"
          />
          <DashboardStatCard
            label="Profile Views"
            value={model.performance.totalProfileViews.toLocaleString("en-IN")}
            delta={
              model.performance.profileViewsLastMonth > 0
                ? `+${model.performance.profileViewsLastMonth} last month`
                : undefined
            }
            icon={Eye}
            accent="cyan"
          />
          {canAppearInSearch ? (
            <DashboardStatCard
              label="Search Appearances"
              value={model.performance.searchAppearances}
              delta={model.performance.searchDelta}
              icon={Search}
              accent="violet"
            />
          ) : null}
          <DashboardStatCard
            label="Shared by Others"
            value={model.performance.profileSharesByOthers}
            icon={Share2}
            accent="emerald"
          />
          <DashboardStatCard
            label="Testimonials"
            value={model.performance.testimonialsReceived}
            icon={Quote}
            accent="cyan"
          />
          <DashboardStatCard
            label="Recommendations"
            value={model.performance.recommendationsReceived}
            icon={UserPlus}
            accent="rose"
          />
        </div>
        {!underReview ? (
          <HeldContentUpgradeBanner
            heldTestimonialCount={heldTestimonialCount}
            heldRecommendationCount={heldRecommendationCount}
            heldByTestimonialType={heldByType}
            upgradePlan={upgradePlan}
            className="mt-4"
          />
        ) : null}
      </DashboardSection>

      {/* 3. Quick Actions */}
      <DashboardSection title="Quick Actions" subtitle="One tap to grow your profile">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickAction
            icon={Eye}
            label="View Public Profile"
            onClick={() =>
              // Opens the public profile with `?preview=public` so the
              // page renders the visitor chrome (Login CTA, no Dashboard
              // / Logout) even though the advisor is still authenticated.
              window.open(previewPath, "_blank", "noopener,noreferrer")
            }
          />
          <QuickAction
            icon={Share2}
            label={
              shareDone ? "Link Copied!" : canShare ? "Share Profile" : "Share (after approval)"
            }
            onClick={() => void handleShareProfile()}
          />
          <QuickAction
            icon={MessageCircle}
            label="Request Testimonial"
            onClick={onOpenRequestTestimonial}
          />
          <QuickAction
            icon={Star}
            label="Request Recommendation"
            onClick={openRequestRecommend}
          />
          <QuickAction
            icon={Award}
            label="Add Achievement"
            onClick={() => {
              onNavigateTop("profile");
              onNavigateProfile("achievements");
            }}
          />
          <QuickAction
            icon={Sparkles}
            label="Add Service"
            onClick={() => {
              onNavigateTop("profile");
              onNavigateProfile("services");
            }}
          />
          <QuickAction
            icon={ImageIcon}
            label="Upload Gallery"
            onClick={() => {
              onNavigateTop("profile");
              onNavigateProfile("gallery");
            }}
          />
          <QuickAction
            icon={Video}
            label="Intro Video"
            onClick={() => setIntroVideoModalOpen(true)}
          />
        </div>
      </DashboardSection>

      {/* 4. Lead Summary */}
      <DashboardSection
        title="Lead Summary"
        subtitle="Stay on top of new business"
        action={
          <DashboardLinkButton onClick={() => onNavigateTop("leads")}>
            View all leads
          </DashboardLinkButton>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <DashboardStatCard
            label="Total Leads"
            value={model.leads.totalLeads}
            icon={Users}
            accent="emerald"
            onClick={() => onNavigateTop("leads")}
          />
          <DashboardStatCard
            label="New Leads"
            value={model.leads.newLeads}
            icon={UserPlus}
            accent="cyan"
            onClick={() => onNavigateTop("leads")}
          />
          <DashboardStatCard
            label="Follow-up Leads"
            value={model.leads.followUpLeads}
            icon={Target}
            accent="amber"
            onClick={() => onNavigateTop("leads")}
          />
          <DashboardStatCard
            label="Converted Leads"
            value={model.leads.convertedLeads}
            icon={Award}
            accent="violet"
            onClick={() => onNavigateTop("leads")}
          />
        </div>
      </DashboardSection>

      {/* 5. Profile Performance */}
      <DashboardSection
        title="Profile Performance"
        subtitle="Growth signals from your public profile"
      >
        <div className="glass-strong rounded-2xl border border-white/10 p-4 md:p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="size-3.5" />
                Profile views (7 days)
              </p>
              <span className="text-[11px] text-[oklch(0.82_0.16_162)] font-semibold">
                {model.performance.profileViewsDelta}
              </span>
            </div>
            {maxTrend <= 1 && model.viewsTrend.every((v) => v === 0) ? (
              <div className="flex h-24 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                <p className="text-xs text-muted-foreground">No data yet — check back soon</p>
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-24">
                {model.viewsTrend.map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-primary/80 to-[oklch(0.82_0.13_205/0.5)] min-h-[4px] transition-[height] duration-500 ease-out motion-reduce:transition-none"
                    style={{ height: `${Math.max(8, (v / maxTrend) * 100)}%` }}
                    title={`Day ${i + 1}: ${v} views`}
                  />
                ))}
              </div>
            )}
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {model.performanceInsights.map((row) => (
              <li
                key={row.label}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3.5"
              >
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {row.label}
                </p>
                <p className="text-[15px] font-semibold mt-1.5 leading-snug">{row.value}</p>
                {row.hint && <p className="text-[11px] text-muted-foreground mt-1">{row.hint}</p>}
              </li>
            ))}
          </ul>
          <DashboardLinkButton onClick={() => onNavigateTop("insights")}>
            Full insights
          </DashboardLinkButton>
        </div>
      </DashboardSection>

      {/* 6. Action Center */}
      {model.actions.length > 0 && (
        <DashboardSection title="Action Center" subtitle="Recommended next steps">
          <ul className="space-y-2">
            {model.actions.map((action) => (
              <li key={action.id}>
                <button
                  type="button"
                  onClick={() => runAction(action)}
                  className="w-full glass-strong rounded-2xl border border-white/10 p-4 sm:p-5 flex items-start gap-3.5 text-left hover:border-[oklch(0.82_0.13_205/0.35)] active:scale-[0.99] transition"
                >
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      action.priority === "high"
                        ? "bg-[oklch(0.85_0.16_78)]"
                        : action.priority === "medium"
                          ? "bg-[oklch(0.82_0.13_205)]"
                          : "bg-white/30",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold leading-snug">{action.title}</p>
                    <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <Target className="size-4 text-muted-foreground shrink-0 mt-1" />
                </button>
              </li>
            ))}
          </ul>
        </DashboardSection>
      )}

      {/* 7. Referral Card */}
      <AdvisorAmbassadorReferralCard />

      {/* 8. Membership Status */}
      <DashboardSection title="Membership Status">
        <div className="glass-strong rounded-3xl border border-white/12 overflow-hidden">
          <div className="p-5 md:p-7 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Current plan
                </p>
                <p className="text-xl font-bold mt-1 flex items-center gap-2">
                  <Crown className="size-5 text-[oklch(0.85_0.16_78)]" />
                  {model.membership.planName}
                </p>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Renews{" "}
                  {new Date(model.membership.renewalDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {model.membership.daysUntilRenewal <= 45 && (
                    <span className="text-[oklch(0.85_0.16_78)]">
                      {" "}
                      · {model.membership.daysUntilRenewal} days left
                    </span>
                  )}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="rounded-full"
                onClick={() => onNavigateTop("membership")}
              >
                {model.membership.canUpgrade ? "Upgrade" : "Manage Plan"}
              </Button>
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {model.membership.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Check className="size-3.5 shrink-0 text-[oklch(0.82_0.16_162)]" />
                  {b}
                </li>
              ))}
            </ul>
            {model.membership.canUpgrade && model.membership.upgradeHighlight ? (
              <p className="text-[13px] text-muted-foreground border-t border-white/10 pt-4">
                <span className="font-semibold text-foreground">
                  {model.membership.upgradePlanName}
                </span>
                {" — "}
                {model.membership.upgradeHighlight}
              </p>
            ) : null}
          </div>
        </div>
      </DashboardSection>

      <IntroVideoUploadModal
        open={introVideoModalOpen}
        onClose={() => setIntroVideoModalOpen(false)}
      />
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 rounded-2xl glass border border-white/10 p-4 hover:bg-white/[0.05] hover:border-white/20 active:scale-[0.97] transition text-center"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/40 to-accent/30 ring-1 ring-white/10">
        <Icon className="size-5" />
      </span>
      <span className="text-[13px] font-semibold leading-tight">{label}</span>
    </button>
  );
}

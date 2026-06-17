"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Eye,
  Gem,
  Globe2,
  IdCard,
  Lightbulb,
  Medal,
  MessageSquare,
  Music2,
  Quote,
  Share2,
  Smartphone,
  Sparkles,
  ThumbsUp,
  Trophy,
  Upload,
  User,
  UserPlus,
  Users,
  Video,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAdvisorScore } from "@/hooks/use-advisor-score";
import type {
  ScoreAchievementBlock,
  ScoreAchievementTier,
  ScoreCategory,
  ScoreExplanation,
  ScoreImprovement,
  ScoreNegativeRule,
  ScoreRule,
  ScoreSubItem,
} from "@/lib/advisor-score/types";
import type { AdvisorProfileSection } from "@/lib/advisor-nav";
import { cn } from "@/lib/utils";

const RULE_ICONS: Record<string, LucideIcon> = {
  globe: Globe2,
  upload: Upload,
  users: Users,
  sparkles: Sparkles,
  zap: Zap,
  quote: Quote,
  "thumbs-up": ThumbsUp,
  trophy: Trophy,
};

const SUB_ITEM_ICONS: Record<string, LucideIcon> = {
  selfie: User,
  "mobile-email": Smartphone,
  irdai: BadgeCheck,
  "intro-video": Video,
  text: MessageSquare,
  audio: Music2,
  video: Video,
};

const CATEGORY_ICONS: Record<ScoreCategory["id"], LucideIcon> = {
  identity: IdCard,
  visibility: Eye,
  trust: Trophy,
};

/**
 * Per-category accent palette. Headings, icon chips, progress bars, the
 * hero chip border and corner glows all draw from the same palette so each
 * category reads as its own visual lane:
 *
 *   • Identity   — cyan      (calm, secure)
 *   • Visibility — amber     (attention, reach)
 *   • Trust      — emerald   (verified, credible)
 *
 * Pure Tailwind class strings — no runtime style objects — so the build
 * keeps all values tree-shakable and the JIT picks them up correctly.
 */
type CategoryPalette = {
  icon: string;
  iconBg: string;
  iconRing: string;
  heading: string;
  bar: string;
  glow: string;
  value: string;
  chipBorder: string;
  chipBg: string;
  chipLabel: string;
  chipIcon: string;
  topAccent: string;
};

const CATEGORY_PALETTE: Record<ScoreCategory["id"], CategoryPalette> = {
  identity: {
    icon: "text-[oklch(0.82_0.13_205)]",
    iconBg: "bg-[oklch(0.82_0.13_205/0.14)]",
    iconRing: "ring-[oklch(0.82_0.13_205/0.4)]",
    heading:
      "bg-gradient-to-r from-[oklch(0.92_0.1_205)] to-[oklch(0.78_0.14_215)] bg-clip-text text-transparent",
    bar: "bg-gradient-to-r from-[oklch(0.72_0.16_205)] to-[oklch(0.86_0.13_215)]",
    glow: "bg-[oklch(0.82_0.13_205/0.18)]",
    value: "text-[oklch(0.82_0.13_205)]",
    // Chip values are tuned against the *vibrant* hero background — slightly
    // stronger backing and brighter labels so the cyan chip still pops next
    // to the cyan-tinted patch of the gradient.
    chipBorder: "border-[oklch(0.88_0.13_205/0.55)]",
    chipBg: "bg-[oklch(0.82_0.13_205/0.2)]",
    chipLabel: "text-[oklch(0.96_0.06_205)]",
    chipIcon: "text-[oklch(0.92_0.12_205)]",
    topAccent: "bg-gradient-to-r from-transparent via-[oklch(0.82_0.13_205/0.55)] to-transparent",
  },
  visibility: {
    icon: "text-[oklch(0.88_0.15_78)]",
    iconBg: "bg-[oklch(0.88_0.15_78/0.16)]",
    iconRing: "ring-[oklch(0.88_0.15_78/0.45)]",
    heading:
      "bg-gradient-to-r from-[oklch(0.95_0.13_85)] to-[oklch(0.82_0.18_65)] bg-clip-text text-transparent",
    bar: "bg-gradient-to-r from-[oklch(0.82_0.18_65)] to-[oklch(0.92_0.16_85)]",
    glow: "bg-[oklch(0.88_0.15_78/0.2)]",
    value: "text-[oklch(0.88_0.15_78)]",
    chipBorder: "border-[oklch(0.94_0.14_82/0.6)]",
    chipBg: "bg-[oklch(0.88_0.15_78/0.22)]",
    chipLabel: "text-[oklch(0.97_0.1_85)]",
    chipIcon: "text-[oklch(0.94_0.14_82)]",
    topAccent: "bg-gradient-to-r from-transparent via-[oklch(0.88_0.15_78/0.55)] to-transparent",
  },
  trust: {
    icon: "text-[oklch(0.82_0.16_162)]",
    iconBg: "bg-[oklch(0.82_0.16_162/0.16)]",
    iconRing: "ring-[oklch(0.82_0.16_162/0.45)]",
    heading:
      "bg-gradient-to-r from-[oklch(0.9_0.14_170)] to-[oklch(0.72_0.16_155)] bg-clip-text text-transparent",
    bar: "bg-gradient-to-r from-[oklch(0.65_0.13_175)] to-[oklch(0.82_0.16_162)]",
    glow: "bg-[oklch(0.82_0.16_162/0.18)]",
    value: "text-[oklch(0.82_0.16_162)]",
    chipBorder: "border-[oklch(0.9_0.14_165/0.55)]",
    chipBg: "bg-[oklch(0.82_0.16_162/0.2)]",
    chipLabel: "text-[oklch(0.96_0.1_168)]",
    chipIcon: "text-[oklch(0.92_0.14_165)]",
    topAccent: "bg-gradient-to-r from-transparent via-[oklch(0.82_0.16_162/0.55)] to-transparent",
  },
};

export type AdvisorScoreModuleProps = {
  /** Sends the user to a specific Profile Management sub-section. */
  onNavigateProfileSection?: (section: AdvisorProfileSection) => void;
  /** Triggers the share-profile flow (used by the improvements card). */
  onShareProfile?: () => void;
};

/**
 * Detailed YVITY Score dashboard.
 *
 * Layout mirrors the design spec:
 *   1. Dark teal hero card with the headline score + three category chips.
 *   2. Light category cards for Identity, Visibility and Trust — each with
 *      its own rules, sub-items and inline explanation banners.
 *   3. Negative-rule banner (score-decay rules).
 *   4. Achievement tiers (MDRT / COT / TOT) inside Trust.
 *   5. Dark "Improve Your Score" card with actionable next steps.
 */
export function AdvisorScoreModule({
  onNavigateProfileSection,
  onShareProfile,
}: AdvisorScoreModuleProps) {
  const { model, loading } = useAdvisorScore();

  if (loading || !model) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-40 rounded-3xl bg-white/5" />
        <div className="h-72 rounded-3xl bg-white/5" />
        <div className="h-72 rounded-3xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-5 pb-6 animate-in fade-in duration-400">
      <ScoreHeroCard
        total={model.total}
        max={model.max}
        tagline={model.tagline}
        categories={model.categories}
        decayPenalty={model.decayPenalty}
        decayActive={model.decayActive}
        decayGraceDaysRemaining={model.decayGraceDaysRemaining}
      />

      {/* Unified responsive accordion — same expand/collapse model on
          phone and desktop. Trigger header and body adapt to viewport. */}
      <CategoriesAccordion categories={model.categories} negativeRules={model.negativeRules} />

      <ScoreImproveCard
        items={model.improvements}
        currentScore={model.total}
        potentialScore={model.potentialTotal}
        onNavigateProfileSection={onNavigateProfileSection}
        onShareProfile={onShareProfile}
      />
    </div>
  );
}

// ============================================================
// CATEGORIES ACCORDION  (responsive — used on all viewports)
// ============================================================

/**
 * Unified responsive accordion for the three score categories. Each
 * card behaves identically on phone and desktop:
 *
 *   • Card chrome (rounded glass shell, top accent line, corner glow)
 *     adopts the category's palette so the lane reads as its own colour
 *     even when collapsed.
 *   • The trigger row shows: icon chip, gradient heading, slim progress
 *     bar and the numeric score.
 *   • `type="multiple"` so the advisor can keep more than one category
 *     open at once.
 *   • All cards default to collapsed — matches the "scan, then drill in"
 *     mental model that the score grid encourages.
 *
 * Inside the body we render two layouts:
 *
 *   – Desktop (`md:`): rich `RuleRow` / `TestimonialGrid` /
 *     `AchievementBlock` — everything visible inline.
 *   – Mobile (`< md`): compact nested collapsibles via
 *     `MobileCategoryBody`.
 *
 * Rendering both and toggling with `hidden md:block` / `md:hidden`
 * keeps each existing layout intact while sharing a single accordion
 * shell, header and animation.
 */
function CategoriesAccordion({
  categories,
  negativeRules,
}: {
  categories: ScoreCategory[];
  negativeRules: ScoreNegativeRule[];
}) {
  return (
    <Accordion type="multiple" className="space-y-3 md:space-y-4">
      {categories.map((category, i) => {
        const palette = CATEGORY_PALETTE[category.id];
        return (
          <AccordionItem
            key={category.id}
            value={category.id}
            className={cn(
              // Replace the AccordionItem default `border-b` with our card chrome.
              "border-0",
              "group relative overflow-hidden",
              "glass-strong rounded-2xl md:rounded-3xl border border-white/10",
              "transition-colors duration-200",
              "hover:border-white/15 data-[state=open]:border-white/15",
              "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both",
            )}
            style={{ animationDelay: `${Math.min(i * 80, 240)}ms` }}
          >
            {/* Top accent line keyed to the category color */}
            <span
              aria-hidden
              className={cn("absolute inset-x-0 top-0 h-px z-[1]", palette.topAccent)}
            />
            {/* Soft corner glow */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute -top-16 -right-12 size-40 rounded-full blur-3xl opacity-60",
                palette.glow,
              )}
            />

            <AccordionTrigger
              className={cn(
                "relative group/trigger gap-3",
                "px-4 py-4 md:px-6 md:py-5",
                "hover:no-underline hover:bg-white/[0.03] active:bg-white/[0.06]",
                "data-[state=open]:bg-white/[0.04]",
                "transition-all duration-200 ease-out motion-reduce:transition-none",
                "[&>svg]:ml-2 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
                "[&>svg]:transition-transform [&>svg]:duration-300",
              )}
            >
              <CategoryAccordionHeader category={category} />
            </AccordionTrigger>

            <AccordionContent className="px-0 pb-0">
              {/* Desktop rich body */}
              <div className="hidden md:block relative border-t border-white/10 px-6 py-5 space-y-4">
                {category.rules.map((rule, idx) => (
                  <RuleRow
                    key={rule.id}
                    rule={rule}
                    isLast={
                      idx === category.rules.length - 1 &&
                      !(category.id === "visibility" && negativeRules.length > 0)
                    }
                  />
                ))}
                {category.id === "visibility" && negativeRules.length > 0 && (
                  <NegativeRulesPanel rules={negativeRules} />
                )}
              </div>

              {/* Mobile compact body */}
              <div className="md:hidden relative border-t border-white/10 px-4 py-3">
                <MobileCategoryBody
                  category={category}
                  negativeRules={category.id === "visibility" ? negativeRules : undefined}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

/**
 * Responsive trigger header — keeps the same composition across
 * viewports but scales the icon chip, heading and bar so the desktop
 * card reads as roomier without losing the at-a-glance summary.
 */
function CategoryAccordionHeader({ category }: { category: ScoreCategory }) {
  const Icon = CATEGORY_ICONS[category.id];
  const palette = CATEGORY_PALETTE[category.id];
  const pct = Math.max(0, Math.min(100, Math.round((category.earned / category.max) * 100)));
  return (
    <div className="flex items-center gap-2.5 md:gap-3 min-w-0 flex-1">
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-xl md:rounded-2xl ring-1 shrink-0",
          "size-8 md:size-11",
          palette.iconBg,
          palette.iconRing,
        )}
      >
        <Icon className={cn("size-4 md:size-5", palette.icon)} />
      </span>
      <span className={cn("text-sm md:text-lg font-bold tracking-tight truncate", palette.heading)}>
        {category.label}
      </span>

      <div className="ml-auto flex items-center gap-2 md:gap-3 shrink-0">
        <div className="h-1.5 md:h-2 w-12 md:w-32 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700 ease-out",
              palette.bar,
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={cn(
            "text-sm md:text-base font-bold tabular-nums whitespace-nowrap",
            palette.value,
          )}
        >
          {category.earned}
          <span className="text-muted-foreground font-medium">/{category.max}</span>
        </span>
      </div>
    </div>
  );
}

function MobileCategoryBody({
  category,
  negativeRules,
}: {
  category: ScoreCategory;
  negativeRules?: ScoreNegativeRule[];
}) {
  // Identity is a single composite rule — surface its sub-items as compact
  // rows directly, skipping the redundant nested "Identity" rule level.
  const isSingleSubItemRule =
    category.rules.length === 1 &&
    Boolean(category.rules[0].subItems?.length) &&
    !category.rules[0].achievements;

  if (isSingleSubItemRule) {
    const rule = category.rules[0];
    const hasIncomplete = (rule.subItems ?? []).some((s) => !s.complete);
    return (
      <div className="space-y-2">
        {rule.subItems!.map((sub) => (
          <CompactSubRow key={sub.id} item={sub} />
        ))}
        {rule.explanation && hasIncomplete && (
          <CompactExplanationPanel explanation={rule.explanation} tone="success" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {category.rules.map((rule) => (
        <CompactRuleCollapsible key={rule.id} rule={rule} />
      ))}
      {negativeRules && negativeRules.length > 0 && (
        <CompactNegativeRulesCollapsible rules={negativeRules} />
      )}
    </div>
  );
}

function CompactSubRow({ item }: { item: ScoreSubItem }) {
  const Icon = SUB_ITEM_ICONS[item.id];
  const isBooleanItem = item.max === 1;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2",
      )}
    >
      {Icon ? (
        <Icon className="size-3.5 text-muted-foreground shrink-0" />
      ) : (
        <span className="size-3.5 shrink-0" />
      )}
      <span className="text-[13px] font-medium text-foreground/90 truncate flex-1 min-w-0">
        {item.label}
      </span>
      {isBooleanItem ? (
        item.complete ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-[oklch(0.55_0.13_185)]">
            <BadgeCheck className="size-3.5" />
            1 pt
          </span>
        ) : (
          <span className="shrink-0 text-[11px] font-medium text-muted-foreground">0 pt</span>
        )
      ) : (
        <CompactProgressBadge earned={item.earned} max={item.max} />
      )}
    </div>
  );
}

/**
 * Compact rule row — single tap-line on mobile.
 *
 * If the rule has any expanded content (explanation / sub-items / achievement
 * tiers) we render a chevron and use a `grid-template-rows` transition to
 * smoothly expand the body. Rules without details degrade to a non-clickable
 * row, keeping vertical rhythm consistent.
 */
function CompactRuleCollapsible({ rule }: { rule: ScoreRule }) {
  const hasContent = Boolean(
    rule.explanation || (rule.subItems && rule.subItems.length > 0) || rule.achievements,
  );
  const [open, setOpen] = useState(false);
  const Icon = (rule.iconHint && RULE_ICONS[rule.iconHint]) ?? null;
  const isTestimonials = rule.id === "testimonials";

  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden",
        "transition-colors duration-200",
        open && "border-white/15 bg-white/[0.04]",
      )}
    >
      <button
        type="button"
        onClick={() => hasContent && setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2.5 text-left",
          hasContent && "cursor-pointer hover:bg-white/[0.04] active:bg-white/[0.06]",
          !hasContent && "cursor-default",
          "transition-colors duration-200",
        )}
        aria-expanded={hasContent ? open : undefined}
        disabled={!hasContent}
      >
        {Icon ? (
          <Icon className="size-4 text-foreground/80 shrink-0" />
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <span className="text-[13px] sm:text-sm font-semibold text-foreground truncate flex-1 min-w-0">
          {rule.label}
        </span>
        <CompactProgressBadge earned={rule.earned} max={rule.max} />
        {hasContent && (
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground shrink-0 transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {hasContent && (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3 pt-1 space-y-2.5 border-t border-white/8">
              {rule.subItems && !rule.achievements && isTestimonials && (
                <CompactTestimonialList items={rule.subItems} />
              )}
              {rule.subItems && !rule.achievements && !isTestimonials && (
                <div className="space-y-1.5">
                  {rule.subItems.map((sub) => (
                    <CompactSubRow key={sub.id} item={sub} />
                  ))}
                </div>
              )}
              {rule.explanation && (
                <CompactExplanationPanel
                  explanation={rule.explanation}
                  tone={rule.status === "empty" ? "info" : "success"}
                />
              )}
              {rule.achievements && <CompactAchievementList block={rule.achievements} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompactProgressBadge({ earned, max }: { earned: number; max: number }) {
  const isComplete = earned >= max && max > 0;
  const isEmpty = earned <= 0;
  const valueColor = isComplete
    ? "text-[oklch(0.55_0.13_185)]"
    : isEmpty
      ? "text-muted-foreground"
      : "text-[oklch(0.82_0.16_78)]";
  return (
    <span
      className={cn("text-[12px] font-bold tabular-nums whitespace-nowrap shrink-0", valueColor)}
    >
      {earned}
      <span className="text-muted-foreground font-medium">/{max}</span>
    </span>
  );
}

function CompactExplanationPanel({
  explanation,
  tone = "info",
}: {
  explanation: ScoreExplanation;
  tone?: "info" | "success";
}) {
  const palette =
    tone === "success"
      ? {
          bg: "bg-[oklch(0.55_0.13_185/0.08)]",
          border: "border-[oklch(0.55_0.13_185/0.25)]",
          accent: "text-[oklch(0.55_0.13_185)]",
        }
      : {
          bg: "bg-[oklch(0.82_0.13_205/0.08)]",
          border: "border-[oklch(0.82_0.13_205/0.25)]",
          accent: "text-[oklch(0.82_0.13_205)]",
        };
  return (
    <div className={cn("rounded-lg border px-3 py-2.5 space-y-1.5", palette.bg, palette.border)}>
      {explanation.bullets.length > 0 && (
        <ul className="space-y-0.5">
          {explanation.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[12px] text-foreground/90 leading-snug"
            >
              <span className="mt-1.5 size-1 rounded-full shrink-0 bg-current opacity-70" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {explanation.caption && (
        <p className="text-[11px] text-muted-foreground italic leading-snug">
          {explanation.caption}
        </p>
      )}
      {explanation.metrics && explanation.metrics.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] pt-1">
          {explanation.metrics.map((m, i) => (
            <span
              key={i}
              className={cn(
                "inline-flex items-center gap-1 whitespace-nowrap",
                m.tone === "warning"
                  ? "text-[oklch(0.78_0.18_65)] font-bold"
                  : m.tone === "success"
                    ? cn(palette.accent, "font-bold")
                    : "text-foreground/85 font-semibold",
              )}
            >
              {m.tone === "success" && <BadgeCheck className="size-3" />}
              {m.label && <span className="text-muted-foreground font-medium">{m.label} :</span>}
              {m.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CompactTestimonialList({ items }: { items: ScoreSubItem[] }) {
  const labelToIcon: Record<string, LucideIcon> = {
    text: MessageSquare,
    audio: Music2,
    video: Video,
  };
  const labelToHint: Record<string, string> = {
    text: "1 text = 1 pt",
    audio: "1 audio = 2 pts",
    video: "1 video = 3 pts",
  };
  const trust = CATEGORY_PALETTE.trust;
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const Icon = labelToIcon[it.id] ?? MessageSquare;
        const full = it.complete;
        const pointsLeft = Math.max(0, it.max - it.earned);
        return (
          <div
            key={it.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5",
              "bg-[oklch(0.82_0.16_162/0.05)] border-[oklch(0.82_0.16_162/0.2)]",
            )}
          >
            <span
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-lg ring-1 shrink-0",
                trust.iconBg,
                trust.iconRing,
              )}
            >
              <Icon className={cn("size-3.5", trust.icon)} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
                {it.label}{" "}
                <span className="text-[11px] text-muted-foreground font-medium">
                  · {labelToHint[it.id]}
                </span>
              </p>
              <p
                className={cn(
                  "text-[11px] leading-tight mt-0.5 font-semibold",
                  full ? trust.value : "text-[oklch(0.85_0.16_78)]",
                )}
              >
                {full ? (
                  <>
                    <BadgeCheck className="inline size-3 -mt-0.5" /> Full score
                  </>
                ) : (
                  `+${pointsLeft} pts available`
                )}
              </p>
            </div>
            <CompactProgressBadge earned={it.earned} max={it.max} />
          </div>
        );
      })}
    </div>
  );
}

function CompactAchievementList({ block }: { block: ScoreAchievementBlock }) {
  const trust = CATEGORY_PALETTE.trust;
  return (
    <div className="space-y-2.5">
      <div
        className={cn(
          "flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2.5",
          "bg-[oklch(0.82_0.16_162/0.05)] border-[oklch(0.82_0.16_162/0.2)]",
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-lg ring-1 shrink-0",
              trust.iconBg,
              trust.iconRing,
            )}
          >
            <Trophy className={cn("size-3", trust.icon)} />
          </span>
          <p className="text-[11px] text-foreground/85 leading-snug">{block.caption}</p>
        </div>
        {block.currentLabel && (
          <p className={cn("text-[11px] font-bold whitespace-nowrap shrink-0", trust.value)}>
            {block.currentLabel}
          </p>
        )}
      </div>
      <div className="space-y-2">
        {block.tiers.map((t) => (
          <CompactAchievementTierRow key={t.id} tier={t} />
        ))}
      </div>
    </div>
  );
}

function CompactAchievementTierRow({ tier }: { tier: ScoreAchievementTier }) {
  const active = tier.status === "active";
  const TierIcon = tier.iconHint === "medal" ? Medal : tier.iconHint === "gem" ? Gem : Trophy;
  const accent = {
    emerald: {
      iconText: "text-[oklch(0.82_0.16_162)]",
      iconBg: "bg-[oklch(0.82_0.16_162/0.18)]",
      ring: "ring-[oklch(0.82_0.16_162/0.4)]",
      cardActive: "bg-[oklch(0.82_0.16_162/0.08)] border-[oklch(0.82_0.16_162/0.35)]",
      label: "text-[oklch(0.82_0.16_162)]",
    },
    amber: {
      iconText: "text-[oklch(0.85_0.16_78)]",
      iconBg: "bg-[oklch(0.85_0.16_78/0.16)]",
      ring: "ring-[oklch(0.85_0.16_78/0.4)]",
      cardActive: "bg-[oklch(0.85_0.16_78/0.08)] border-[oklch(0.85_0.16_78/0.35)]",
      label: "text-[oklch(0.85_0.16_78)]",
    },
    violet: {
      iconText: "text-[oklch(0.78_0.15_295)]",
      iconBg: "bg-[oklch(0.78_0.15_295/0.16)]",
      ring: "ring-[oklch(0.78_0.15_295/0.4)]",
      cardActive: "bg-[oklch(0.78_0.15_295/0.08)] border-[oklch(0.78_0.15_295/0.35)]",
      label: "text-[oklch(0.78_0.15_295)]",
    },
  }[tier.accent];

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3 py-2",
        active ? accent.cardActive : "border-white/10 bg-white/[0.02]",
      )}
    >
      <span
        className={cn(
          "inline-flex size-8 shrink-0 items-center justify-center rounded-full ring-1",
          active ? cn(accent.iconBg, accent.ring) : "bg-white/[0.04] ring-white/10",
        )}
      >
        <TierIcon
          className={cn("size-4", active ? accent.iconText : "text-muted-foreground/70")}
          strokeWidth={active ? 2.2 : 1.8}
        />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] font-bold leading-tight truncate",
            active ? "text-foreground" : "text-muted-foreground/80",
          )}
        >
          {tier.label}
          <span className="ml-1.5 font-medium text-muted-foreground/70 text-[11px]">
            {tier.fullName}
          </span>
        </p>
        <p
          className={cn(
            "text-[11px] leading-tight mt-0.5 font-semibold",
            active ? accent.label : "text-muted-foreground/70",
          )}
        >
          {tier.pointsLabel}
        </p>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0",
          active
            ? cn(accent.label, accent.iconBg, "border", accent.ring)
            : "text-muted-foreground bg-white/[0.04] border border-white/10",
        )}
      >
        {active ? (
          <>
            <BadgeCheck className="size-2.5" /> Active
          </>
        ) : (
          "—"
        )}
      </span>
    </div>
  );
}

function CompactNegativeRulesCollapsible({ rules }: { rules: ScoreNegativeRule[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        "bg-[oklch(0.78_0.18_30/0.06)] border-[oklch(0.78_0.18_30/0.25)]",
        "transition-colors duration-200",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2.5 text-left",
          "transition-colors duration-200 hover:bg-[oklch(0.78_0.18_30/0.1)] active:bg-[oklch(0.78_0.18_30/0.14)]",
        )}
        aria-expanded={open}
      >
        <AlertTriangle className="size-4 shrink-0 text-[oklch(0.78_0.18_30)]" />
        <span className="text-[13px] font-bold text-[oklch(0.78_0.18_30)] flex-1">
          Negative Rule
        </span>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[oklch(0.78_0.18_30)]/85">
          Score decay
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[oklch(0.78_0.18_30)] transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ul className="px-3 pb-3 pt-1 space-y-2 border-t border-[oklch(0.78_0.18_30/0.2)]">
            {rules.map((r, i) => (
              <li key={i} className="text-[12px] leading-snug">
                <p>
                  <span className="font-bold text-foreground">{r.label}:</span>{" "}
                  <span className="text-foreground/85">{r.description}</span>
                </p>
                <p className="text-[oklch(0.78_0.18_30)] font-medium mt-0.5">
                  <span className="font-semibold">Decay:</span> {r.decay}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HERO
// ============================================================

function ScoreHeroCard({
  total,
  max,
  tagline,
  categories,
  decayPenalty = 0,
  decayActive = false,
  decayGraceDaysRemaining = null,
}: {
  total: number;
  max: number;
  tagline: string;
  categories: ScoreCategory[];
  decayPenalty?: number;
  decayActive?: boolean;
  decayGraceDaysRemaining?: number | null;
}) {
  return (
    <section
      className={cn(
        // Always-dark, multi-hue gradient — built from deeper shades of
        // the same gold / cyan / emerald palette as the home YVITY Score
        // progress bar so the two surfaces feel like a single brand
        // language. Still dark enough to keep white text readable.
        "yvity-on-dark",
        "relative overflow-hidden rounded-3xl",
        "border border-white/12",
        "bg-gradient-to-br from-[oklch(0.36_0.16_78)] via-[oklch(0.28_0.13_205)] to-[oklch(0.32_0.14_165)]",
        "shadow-[0_22px_60px_-22px_oklch(0_0_0/0.55)]",
        "animate-in fade-in slide-in-from-bottom-2 duration-500",
      )}
    >
      {/* Top accent bar — mirrors the home YVITY Score progress bar
          gradient exactly (amber → cyan → emerald) so visitors recognise
          the same brand stripe inside the dashboard. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1",
          "bg-gradient-to-r from-[oklch(0.85_0.16_78)] via-[oklch(0.82_0.13_205)] to-[oklch(0.78_0.16_162)]",
          "shadow-[0_0_22px_-2px_oklch(0.82_0.13_205/0.65)]",
        )}
      />

      {/* Three vibrant glow blobs at the canonical brand hues — gives the
          surface a sense of light without raising the base lightness. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-[oklch(0.85_0.16_78/0.32)] blur-[120px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full bg-[oklch(0.82_0.13_205/0.3)] blur-[120px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/3 size-56 rounded-full bg-[oklch(0.78_0.16_162/0.22)] blur-[110px]"
      />

      <div className="relative grid gap-5 p-5 md:gap-8 md:p-7 md:grid-cols-[auto_1fr_auto] md:items-center">
        {/* Left: headline score */}
        <div className="flex items-center gap-4 md:gap-5">
          <ScoreCircle total={total} max={max} />
          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-bold tracking-tight text-white">
              YVITY Score
            </h2>
            <p className="mt-1 text-[12px] md:text-sm text-white/85 leading-snug max-w-xs">
              {tagline}
            </p>
            {!decayActive && decayGraceDaysRemaining != null && decayGraceDaysRemaining > 0 ? (
              <p className="mt-2 text-[11px] text-white/70 leading-snug max-w-xs">
                Score decay starts in {decayGraceDaysRemaining} day
                {decayGraceDaysRemaining === 1 ? "" : "s"} (30-day grace from signup).
              </p>
            ) : null}
            {decayPenalty > 0 ? (
              <p className="mt-2 text-[11px] font-semibold text-[oklch(0.78_0.18_30)]">
                −{decayPenalty} inactivity decay applied
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: three breakdown chips — each tinted with its own
            category palette. Stronger backing + shadow keeps them
            crisp against the vibrant multi-hue gradient. */}
        <div className="md:col-start-3 grid grid-cols-3 gap-2.5 md:gap-3 md:min-w-[300px]">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.id];
            const palette = CATEGORY_PALETTE[c.id];
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-2xl border px-3 py-2.5 text-center",
                  "backdrop-blur-md shadow-[0_8px_22px_-12px_oklch(0_0_0/0.6)]",
                  palette.chipBorder,
                  palette.chipBg,
                )}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className={cn("size-3.5", palette.chipIcon)} />
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-[0.18em] font-semibold",
                      palette.chipLabel,
                    )}
                  >
                    {c.label}
                  </span>
                </div>
                <p className="text-base md:text-lg font-bold text-white leading-none">
                  {c.earned}
                  <span className="text-white/65 font-medium">/{c.max}</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ScoreCircle({ total, max }: { total: number; max: number }) {
  const size = 88;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, total / max));
  const dash = circumference * pct;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(1 0 0 / 0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#yvity-score-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 700ms ease-out" }}
        />
        <defs>
          <linearGradient id="yvity-score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.92 0.16 95)" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 65)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          {total}
        </span>
        <span className="mt-0.5 text-[10px] font-medium text-white/65">/{max}</span>
      </div>
    </div>
  );
}

// ============================================================
// RULE ROW
// ============================================================

function RuleRow({ rule, isLast }: { rule: ScoreRule; isLast?: boolean }) {
  const Icon = (rule.iconHint && RULE_ICONS[rule.iconHint]) ?? null;
  // Testimonials renders its sub-items as a 3-col grid (text / audio / video).
  // Everything else (e.g. Identity's selfie / mobile / IRDAI / video) renders
  // them as inline rows with a small progress bar each.
  const showTestimonialGrid =
    rule.id === "testimonials" && rule.subItems && rule.subItems.length > 0;
  const showSubItemRows =
    rule.subItems && rule.subItems.length > 0 && !rule.achievements && !showTestimonialGrid;

  return (
    <div className={cn("pb-4", !isLast && "border-b border-white/10")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon ? (
            <Icon className="size-4 text-foreground/80 shrink-0" />
          ) : (
            <span className="size-4 shrink-0" />
          )}
          <span className="text-sm font-semibold text-foreground truncate">{rule.label}</span>
        </div>
        <RuleProgress earned={rule.earned} max={rule.max} />
      </div>

      {/* Sub-item rows (Identity selfie/mobile/IRDAI/video) */}
      {showSubItemRows && (
        <div className="mt-3 pl-6 space-y-3">
          {rule.subItems!.map((sub) => (
            <SubItemRow key={sub.id} item={sub} />
          ))}
        </div>
      )}

      {/* Explanation banner */}
      {rule.explanation && (
        <ExplanationPanel
          explanation={rule.explanation}
          tone={rule.status === "empty" ? "info" : "success"}
        />
      )}

      {/* Trust → Testimonials grid */}
      {showTestimonialGrid && <TestimonialGrid items={rule.subItems!} />}

      {/* Trust → Achievements */}
      {rule.achievements && <AchievementBlock data={rule.achievements} />}
    </div>
  );
}

function SubItemRow({ item }: { item: ScoreSubItem }) {
  const Icon = SUB_ITEM_ICONS[item.id];
  const isBooleanItem = item.max === 1;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon ? (
          <Icon className="size-4 text-muted-foreground shrink-0" />
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <span className="text-sm font-medium text-foreground/90 truncate">{item.label}</span>
      </div>
      {isBooleanItem ? (
        item.complete ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[oklch(0.55_0.13_185)]">
            <BadgeCheck className="size-3.5" />
            1 pt
          </span>
        ) : (
          <span className="shrink-0 text-xs font-medium text-muted-foreground">0 pt</span>
        )
      ) : (
        <RuleProgress earned={item.earned} max={item.max} compact />
      )}
    </div>
  );
}

function RuleProgress({
  earned,
  max,
  compact = false,
}: {
  earned: number;
  max: number;
  compact?: boolean;
}) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, Math.round((earned / max) * 100)));
  const isComplete = earned >= max && max > 0;
  const isEmpty = earned <= 0;
  const barColor = isComplete
    ? "from-[oklch(0.55_0.13_185)] to-[oklch(0.65_0.14_175)]"
    : isEmpty
      ? "from-white/15 to-white/20"
      : "from-[oklch(0.78_0.18_65)] to-[oklch(0.85_0.16_78)]";
  const valueColor = isComplete
    ? "text-[oklch(0.55_0.13_185)]"
    : isEmpty
      ? "text-muted-foreground"
      : "text-[oklch(0.82_0.16_78)]";

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className={cn(
          "h-1.5 rounded-full bg-white/10 overflow-hidden",
          compact ? "w-16 sm:w-24" : "w-20 sm:w-32",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out",
            barColor,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn("text-xs sm:text-sm font-bold tabular-nums whitespace-nowrap", valueColor)}
      >
        {earned}
        <span className="text-muted-foreground font-medium">/{max}</span>
      </span>
    </div>
  );
}

// ============================================================
// EXPLANATION PANEL (light tinted banner)
// ============================================================

function ExplanationPanel({
  explanation,
  tone = "info",
}: {
  explanation: ScoreExplanation;
  tone?: "info" | "success";
}) {
  const palette =
    tone === "success"
      ? {
          bg: "bg-[oklch(0.55_0.13_185/0.08)]",
          border: "border-[oklch(0.55_0.13_185/0.25)]",
          accent: "text-[oklch(0.55_0.13_185)]",
        }
      : {
          bg: "bg-[oklch(0.82_0.13_205/0.08)]",
          border: "border-[oklch(0.82_0.13_205/0.25)]",
          accent: "text-[oklch(0.82_0.13_205)]",
        };

  return (
    <div
      className={cn(
        "mt-3 rounded-2xl border p-3 sm:p-4",
        "grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start",
        palette.bg,
        palette.border,
      )}
    >
      <div className="space-y-1.5 min-w-0">
        {explanation.bullets.length > 0 && (
          <ul className="space-y-1">
            {explanation.bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[12px] sm:text-[13px] text-foreground/90 leading-snug"
              >
                <span
                  className={cn("mt-1.5 size-1 rounded-full shrink-0", "bg-current opacity-70")}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {explanation.caption && (
          <p className="text-[11px] sm:text-xs text-muted-foreground italic">
            {explanation.caption}
          </p>
        )}
      </div>

      {explanation.metrics && explanation.metrics.length > 0 && (
        <div className="space-y-0.5 sm:text-right">
          {explanation.metrics.map((m, i) => (
            <p
              key={i}
              className={cn(
                "text-[11px] sm:text-xs whitespace-nowrap",
                m.tone === "warning"
                  ? "text-[oklch(0.78_0.18_65)] font-bold"
                  : m.tone === "success"
                    ? cn(palette.accent, "font-bold inline-flex items-center gap-1 sm:justify-end")
                    : "text-foreground/85 font-semibold",
              )}
            >
              {m.tone === "success" && <BadgeCheck className="size-3.5" />}
              {m.label && (
                <span className="text-muted-foreground font-medium mr-1">{m.label} :</span>
              )}
              {m.value}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TESTIMONIAL GRID  (Text / Audio / Video)
// ============================================================

function TestimonialGrid({ items }: { items: ScoreSubItem[] }) {
  const labelToIcon: Record<string, LucideIcon> = {
    text: MessageSquare,
    audio: Music2,
    video: Video,
  };
  const labelToHint: Record<string, string> = {
    text: "1 text = 1 pt",
    audio: "1 audio = 2 pts",
    video: "1 video = 3 pts",
  };
  // Keyed to the Trust category palette — emerald accent everywhere this
  // grid renders (since Testimonials only lives inside Trust).
  const trust = CATEGORY_PALETTE.trust;
  return (
    <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
      {items.map((it) => {
        const Icon = labelToIcon[it.id] ?? MessageSquare;
        const full = it.complete;
        const pointsLeft = Math.max(0, it.max - it.earned);
        return (
          <div
            key={it.id}
            className={cn(
              "relative overflow-hidden rounded-2xl border text-center",
              "p-4 sm:p-5",
              "bg-[oklch(0.82_0.16_162/0.05)] border-[oklch(0.82_0.16_162/0.22)]",
              "transition-all duration-300 ease-out",
              "hover:bg-[oklch(0.82_0.16_162/0.08)] hover:border-[oklch(0.82_0.16_162/0.35)]",
            )}
          >
            {/* Icon chip — replaces the inline tiny icon for clearer hierarchy */}
            <span
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-xl ring-1 mb-2.5",
                trust.iconBg,
                trust.iconRing,
              )}
            >
              <Icon className={cn("size-4", trust.icon)} />
            </span>

            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-foreground/70">
              {it.label}
            </p>

            <p className="mt-2 text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground leading-none">
              {it.earned}
              <span className="text-muted-foreground text-lg font-medium">/{it.max}</span>
            </p>

            <p className="mt-2 text-[11px] text-muted-foreground">{labelToHint[it.id]}</p>

            <div aria-hidden className="mt-3 mx-auto h-px w-12 bg-[oklch(0.82_0.16_162/0.25)]" />

            {full ? (
              <p
                className={cn(
                  "mt-3 inline-flex items-center justify-center gap-1 text-[11px] font-bold",
                  trust.value,
                )}
              >
                <BadgeCheck className="size-3.5" /> Full score
              </p>
            ) : (
              <p className="mt-3 text-[11px] font-bold text-[oklch(0.85_0.16_78)]">
                +{pointsLeft} pts available
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// ACHIEVEMENT BLOCK  (MDRT / COT / TOT)
// ============================================================

function AchievementBlock({ data }: { data: ScoreAchievementBlock }) {
  const trust = CATEGORY_PALETTE.trust;
  return (
    <div className="mt-4 space-y-3 sm:space-y-4">
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-2xl border",
          "px-4 py-3 sm:px-5 sm:py-3.5",
          "bg-[oklch(0.82_0.16_162/0.05)] border-[oklch(0.82_0.16_162/0.22)]",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-lg ring-1 shrink-0",
              trust.iconBg,
              trust.iconRing,
            )}
          >
            <Trophy className={cn("size-3.5", trust.icon)} />
          </span>
          <p className="text-[12px] sm:text-sm text-foreground/85 leading-snug">{data.caption}</p>
        </div>
        {data.currentLabel && (
          <p
            className={cn(
              "text-[12px] sm:text-sm font-bold whitespace-nowrap shrink-0",
              trust.value,
            )}
          >
            Current&nbsp;:&nbsp;{data.currentLabel}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {data.tiers.map((t) => (
          <AchievementTierCard key={t.id} tier={t} />
        ))}
      </div>
    </div>
  );
}

function AchievementTierCard({ tier }: { tier: ScoreAchievementTier }) {
  const active = tier.status === "active";
  const accentClass = {
    emerald: {
      iconText: "text-[oklch(0.82_0.16_162)]",
      iconBg: "bg-[oklch(0.82_0.16_162/0.18)]",
      ring: "ring-[oklch(0.82_0.16_162/0.4)]",
      cardActive:
        "bg-gradient-to-b from-[oklch(0.82_0.16_162/0.1)] to-transparent border-[oklch(0.82_0.16_162/0.35)]",
      label: "text-[oklch(0.82_0.16_162)]",
    },
    amber: {
      iconText: "text-[oklch(0.85_0.16_78)]",
      iconBg: "bg-[oklch(0.85_0.16_78/0.16)]",
      ring: "ring-[oklch(0.85_0.16_78/0.4)]",
      cardActive:
        "bg-gradient-to-b from-[oklch(0.85_0.16_78/0.1)] to-transparent border-[oklch(0.85_0.16_78/0.35)]",
      label: "text-[oklch(0.85_0.16_78)]",
    },
    violet: {
      iconText: "text-[oklch(0.78_0.15_295)]",
      iconBg: "bg-[oklch(0.78_0.15_295/0.16)]",
      ring: "ring-[oklch(0.78_0.15_295/0.4)]",
      cardActive:
        "bg-gradient-to-b from-[oklch(0.78_0.15_295/0.1)] to-transparent border-[oklch(0.78_0.15_295/0.35)]",
      label: "text-[oklch(0.78_0.15_295)]",
    },
  }[tier.accent];

  const TierIcon = tier.iconHint === "medal" ? Medal : tier.iconHint === "gem" ? Gem : Trophy;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center rounded-2xl border text-center",
        "p-4 sm:p-5",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5",
        active ? accentClass.cardActive : "border-white/10 bg-white/[0.02] hover:border-white/20",
      )}
    >
      <span
        className={cn(
          "inline-flex size-12 items-center justify-center rounded-full ring-1",
          active ? cn(accentClass.iconBg, accentClass.ring) : "bg-white/[0.04] ring-white/10",
        )}
      >
        <TierIcon
          className={cn("size-5", active ? accentClass.iconText : "text-muted-foreground/70")}
          strokeWidth={active ? 2.2 : 1.8}
        />
      </span>
      <p
        className={cn(
          "mt-2.5 text-sm font-bold tracking-tight",
          active ? "text-foreground" : "text-muted-foreground/80",
        )}
      >
        {tier.label}
      </p>
      <p
        className={cn(
          "mt-1 text-[12px] font-bold tabular-nums",
          active ? accentClass.label : "text-muted-foreground/70",
        )}
      >
        {tier.pointsLabel}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{tier.fullName}</p>
      <span
        className={cn(
          "mt-3.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
          active
            ? cn(accentClass.label, accentClass.iconBg, "border", accentClass.ring)
            : "text-muted-foreground bg-white/[0.04] border border-white/10",
        )}
      >
        {active ? (
          <>
            <BadgeCheck className="size-3" /> Active
          </>
        ) : (
          "—"
        )}
      </span>
    </div>
  );
}

// ============================================================
// NEGATIVE RULES PANEL
// ============================================================

function NegativeRulesPanel({ rules }: { rules: ScoreNegativeRule[] }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        "bg-[oklch(0.78_0.18_30/0.06)] border-[oklch(0.78_0.18_30/0.25)]",
      )}
    >
      <p className="flex items-center gap-2 text-sm font-bold text-[oklch(0.78_0.18_30)]">
        <AlertTriangle className="size-4" /> Negative Rule
      </p>
      <ul className="mt-3 space-y-2.5">
        {rules.map((r, i) => (
          <li key={i} className="text-[12px] sm:text-[13px] leading-snug">
            <p>
              <span className="font-bold text-foreground">{r.label}:</span>{" "}
              <span className="text-foreground/85">{r.description}</span>
            </p>
            <p className="text-[oklch(0.78_0.18_30)] font-medium">
              <span className="font-semibold">Decay:</span> {r.decay}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// IMPROVE YOUR SCORE
// ============================================================

const IMPROVE_ICONS: Record<string, LucideIcon> = {
  "imp-intro-video": Video,
  "imp-video-testimonials": Users,
  "imp-recommendations": ThumbsUp,
  "imp-self-share": Share2,
  "imp-bonus": Sparkles,
  "imp-client-share": UserPlus,
  "imp-cot": Trophy,
};

function ScoreImproveCard({
  items,
  currentScore,
  potentialScore,
  onNavigateProfileSection,
  onShareProfile,
}: {
  items: ScoreImprovement[];
  currentScore: number;
  potentialScore: number;
  onNavigateProfileSection?: (section: AdvisorProfileSection) => void;
  onShareProfile?: () => void;
}) {
  if (items.length === 0) {
    return (
      <section
        className={cn(
          "yvity-on-dark relative overflow-hidden rounded-3xl border border-white/12 p-5 sm:p-6 text-center",
          "bg-gradient-to-br from-[oklch(0.24_0.05_240)] via-[oklch(0.20_0.04_230)] to-[oklch(0.16_0.03_220)]",
          "shadow-[0_22px_60px_-22px_oklch(0_0_0/0.55)]",
        )}
      >
        <BadgeCheck className="size-8 mx-auto text-[oklch(0.85_0.16_78)] mb-2" />
        <p className="font-bold text-white">You've reached the full YVITY Score.</p>
        <p className="mt-1 text-sm text-white/70">
          Keep your profile active to maintain it — see the negative-rule decays above.
        </p>
      </section>
    );
  }

  const handle = (it: ScoreImprovement) => {
    if (it.target.kind === "profile-section" && onNavigateProfileSection) {
      onNavigateProfileSection(it.target.section);
    } else if (it.target.kind === "share" && onShareProfile) {
      onShareProfile();
    }
  };

  return (
    <section
      className={cn(
        "yvity-on-dark relative overflow-hidden rounded-3xl border border-white/12",
        "bg-gradient-to-br from-[oklch(0.24_0.05_240)] via-[oklch(0.20_0.04_230)] to-[oklch(0.16_0.03_220)]",
        "shadow-[0_22px_60px_-22px_oklch(0_0_0/0.55)]",
        "animate-in fade-in slide-in-from-bottom-2 duration-500",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 right-1/3 size-60 rounded-full bg-[oklch(0.85_0.16_78/0.12)] blur-[110px]"
      />

      <header className="flex items-center gap-2 px-5 sm:px-6 pt-5 pb-3">
        <span className="inline-flex size-9 items-center justify-center rounded-2xl bg-[oklch(0.85_0.16_78/0.15)] ring-1 ring-[oklch(0.85_0.16_78/0.4)]">
          <Lightbulb className="size-4 text-[oklch(0.92_0.14_78)]" />
        </span>
        <h3 className="text-base font-bold tracking-tight text-white">Improve Your Score</h3>
      </header>

      <ul className="px-3 sm:px-4 pb-4 space-y-2">
        {items.map((it) => {
          const Icon = IMPROVE_ICONS[it.id] ?? Sparkles;
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => handle(it)}
                className={cn(
                  "group w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-2xl text-left",
                  "border border-white/10 bg-white/[0.04]",
                  "transition-all duration-300 ease-out",
                  "hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.99]",
                )}
              >
                <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 shrink-0">
                  <Icon className="size-4 text-[oklch(0.82_0.13_205)]" strokeWidth={2} />
                </span>
                <span className="flex-1 min-w-0 text-[13px] sm:text-sm font-medium text-white/95">
                  {it.label}
                </span>
                <span className="hidden xs:inline text-xs sm:text-sm font-bold text-[oklch(0.92_0.14_78)] shrink-0">
                  +{it.points} pts
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold shrink-0",
                    "border border-white/15 bg-white/[0.06] text-white",
                    "group-hover:bg-white/[0.12] group-hover:border-white/25",
                    "transition-colors duration-200",
                  )}
                >
                  {it.cta}
                  <ArrowRight className="size-3 sm:size-3.5" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <footer
        className={cn(
          "mx-3 sm:mx-4 mb-4 sm:mb-5 rounded-2xl px-4 py-3",
          "flex items-center justify-between gap-3",
          "border border-[oklch(0.85_0.16_78/0.35)] bg-[oklch(0.85_0.16_78/0.08)]",
        )}
      >
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs uppercase tracking-wider text-white/75">
            Potential score with all improvements
          </p>
          <p className="text-[11px] text-white/55 mt-0.5">Current : {currentScore}/100</p>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-[oklch(0.92_0.14_78)] tabular-nums whitespace-nowrap">
          {potentialScore}
          <span className="text-white/55 text-base font-medium">/100</span>
        </p>
      </footer>
    </section>
  );
}

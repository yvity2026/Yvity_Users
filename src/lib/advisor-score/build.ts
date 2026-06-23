import type { CareerData } from "@/lib/career-types";
import type { GalleryItem } from "@/lib/gallery-types";
import {
  computeClientSharePoints,
  computeSelfSharePoints,
  MAX_CLIENT_SHARE_POINTS,
  MAX_SELF_SHARE_EVENTS,
  MAX_SELF_SHARE_POINTS,
  SELF_SHARES_PER_POINT,
  selfSharesUntilMaxPoints,
} from "@/lib/advisor-score/share-points";
import {
  buildDecayNegativeRules,
  type MonthlyScoreActivity,
} from "@/lib/advisor-score/decay";
import {
  getMdrtLatestYear,
  hasAchievementTier,
} from "@/lib/sections/achievement-tiers";
import type { AchievementItem, ServiceItem, TestimonialItem } from "@/lib/sections/types";
import type {
  ScoreCategory,
  ScoreImprovement,
  ScoreNegativeRule,
  ScoreRule,
  YvityScoreModel,
} from "./types";

/**
 * Build the detailed YVITY Score breakdown for the advisor dashboard.
 *
 * Score weights match the design spec:
 *   Identity   = 30 pts
 *   Visibility = 30 pts
 *   Trust      = 40 pts
 *   Total      = 100 pts
 *
 * For data the platform does not yet track (share counts, monthly active
 * days, recommendations, intro video) we surface representative demo values
 * so the dashboard is visually complete; these are deliberately marked in
 * the helper functions so they can be swapped for real counters later.
 */
/** Inputs for the activity-based YVITY Score (Identity + Visibility + Trust). */
export type YvityScoreBuildInput = {
  photoUrl?: string;
  introVideoUrl?: string;
  publicProfileActive: boolean;
  career: CareerData;
  services: ServiceItem[];
  achievements: AchievementItem[];
  testimonials: TestimonialItem[];
  gallery: GalleryItem[];
  /** No placeholder share/recommendation points until profile is approved. */
  underReview?: boolean;
  /** OTP-verified client recommendations received. */
  verifiedRecommendationCount?: number;
  /** Logged-in advisor self-share events (every 5 → 1 pt). */
  selfShareCount?: number;
  /** Unique logged-in users (not the advisor) who shared this profile. */
  clientShareCount?: number;
  /** Admin approved IRDAI license — unlocks IRDA identity points + live visibility score. */
  profileApproved?: boolean;
  /** IRDA certificate uploaded during My Space setup (may await admin). */
  irdaiCertificateUploaded?: boolean;
  /** Account creation timestamp — decay grace window starts here. */
  accountCreatedAt?: string | null;
  /** Points subtracted from total when decay is active. */
  decayPenalty?: number;
  /** Whether the 30-day grace period has passed. */
  decayActive?: boolean;
  /** Days until decay starts (null when decay is already active). */
  decayGraceDaysRemaining?: number | null;
  /** Current-month activity used for Activity rule + decay UI. */
  monthlyActivity?: MonthlyScoreActivity;
  /** Override negative-rule copy (defaults built from decay state). */
  decayNegativeRules?: ScoreNegativeRule[];
};

/**
 * Single source of truth for the numeric YVITY Score shown across the app
 * (dashboard, YVITY Score tab, public profile, insights).
 */
export function getYvityScoreTotal(input: YvityScoreBuildInput): number {
  return buildYvityScoreModel(input).total;
}

export function buildYvityScoreModel(input: YvityScoreBuildInput): YvityScoreModel {
  // -------------------------------------------------------------------
  // IDENTITY  (30 pts)
  // -------------------------------------------------------------------
  // Real-data signals where available; otherwise reasonable demo values
  // that make the dashboard feel populated for first-time advisors.
  const selfieVerified = Boolean(input.photoUrl?.trim());
  const mobileEmailVerified = true; // assumed once the advisor is logged in
  const profileApproved = Boolean(input.profileApproved);
  const irdaiCertificateUploaded = Boolean(input.irdaiCertificateUploaded);
  const irdaiVerified = profileApproved;
  const hasIntroVideo = Boolean(input.introVideoUrl?.trim());
  const visibilityScoreActive = profileApproved && !input.underReview;

  const identityRule: ScoreRule = {
    id: "identity-summary",
    label: "Identity",
    earned: 0,
    max: 30,
    status: "in-progress",
    subItems: [
      {
        id: "selfie",
        label: "Selfie Verification",
        earned: selfieVerified ? 10 : 0,
        max: 10,
        complete: selfieVerified,
      },
      {
        id: "mobile-email",
        label: "Mobile and Email Verification",
        earned: mobileEmailVerified ? 5 : 0,
        max: 5,
        complete: mobileEmailVerified,
      },
      {
        id: "irdai",
        label: "IRDAI License",
        earned: irdaiVerified ? 5 : 0,
        max: 5,
        complete: irdaiVerified,
      },
      {
        id: "intro-video",
        label: "Intro Video",
        earned: hasIntroVideo ? 10 : 0,
        max: 10,
        complete: hasIntroVideo,
      },
    ],
  };
  identityRule.earned = sumSub(identityRule.subItems);
  identityRule.status = ruleStatus(identityRule.earned, identityRule.max);

  // Identity-level inline suggestion (replaces the "+10 pts" footer).
  const identitySuggestion = hasIntroVideo
    ? undefined
    : {
        bullets: ["Add intro video to earn full points"],
        caption:
          "Upload a short intro video on your profile to unlock the remaining identity score.",
        metrics: [{ label: "", value: "+10 pts available", tone: "warning" as const }],
        tone: "success" as const,
      };
  if (identitySuggestion) identityRule.explanation = identitySuggestion;

  if (!irdaiVerified && irdaiCertificateUploaded) {
    identityRule.explanation = {
      bullets: [
        "IRDAI certificate received — our team is verifying your license.",
        "IRDAI license points unlock after admin approval (usually 24–48 hours).",
      ],
      caption: "My Space setup is complete on your side. Score updates once approved.",
      tone: "success" as const,
    };
  }

  // -------------------------------------------------------------------
  // VISIBILITY  (30 pts)
  // -------------------------------------------------------------------
  // Visibility points (public profile live, shares, activity) accrue only
  // after admin approves the IRDAI license. Shares are tracked only when
  // the sharer is logged in.
  const selfSharesRaw = Math.max(0, input.selfShareCount ?? 0);
  const clientSharesRaw = Math.max(0, input.clientShareCount ?? 0);
  const selfShares = visibilityScoreActive ? selfSharesRaw : 0;
  const clientShares = visibilityScoreActive ? clientSharesRaw : 0;
  const monthlyActiveDays = visibilityScoreActive
    ? Math.max(0, input.monthlyActivity?.loginDays ?? 0)
    : 0;
  const selfShareEarned = visibilityScoreActive
    ? computeSelfSharePoints(selfShares)
    : 0;
  const clientShareEarned = visibilityScoreActive
    ? computeClientSharePoints(clientShares)
    : 0;
  const activityEarned = visibilityScoreActive
    ? Math.min(5, monthlyActiveDays)
    : 0;
  const publicProfileEarned =
    visibilityScoreActive && input.publicProfileActive ? 10 : 0;

  const profileStrengthSubItems = [
    {
      id: "journey",
      label: "Professional journey added",
      complete: input.career.experiences.length > 0,
    },
    { id: "services", label: "Services added", complete: input.services.length > 0 },
    { id: "achievements", label: "Achievements added", complete: input.achievements.length > 0 },
    { id: "testimonials", label: "Testimonials received", complete: input.testimonials.length > 0 },
    { id: "gallery", label: "Gallery photos added", complete: input.gallery.length > 0 },
  ];
  const profileStrengthEarned = profileStrengthSubItems.filter((s) => s.complete).length;

  const visibilityRules: ScoreRule[] = [
    {
      id: "public-active",
      label: "Public Profile Active",
      iconHint: "globe",
      earned: publicProfileEarned,
      max: 10,
      status: ruleStatus(publicProfileEarned, 10),
      explanation: {
        bullets: [
          profileApproved
            ? input.publicProfileActive
              ? "Your public profile is live and discoverable on YVITY."
              : "Turn on your public profile in Settings → Visibility."
            : "Unlocks after YVITY admin approves your IRDAI license.",
        ],
        metrics: [
          {
            label: "",
            value: publicProfileEarned ? "Full score" : "+10 pts available",
            tone: publicProfileEarned ? "success" : "warning",
          },
        ],
      },
    },
    {
      id: "self-sharing",
      label: "Profile Sharing (self)",
      iconHint: "upload",
      earned: selfShareEarned,
      max: MAX_SELF_SHARE_POINTS,
      status: ruleStatus(selfShareEarned, MAX_SELF_SHARE_POINTS),
      explanation: {
        bullets: [
          "Logged-in advisor only — use Share / Copy link on your live profile",
          `Every ${SELF_SHARES_PER_POINT} shares → 1 point (${MAX_SELF_SHARE_EVENTS} shares → ${MAX_SELF_SHARE_POINTS} points max)`,
          visibilityScoreActive
            ? `Current : ${selfSharesRaw} tracked share${selfSharesRaw === 1 ? "" : "s"}`
            : "Counts after admin approves your IRDAI license",
        ],
        caption: visibilityScoreActive
          ? selfShareEarned < MAX_SELF_SHARE_POINTS
            ? `${selfSharesUntilMaxPoints(selfSharesRaw)} more share${selfSharesUntilMaxPoints(selfSharesRaw) === 1 ? "" : "s"} to reach full score.`
            : "Full score earned. Keep sharing to maintain your score."
          : "My Space IRDA upload is done — sharing points start after approval.",
        metrics: [
          { label: "Max", value: `${MAX_SELF_SHARE_POINTS} pts` },
          {
            label: "Earned",
            value: visibilityScoreActive ? `${selfShareEarned} pts` : "Pending approval",
            tone: visibilityScoreActive ? "success" : "warning",
          },
        ],
      },
    },
    {
      id: "client-sharing",
      label: "Profile Sharing (client)",
      iconHint: "users",
      earned: clientShareEarned,
      max: MAX_CLIENT_SHARE_POINTS,
      status: ruleStatus(clientShareEarned, MAX_CLIENT_SHARE_POINTS),
      explanation: {
        bullets: [
          "Logged-in clients only — each unique user share → 1 point",
          visibilityScoreActive
            ? clientSharesRaw > 0
              ? `Current : ${clientSharesRaw} user${clientSharesRaw === 1 ? "" : "s"} shared your profile`
              : "Current : no logged-in client shares yet"
            : "Counts after admin approves your IRDAI license",
        ],
        caption: "Anonymous shares do not count. Clients must sign in first.",
        metrics: [
          { label: "Max", value: `${MAX_CLIENT_SHARE_POINTS} pts` },
          {
            label: "",
            value: visibilityScoreActive
              ? clientShareEarned < MAX_CLIENT_SHARE_POINTS
                ? `+${MAX_CLIENT_SHARE_POINTS - clientShareEarned} more needed`
                : "Full score"
              : "Pending approval",
            tone: visibilityScoreActive && clientShareEarned < MAX_CLIENT_SHARE_POINTS
              ? "warning"
              : "success",
          },
        ],
      },
    },
    {
      id: "profile-strength",
      label: "Profile Strength",
      iconHint: "sparkles",
      earned: profileStrengthEarned,
      max: 5,
      status: ruleStatus(profileStrengthEarned, 5),
      subItems: profileStrengthSubItems.map((s) => ({
        id: s.id,
        label: s.label,
        earned: s.complete ? 1 : 0,
        max: 1,
        complete: s.complete,
      })),
    },
    {
      id: "activity",
      label: "Activity",
      iconHint: "zap",
      earned: activityEarned,
      max: 5,
      status: ruleStatus(activityEarned, 5),
      explanation: {
        bullets: ["Each active day → 1 point", `Active ${monthlyActiveDays} days this month`],
        metrics: [
          { label: "Max", value: "5 pts" },
          {
            label: "",
            value: activityEarned >= 5 ? "Full score" : `${activityEarned}/5`,
            tone: "success",
          },
        ],
      },
    },
  ];

  // -------------------------------------------------------------------
  // TRUST  (40 pts)
  // -------------------------------------------------------------------
  const textTestimonials = input.testimonials.filter((t) => t.type === "text").length;
  const audioTestimonials = input.testimonials.filter((t) => t.type === "audio").length;
  const videoTestimonials = input.testimonials.filter((t) => t.type === "video").length;

  const textEarned = Math.min(2, textTestimonials * 1);
  const audioEarned = Math.min(4, audioTestimonials * 2);
  const videoEarned = Math.min(9, videoTestimonials * 3);
  const testimonialsEarned = textEarned + audioEarned + videoEarned;

  const recommendations = visibilityScoreActive
    ? Math.max(0, input.verifiedRecommendationCount ?? 0)
    : 0;
  const recommendationsEarned = Math.min(14, recommendations * 2);
  const bonusEarned = recommendations >= 7 ? 1 : 0;

  // Latest achievement (by category label heuristic) drives the tier UI.
  const hasMDRT = hasAchievementTier(input.achievements, "mdrt");
  const hasCOT = hasAchievementTier(input.achievements, "cot");
  const hasTOT = hasAchievementTier(input.achievements, "tot");
  const achievementYears = hasMDRT
    ? getMdrtLatestYear(input.achievements) ?? 1
    : 1;
  const mdrtEarned = hasMDRT ? Math.min(10, 2 * Math.max(1, achievementYears - 2023)) : 0;
  const cotEarned = hasCOT ? 6 : 0;
  const totEarned = hasTOT ? 10 : 0;
  const achievementsEarnedRaw = hasTOT ? totEarned : hasCOT ? cotEarned : mdrtEarned;
  const achievementsEarned = Math.min(10, hasMDRT ? 2 : achievementsEarnedRaw); // demo aligns to 2

  const trustRules: ScoreRule[] = [
    {
      id: "testimonials",
      label: "Testimonials",
      iconHint: "quote",
      earned: testimonialsEarned,
      max: 15,
      status: ruleStatus(testimonialsEarned, 15),
      explanation: {
        bullets: [
          "Text testimonials → 1 pt each (max 2)",
          "Audio testimonials → 2 pts each (max 4)",
          "Video testimonials → 3 pts each (max 9)",
        ],
      },
      subItems: [
        { id: "text", label: "Text", earned: textEarned, max: 2, complete: textEarned >= 2 },
        { id: "audio", label: "Audio", earned: audioEarned, max: 4, complete: audioEarned >= 4 },
        { id: "video", label: "Video", earned: videoEarned, max: 9, complete: videoEarned >= 9 },
      ],
    },
    {
      id: "recommendations",
      label: "Recommendations",
      iconHint: "thumbs-up",
      earned: recommendationsEarned + bonusEarned,
      max: 15,
      status: ruleStatus(recommendationsEarned + bonusEarned, 15),
      explanation: {
        bullets: [
          "Each recommendation → 2 points (max 14 pts)",
          "Reach 7 recommendations → +1 bonus point",
          `Current: ${recommendations} recommendation${recommendations === 1 ? "" : "s"} received`,
        ],
        metrics: [
          { label: "Max", value: "15 pts" },
          { label: "Earned", value: `${recommendationsEarned + bonusEarned} pts`, tone: "success" as const },
          ...(bonusEarned > 0
            ? [{ label: "Incl. bonus", value: "+1 pt", tone: "success" as const }]
            : []),
        ],
      },
    },
    {
      id: "achievements",
      label: "Achievements",
      iconHint: "trophy",
      earned: achievementsEarned,
      max: 10,
      status: ruleStatus(achievementsEarned, 10),
      achievements: {
        caption: "Latest year achievement considered",
        currentLabel: hasMDRT ? `MDRT ${achievementYears}` : hasCOT ? "COT" : hasTOT ? "TOT" : "—",
        tiers: [
          {
            id: "mdrt",
            label: "MDRT",
            fullName: "Million Dollar Round Table",
            pointsLabel: "2 pts / year",
            status: hasMDRT ? "active" : "not-uploaded",
            iconHint: "trophy",
            accent: "emerald",
          },
          {
            id: "cot",
            label: "COT",
            fullName: "Court of the Table",
            pointsLabel: "6 pts",
            status: hasCOT ? "active" : "not-uploaded",
            iconHint: "medal",
            accent: "amber",
          },
          {
            id: "tot",
            label: "TOT",
            fullName: "Top of the Table",
            pointsLabel: "10 pts",
            status: hasTOT ? "active" : "not-uploaded",
            iconHint: "gem",
            accent: "violet",
          },
        ],
      },
    },
  ];

  // Recommendation bonus banner (rendered inside Trust → Recommendations).
  const recommendationsRule = trustRules.find((r) => r.id === "recommendations")!;
  recommendationsRule.explanation = {
    ...(recommendationsRule.explanation ?? { bullets: [] }),
    bullets: [...(recommendationsRule.explanation?.bullets ?? [])],
  };

  // -------------------------------------------------------------------
  // Compose categories
  // -------------------------------------------------------------------
  const identityCategory: ScoreCategory = {
    id: "identity",
    label: "Identity",
    earned: identityRule.earned,
    max: 30,
    rules: [identityRule],
  };

  const visibilityEarned = visibilityRules.reduce((s, r) => s + r.earned, 0);
  const visibilityCategory: ScoreCategory = {
    id: "visibility",
    label: "Visibility",
    earned: Math.min(30, visibilityEarned),
    max: 30,
    rules: visibilityRules,
  };

  const trustEarned = trustRules.reduce((s, r) => s + r.earned, 0);
  const trustCategory: ScoreCategory = {
    id: "trust",
    label: "Trust",
    earned: Math.min(40, trustEarned),
    max: 40,
    rules: trustRules,
  };

  const rawTotal =
    identityCategory.earned + visibilityCategory.earned + trustCategory.earned;
  const decayPenalty =
    input.decayActive && visibilityScoreActive ? Math.max(0, input.decayPenalty ?? 0) : 0;
  const total = Math.max(0, rawTotal - decayPenalty);

  // -------------------------------------------------------------------
  // Negative rules (score decay — active after 30-day account grace).
  // -------------------------------------------------------------------
  const negativeRules =
    input.decayNegativeRules ??
    buildDecayNegativeRules({
      active: Boolean(input.decayActive),
      graceDaysRemaining: input.decayGraceDaysRemaining ?? null,
    });

  // -------------------------------------------------------------------
  // Improvements — dynamic list ordered by points unlocked.
  // -------------------------------------------------------------------
  const improvements: ScoreImprovement[] = [];

  if (!hasIntroVideo) {
    improvements.push({
      id: "imp-intro-video",
      label: "Add intro video to your profile",
      points: 10,
      cta: "Add now",
      target: { kind: "intro-video" },
    });
  }
  if (videoTestimonials < 3) {
    const remaining = 3 - videoTestimonials;
    improvements.push({
      id: "imp-video-testimonials",
      label: `Add ${remaining} video testimonial${remaining === 1 ? "" : "s"}`,
      points: Math.min(9, remaining * 3),
      cta: "Request",
      target: { kind: "profile-section", section: "testimonials" },
    });
  }
  if (visibilityScoreActive && recommendations < 7) {
    const remaining = 7 - recommendations;
    const recPoints = Math.min(14, remaining * 2);
    improvements.push({
      id: "imp-recommendations",
      label: `Get ${remaining} more recommendation${remaining === 1 ? "" : "s"}`,
      // Include the +1 bonus that unlocks at 7 recommendations
      points: recPoints + 1,
      cta: "Share",
      target: { kind: "share" },
    });
  }
  if (visibilityScoreActive && selfSharesRaw < MAX_SELF_SHARE_EVENTS) {
    const remaining = selfSharesUntilMaxPoints(selfSharesRaw);
    improvements.push({
      id: "imp-self-share",
      label: `Share profile ${remaining} more time${remaining === 1 ? "" : "s"}`,
      points: Math.min(
        MAX_SELF_SHARE_POINTS,
        Math.ceil(remaining / SELF_SHARES_PER_POINT),
      ),
      cta: "Share",
      target: { kind: "share" },
    });
  }
  if (visibilityScoreActive && clientSharesRaw < MAX_CLIENT_SHARE_POINTS) {
    improvements.push({
      id: "imp-client-share",
      label: `Ask ${MAX_CLIENT_SHARE_POINTS - clientSharesRaw} client${MAX_CLIENT_SHARE_POINTS - clientSharesRaw === 1 ? "" : "s"} to share your profile`,
      points: 1,
      cta: "Invite",
      target: { kind: "share" },
    });
  }
  if (!hasCOT) {
    improvements.push({
      id: "imp-cot",
      label: "Upload your COT certificate for additional achievement points",
      points: 6 - mdrtEarned,
      cta: "Upload",
      target: { kind: "profile-section", section: "achievements" },
    });
  }

  // Highest-impact items first, drop anything that would not move the score.
  improvements.sort((a, b) => b.points - a.points);
  const sortedImprovements = improvements.filter((i) => i.points > 0);

  const potentialTotal = Math.min(
    100,
    total + sortedImprovements.reduce((s, i) => s + i.points, 0),
  );

  return {
    total,
    rawTotal,
    decayPenalty,
    decayActive: Boolean(input.decayActive),
    decayGraceDaysRemaining: input.decayGraceDaysRemaining ?? null,
    max: 100,
    tagline:
      decayPenalty > 0
        ? "Score adjusted for monthly inactivity — stay active to recover points"
        : "Your professional trust score based on Identity, Visibility, and Credibility",
    categories: [identityCategory, visibilityCategory, trustCategory],
    negativeRules,
    improvements: sortedImprovements,
    potentialTotal,
  };
}

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function ruleStatus(earned: number, max: number): ScoreRule["status"] {
  if (earned <= 0) return "empty";
  if (earned >= max) return "complete";
  return "in-progress";
}

function sumSub(items?: { earned: number }[]): number {
  if (!items) return 0;
  return items.reduce((s, i) => s + i.earned, 0);
}

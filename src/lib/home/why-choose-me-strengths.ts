import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  FileCheck,
  HeartHandshake,
  Layers,
  MapPin,
  Shield,
  Sparkles,
  Star,
  ThumbsUp,
  Trophy,
  Users,
} from "lucide-react";
import { computeHighestClientsCount } from "@/lib/advisor/profession-experience";
import type { CareerData } from "@/lib/career-types";
import { formatMdrtStatusLabel } from "@/lib/sections/achievement-tiers";
import { resolvePrimaryCompanyName } from "@/lib/home/public-profile-banner-stats";
import { categoryHeadingFor } from "@/lib/sections/services-config";
import type { AchievementItem, ServiceCategory, ServiceItem } from "@/lib/sections/types";
import { isServiceVisibleOnPublicProfile } from "@/lib/verification/defaults";

export type WhyChooseMeStrength = {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  ring: string;
};

export type WhyChooseMeProfileInput = {
  achievements?: Pick<AchievementItem, "title" | "subtitle" | "years">[];
  services?: ServiceItem[];
  career?: CareerData;
  profileApproved?: boolean;
  experienceDisplay?: string;
  journeyExperienceDisplay?: string;
  avgRating?: number | null;
  testimonialCount?: number;
  recommendationCount?: number;
  city?: string;
  state?: string;
  profession?: string;
  about?: string;
  companyName?: string;
};

const strengthAccents = [
  {
    accent: "from-[oklch(0.85_0.16_78)] to-[oklch(0.72_0.15_55)]",
    glow: "bg-[oklch(0.85_0.16_78/0.18)]",
    ring: "ring-[oklch(0.85_0.16_78/0.35)]",
  },
  {
    accent: "from-[oklch(0.82_0.13_205)] to-primary",
    glow: "bg-[oklch(0.82_0.13_205/0.18)]",
    ring: "ring-[oklch(0.82_0.13_205/0.35)]",
  },
  {
    accent: "from-[oklch(0.78_0.16_162)] to-[oklch(0.62_0.12_185)]",
    glow: "bg-[oklch(0.78_0.16_162/0.18)]",
    ring: "ring-[oklch(0.78_0.16_162/0.35)]",
  },
  {
    accent: "from-[oklch(0.78_0.15_295)] to-[oklch(0.58_0.14_260)]",
    glow: "bg-[oklch(0.78_0.15_295/0.18)]",
    ring: "ring-[oklch(0.78_0.15_295/0.35)]",
  },
  {
    accent: "from-[oklch(0.82_0.13_205)] to-[oklch(0.72_0.11_198)]",
    glow: "bg-[oklch(0.82_0.13_205/0.15)]",
    ring: "ring-[oklch(0.82_0.13_205/0.3)]",
  },
  {
    accent: "from-[oklch(0.85_0.16_78)] to-[oklch(0.78_0.14_162)]",
    glow: "bg-[oklch(0.85_0.16_78/0.14)]",
    ring: "ring-[oklch(0.85_0.16_78/0.3)]",
  },
] as const;

const MAX_STRENGTHS = 6;
const MIN_STRENGTHS = 4;

type StrengthCandidate = {
  id: string;
  label: string;
  icon: LucideIcon;
  priority: number;
};

function visibleServices(services: ServiceItem[], profileApproved: boolean): ServiceItem[] {
  return services.filter((item) => isServiceVisibleOnPublicProfile(item, profileApproved));
}

function shortCategoryLabel(category: ServiceCategory): string {
  return categoryHeadingFor(category).replace(" Insurance", "").replace(" Funds", "");
}

/** e.g. "Life & Health Insurance Specialist" from saved service cards. */
export function buildServiceSpecialtyLabel(
  services: ServiceItem[],
  profileApproved: boolean,
): string | null {
  const visible = visibleServices(services, profileApproved);
  const categories = [...new Set(visible.map((item) => item.category))];
  const insurance = categories.filter((category) => category !== "mutual");
  const focus = insurance.length > 0 ? insurance : categories;

  if (focus.length === 0) return null;
  if (focus.length === 1) return `${categoryHeadingFor(focus[0])} Specialist`;
  if (focus.length === 2) {
    return `${shortCategoryLabel(focus[0])} & ${shortCategoryLabel(focus[1])} Specialist`;
  }
  return "Multi-Line Insurance Expertise";
}

function buildServingLocationLabel(city?: string, state?: string): string | null {
  const cityText = city?.trim();
  const stateText = state?.trim();
  if (!cityText && !stateText) return null;
  if (cityText && stateText) return `Serving ${cityText}, ${stateText}`;
  return `Serving ${cityText || stateText}`;
}

function computeVisibleClaimsTotal(services: ServiceItem[], profileApproved: boolean): number {
  let total = 0;
  for (const service of visibleServices(services, profileApproved)) {
    const claims = Number(service.claims ?? 0);
    if (Number.isFinite(claims) && claims > 0) total += claims;
  }
  return total;
}

function formatClientsLabel(count: number): string {
  if (count >= 100) return `${count}+ Clients Served`;
  return `Trusted by ${count} Client${count === 1 ? "" : "s"}`;
}

function formatRecommendationsLabel(count: number): string {
  if (count === 1) return "1 Verified Recommendation";
  return `${count} Verified Recommendations`;
}

function formatRatingLabel(avgRating: number, testimonialCount: number): string {
  if (testimonialCount === 1) return `${avgRating}/5 Client Rating`;
  return `${avgRating}/5 from ${testimonialCount} Testimonials`;
}

function collectStrengthCandidates(input: WhyChooseMeProfileInput): StrengthCandidate[] {
  const achievements = input.achievements ?? [];
  const services = input.services ?? [];
  const profileApproved = Boolean(input.profileApproved);
  const experienceDisplay = input.experienceDisplay?.trim() || "";
  const journeyExperienceDisplay = input.journeyExperienceDisplay?.trim() || "";
  const testimonialCount = Math.max(0, input.testimonialCount ?? 0);
  const recommendationCount = Math.max(0, input.recommendationCount ?? 0);
  const careerRoles = input.career?.experiences.length ?? 0;
  const companyName =
    input.companyName?.trim() ||
    resolvePrimaryCompanyName(services, profileApproved);
  const clientsServed = computeHighestClientsCount(visibleServices(services, profileApproved));
  const claimsTotal = computeVisibleClaimsTotal(services, profileApproved);

  const candidates: StrengthCandidate[] = [];

  if (profileApproved) {
    candidates.push({
      id: "yvity",
      label: "Verified by YVITY",
      icon: BadgeCheck,
      priority: 100,
    });
  }

  const mdrtLabel = formatMdrtStatusLabel(achievements);
  if (mdrtLabel !== "—") {
    candidates.push({
      id: "mdrt",
      label: `${mdrtLabel} Recognized`,
      icon: Trophy,
      priority: 90,
    });
  }

  if (experienceDisplay) {
    candidates.push({
      id: "experience",
      label: `${experienceDisplay} Experience`,
      icon: Briefcase,
      priority: 85,
    });
  }

  if (input.avgRating != null && testimonialCount > 0) {
    candidates.push({
      id: "rating",
      label: formatRatingLabel(input.avgRating, testimonialCount),
      icon: Star,
      priority: 80,
    });
  }

  if (recommendationCount > 0) {
    candidates.push({
      id: "recommendations",
      label: formatRecommendationsLabel(recommendationCount),
      icon: ThumbsUp,
      priority: 75,
    });
  }

  if (clientsServed > 0) {
    candidates.push({
      id: "clients",
      label: formatClientsLabel(clientsServed),
      icon: Users,
      priority: 70,
    });
  }

  const specialty = buildServiceSpecialtyLabel(services, profileApproved);
  if (specialty) {
    candidates.push({
      id: "specialty",
      label: specialty,
      icon: Layers,
      priority: 65,
    });
  }

  if (companyName) {
    candidates.push({
      id: "company",
      label: `${companyName} Advisor`,
      icon: Building2,
      priority: 60,
    });
  }

  const serving = buildServingLocationLabel(input.city, input.state);
  if (serving) {
    candidates.push({
      id: "location",
      label: serving,
      icon: MapPin,
      priority: 55,
    });
  }

  if (claimsTotal > 0) {
    candidates.push({
      id: "claims",
      label: `${claimsTotal}+ Claims Supported`,
      icon: FileCheck,
      priority: 50,
    });
  }

  if (
    careerRoles > 0 &&
    journeyExperienceDisplay &&
    journeyExperienceDisplay !== experienceDisplay
  ) {
    candidates.push({
      id: "career-depth",
      label:
        careerRoles === 1
          ? "Diverse Professional Background"
          : `Career Across ${careerRoles} Roles`,
      icon: Briefcase,
      priority: 45,
    });
  }

  candidates.sort((a, b) => b.priority - a.priority);

  const picked = candidates.slice(0, MAX_STRENGTHS);
  const usedIds = new Set(picked.map((item) => item.id));

  if (picked.length >= MIN_STRENGTHS) return picked;

  const fallbacks: StrengthCandidate[] = [];

  if (profileApproved && !usedIds.has("irda")) {
    fallbacks.push({
      id: "irda",
      label: "IRDA Licensed Professional",
      icon: Shield,
      priority: 10,
    });
  }

  const genericFallbacks: Array<Omit<StrengthCandidate, "priority">> = [
    { id: "guidance", label: "Personalized Financial Guidance", icon: Sparkles },
    { id: "customer", label: "Customer-Centric Approach", icon: HeartHandshake },
    { id: "claims-generic", label: "Claim Support Assistance", icon: FileCheck },
  ];

  for (const item of genericFallbacks) {
    if (picked.length + fallbacks.length >= MIN_STRENGTHS) break;
    if (usedIds.has(item.id)) continue;
    fallbacks.push({ ...item, priority: 5 });
    usedIds.add(item.id);
  }

  return [...picked, ...fallbacks].slice(0, MAX_STRENGTHS);
}

/** One-line intro for the section — prefers About, then profile facts. */
export function buildWhyChooseMeIntro(input: {
  about?: string;
  profession?: string;
  city?: string;
  state?: string;
  experienceDisplay?: string;
}): string {
  const about = input.about?.trim();
  if (about && about.length >= 24) {
    const firstSentence = about.split(/[.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length >= 24) {
      return firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
    }
    return about.length > 160 ? `${about.slice(0, 157).trim()}…` : about;
  }

  const location = [input.city?.trim(), input.state?.trim()].filter(Boolean).join(", ");
  const role = input.profession?.trim() || "insurance advisor";
  const experience = input.experienceDisplay?.trim();

  if (experience && location) {
    return `${experience} experience as a ${role} in ${location} — licensed guidance and support built around your goals.`;
  }
  if (experience) {
    return `${experience} experience helping clients with insurance and financial planning — guidance built around your goals, not generic sales pitches.`;
  }
  if (location) {
    return `Licensed ${role} serving ${location} — hands-on support and guidance built around your goals.`;
  }

  return "Licensed expertise, hands-on support, and guidance built around your goals — not generic sales pitches.";
}

/** Advisor strengths for the home “Why Choose Me” grid — built from saved profile data. */
export function getWhyChooseMeStrengths(input: WhyChooseMeProfileInput = {}): WhyChooseMeStrength[] {
  const candidates = collectStrengthCandidates(input);

  return candidates.map((item, index) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
    ...strengthAccents[index % strengthAccents.length],
  }));
}

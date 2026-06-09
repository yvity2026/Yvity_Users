import type { ProfileHeroStat } from "@/lib/advisor/profile-hero-stat";
import type { ServiceCapacityId } from "@/lib/advisor/serviceCapacity";
import type { ServiceCategory } from "@/lib/sections/types";
import type { DashboardAdvisor, DashboardUser } from "@/context/AuthUserContext";

/** Static copy labels — not advisor-specific demo data. */
export const ADVISOR_PROFILE_LABELS = {
  journeyHeadline: "My Journey",
  journeyLabel: "Professional Profile",
  journeyDescription:
    "Add your career story, certifications, and education so clients understand your background.",
  ctaDescription:
    "Share how you help clients — your services and contact details appear here once you fill your profile.",
  consultationHref: "/login",
  home: {
    heroBio: "" as string,
    headline: "How Can I Help?",
    introVideoLabel: "Intro video",
    introVideoDuration: "",
    introVideoUrl: "" as string | undefined,
    introVideoPosterUrl: "" as string | undefined,
    yearsExperience: "",
    heroBadges: [] as { label: string; caption: string; tone: "amber" | "cyan" | "emerald" }[],
    serviceChips: [] as { category: ServiceCategory; label: string; href: string }[],
  },
  defaultHighlights: [
    { label: "Verified credentials" },
    { label: "Flexible consultation" },
    { label: "Direct advisor contact" },
  ],
} as const;

export type AdvisorDisplayProfile = {
  slug: string;
  name: string;
  title: string;
  photoUrl?: string;
  journeyHeadline: string;
  journeyLabel: string;
  journeyDescription: string;
  ctaDescription: string;
  rating: number | null;
  /** @deprecated Use profileHeroStat.value — kept for older call sites */
  clientsCount: string;
  profileHeroStat: ProfileHeroStat;
  profileCapacityId: ServiceCapacityId;
  phone: string;
  email: string;
  location: string;
  officeLocation?: { label: string; latitude?: number; longitude?: number };
  companyName: string;
  mdrtMember: boolean;
  experienceDisplay: string;
  whatsapp: string;
  consultationHref: string;
  stats: { value: string; label: string }[];
  highlights: { label: string }[];
  home: typeof ADVISOR_PROFILE_LABELS.home;
};

export function buildAdvisorDisplayProfile(input: {
  user?: DashboardUser | null;
  advisor?: DashboardAdvisor | null;
  designation?: string;
}): AdvisorDisplayProfile {
  const name = input.user?.name?.trim() || "Your name";
  const slug = input.advisor?.profile_slug?.trim() || "your-profile";
  const title =
    input.designation?.trim() ||
    input.user?.profession?.trim() ||
    "Insurance & financial advisor";
  const phone = input.user?.phone?.trim() || input.user?.mobile?.trim() || "";
  const email = input.user?.email?.trim() || "";
  const city = input.user?.city?.trim() || "";
  const state = input.user?.state?.trim() || "";
  const location = [city, state].filter(Boolean).join(", ") || "Add your city in profile settings";
  const officeLabel = [city, state].filter(Boolean).join(", ");
  const whatsapp = phone ? `91${phone.replace(/\D/g, "").slice(-10)}` : "";
  const aboutText = input.user?.about?.trim() || "";

  return {
    slug,
    name,
    title,
    photoUrl: input.user?.selfie_url?.trim() || undefined,
    ...ADVISOR_PROFILE_LABELS,
    ctaDescription: aboutText || ADVISOR_PROFILE_LABELS.ctaDescription,
    rating: null,
    clientsCount: "—",
    profileHeroStat: {
      value: "—",
      label: "Clients",
      ctaLabel: "Satisfied Clients",
      highlightLabel: "",
      capacityId: "individual_agent",
    },
    profileCapacityId: "individual_agent",
    phone: phone ? `+91 ${phone}` : "Add mobile number",
    email: email || "Add email",
    location,
    officeLocation: officeLabel ? { label: officeLabel } : undefined,
    companyName: "",
    mdrtMember: false,
    experienceDisplay: "",
    whatsapp,
    stats: [],
    highlights: [...ADVISOR_PROFILE_LABELS.defaultHighlights],
    home: {
      ...ADVISOR_PROFILE_LABELS.home,
      heroBio: aboutText || ADVISOR_PROFILE_LABELS.home.heroBio,
    },
  };
}

/** Apply My Account “About you” copy to CTA + hero bio fields. */
export function applyAboutToDisplayProfile(
  profile: AdvisorDisplayProfile,
  about?: string | null,
): AdvisorDisplayProfile {
  const aboutText = about?.trim() || "";
  if (!aboutText) return profile;

  return {
    ...profile,
    ctaDescription: aboutText,
    home: {
      ...profile.home,
      heroBio: aboutText,
    },
  };
}

/** @deprecated Import buildAdvisorDisplayProfile or useAdvisorDisplayProfile instead. */
export const advisorProfile = buildAdvisorDisplayProfile({});

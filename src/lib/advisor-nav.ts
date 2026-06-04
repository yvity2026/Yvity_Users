import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  Crown,
  Gauge,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  Quote,
  Settings,
  Sparkles,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

/** Top-level advisor dashboard sections (navigation only — modules built later). */
export type AdvisorTopSection =
  | "dashboard"
  | "public-profile"
  | "leads"
  | "profile"
  | "insights"
  | "membership"
  | "settings";

/** Profile Management sub-sections (existing editable showcases). */
export type AdvisorProfileSection =
  | "profile"
  | "services"
  | "achievements"
  | "testimonials"
  | "gallery"
  | "score";

export type AdvisorNavItem<T extends string> = {
  id: T;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  description: string;
};

export const ADVISOR_TOP_NAV: AdvisorNavItem<AdvisorTopSection>[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Your growth snapshot, priorities and quick actions.",
  },
  {
    id: "public-profile",
    label: "Public Profile",
    icon: Globe,
    description: "Preview your live profile page and share it with prospects.",
  },
  {
    id: "leads",
    label: "Leads",
    icon: Users,
    description: "Inbound interest, callbacks and follow-ups in one place.",
  },
  {
    id: "profile",
    label: "Profile Management",
    shortLabel: "Profile",
    icon: UserRound,
    description: "Shape your public YVITY profile — career, services and proof.",
  },
  {
    id: "insights",
    label: "Insights",
    icon: BarChart3,
    description: "Profile views, engagement and what drives conversions.",
  },
  {
    id: "membership",
    label: "Membership",
    shortLabel: "Plan",
    icon: Crown,
    description: "Your YVITY plan, benefits and verification status.",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Account, notifications, privacy and security preferences.",
  },
];

export const ADVISOR_PROFILE_NAV: AdvisorNavItem<AdvisorProfileSection>[] = [
  {
    id: "profile",
    label: "My Career",
    icon: Briefcase,
    description: "Experience, education and certifications on your public profile.",
  },
  {
    id: "services",
    label: "Services",
    icon: Sparkles,
    description: "Insurance and advisory services you offer to clients.",
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Trophy,
    description: "Awards, milestones and credibility highlights.",
  },
  {
    id: "testimonials",
    label: "Testimonials",
    icon: Quote,
    description: "Client stories, replies and testimonial requests.",
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: ImageIcon,
    description: "Photos and media that showcase your professional presence.",
  },
  {
    id: "score",
    label: "YVITY Score",
    icon: Gauge,
    description:
      "Detailed breakdown of your profile trust score with improvement suggestions. Dashboard-only.",
  },
];

export const DEFAULT_TOP_SECTION: AdvisorTopSection = "dashboard";
export const DEFAULT_PROFILE_SECTION: AdvisorProfileSection = "profile";

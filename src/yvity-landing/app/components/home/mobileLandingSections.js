import {
  CircleHelp,
  CreditCard,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";

/** Mobile section hub + panel navigation (content unchanged; routing only). */
export const MOBILE_LANDING_SECTIONS = [
  {
    id: "how-it-works",
    label: "How It Works",
    description: "Build your profile and earn trust step by step",
    icon: Sparkles,
  },
  {
    id: "find-advisors",
    label: "Find Advisors",
    description: "Search verified advisors near you",
    icon: Search,
  },
  {
    id: "testimonials",
    label: "Reviews",
    description: "Real experiences from advisors and clients",
    icon: MessageCircle,
  },
  {
    id: "pricing",
    label: "Plans & Pricing",
    description: "Free, Silver, and Gold membership options",
    icon: CreditCard,
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Answers about YVITY, plans, and verification",
    icon: CircleHelp,
  },
];

export function getMobileSectionMeta(sectionId) {
  return MOBILE_LANDING_SECTIONS.find((section) => section.id === sectionId);
}

import {
  ADVISOR_PROFILE_NAV,
  ADVISOR_TOP_NAV,
  type AdvisorProfileSection,
  type AdvisorTopSection,
} from "@/lib/advisor-nav";
import type { LucideIcon } from "lucide-react";

export type MySpaceSectionKey = `top:${AdvisorTopSection}` | `profile:${AdvisorProfileSection}`;

export type MySpaceSectionCard = {
  key: MySpaceSectionKey;
  label: string;
  description: string;
  icon: LucideIcon;
  group?: string;
};

export function mySpaceKeyTop(section: AdvisorTopSection): MySpaceSectionKey {
  return `top:${section}`;
}

export function mySpaceKeyProfile(section: AdvisorProfileSection): MySpaceSectionKey {
  return `profile:${section}`;
}

export function parseMySpaceSectionKey(key: MySpaceSectionKey): {
  topSection: AdvisorTopSection | null;
  profileSection: AdvisorProfileSection | null;
} {
  if (key.startsWith("top:")) {
    return { topSection: key.slice(4) as AdvisorTopSection, profileSection: null };
  }
  if (key.startsWith("profile:")) {
    return { topSection: "profile", profileSection: key.slice(8) as AdvisorProfileSection };
  }
  return { topSection: null, profileSection: null };
}

/** Flat card list for My Space hub (top nav + profile sub-sections). */
export const MY_SPACE_SECTION_CARDS: MySpaceSectionCard[] = [
  ...ADVISOR_TOP_NAV.filter((item) => item.id !== "profile").map((item) => ({
    key: mySpaceKeyTop(item.id),
    label: item.label,
    description: item.description,
    icon: item.icon,
  })),
  ...ADVISOR_PROFILE_NAV.map((item) => ({
    key: mySpaceKeyProfile(item.id),
    label: item.label,
    description: item.description,
    icon: item.icon,
    group: "Profile Management",
  })),
];

export function getMySpaceSectionCard(key: MySpaceSectionKey): MySpaceSectionCard | undefined {
  return MY_SPACE_SECTION_CARDS.find((c) => c.key === key);
}

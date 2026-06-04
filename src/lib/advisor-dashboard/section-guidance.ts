import type { ProfileHealthItem } from "./types";

/** Health checklist ids — must match `buildProfileHealth`. */
export type ProfileHealthId = ProfileHealthItem["id"];

export type SectionGuidanceCopy = {
  title: string;
  description: string;
  /** Shown as a small goal line (e.g. "2 testimonials recommended"). */
  goal?: string;
};

export const SECTION_GUIDANCE: Record<ProfileHealthId, SectionGuidanceCopy> = {
  photo: {
    title: "Profile photo",
    description:
      "Your registration selfie is your default public photo. If it is missing, complete identity verification again from Profile & account.",
    goal: "Verified selfie on file",
  },
  "intro-video": {
    title: "Introduction video",
    description:
      "Record or upload a 30–60 second welcome clip. It appears at the top of your public profile and counts toward your YVITY Score.",
    goal: "One intro video uploaded",
  },
  career: {
    title: "Professional journey",
    description:
      "Add work experience with highlights — clients trust advisors who show real career depth.",
    goal: "At least one role with detail",
  },
  education: {
    title: "Educational journey",
    description:
      "Add degrees and certifications to your career story so prospects see your qualifications.",
    goal: "At least one education entry",
  },
  services: {
    title: "Services",
    description:
      "List the insurance and financial services you offer. Each service should show the company name and your designation.",
    goal: "At least one service listed",
  },
  testimonials: {
    title: "Client testimonials",
    description:
      "Request testimonials from recent clients. Two or more verified reviews are one of the strongest trust signals on YVITY.",
    goal: "At least 2 testimonials",
  },
  achievements: {
    title: "Achievements & awards",
    description:
      "Add MDRT, COT, club wins, or industry recognition — milestones build instant credibility on your public profile.",
    goal: "At least one achievement",
  },
  gallery: {
    title: "Gallery",
    description:
      "Upload photos from events, awards, and client moments. Three or more images bring your story to life.",
    goal: "At least 3 photos",
  },
};

export const SERVICES_UNDER_REVIEW_GUIDANCE: SectionGuidanceCopy = {
  title: "Services under verification",
  description:
    "Your submitted services are with our team (usually 24–48 hours). You can preview them below; editing unlocks after approval.",
};

import type { ProfileThemeId } from "@/lib/profile-themes";

export type ProfileVisibilitySettings = {
  careerJourney: boolean;
  educationalJourney: boolean;
  achievements: boolean;
  gallery: boolean;
  introductionVideo: boolean;
  individualServices: boolean;
};

export type ContactSettings = {
  callButton: boolean;
  whatsAppButton: boolean;
  contactForm: boolean;
  showMobileNumber: boolean;
};

export type LeadSettings = {
  acceptNewLeads: boolean;
  publicProfileEnquiries: boolean;
  testimonialRequests: boolean;
  recommendationRequests: boolean;
};

export type NotificationSettings = {
  newLeadAlerts: boolean;
  newTestimonialAlerts: boolean;
  newRecommendationAlerts: boolean;
  membershipRenewalAlerts: boolean;
};

export type PublicProfileSettings = {
  profileActive: boolean;
  searchVisibility: boolean;
  shareProfile: boolean;
};

export type ProfileAppearanceSettings = {
  theme: ProfileThemeId;
};

/**
 * Intro video shown on the public home / trust card and counted by the
 * YVITY Score. Empty `url` means "not configured" — consumers fall back
 * to `advisorProfile.home.introVideoUrl` (legacy static seed).
 */
export type IntroVideoSettings = {
  /** Direct MP4/WebM URL (uploaded via `/api/intro-video/upload`) or a publicly hosted file. */
  url: string;
  /** Optional poster image shown before the video plays. */
  posterUrl: string;
  /** Optional display label (e.g. `"2:30"`). */
  durationLabel: string;
};

export type AdvisorSettings = {
  visibility: ProfileVisibilitySettings;
  contact: ContactSettings;
  leads: LeadSettings;
  notifications: NotificationSettings;
  publicProfile: PublicProfileSettings;
  appearance: ProfileAppearanceSettings;
  introVideo: IntroVideoSettings;
};

export type AdvisorSettingsPatch = {
  visibility?: Partial<ProfileVisibilitySettings>;
  contact?: Partial<ContactSettings>;
  leads?: Partial<LeadSettings>;
  notifications?: Partial<NotificationSettings>;
  publicProfile?: Partial<PublicProfileSettings>;
  appearance?: Partial<ProfileAppearanceSettings>;
  introVideo?: Partial<IntroVideoSettings>;
};

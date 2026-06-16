import { DEFAULT_PROFILE_THEME_ID } from "@/lib/profile-themes";
import type { AdvisorSettings } from "./types";

export const defaultAdvisorSettings: AdvisorSettings = {
  visibility: {
    careerJourney: true,
    educationalJourney: true,
    achievements: true,
    gallery: true,
    introductionVideo: true,
    individualServices: true,
  },
  contact: {
    callButton: true,
    whatsAppButton: true,
    contactForm: true,
    showMobileNumber: true,
  },
  leads: {
    acceptNewLeads: true,
    publicProfileEnquiries: true,
    testimonialRequests: true,
    recommendationRequests: true,
  },
  notifications: {
    newLeadAlerts: true,
    newTestimonialAlerts: true,
    newRecommendationAlerts: true,
    membershipRenewalAlerts: true,
  },
  publicProfile: {
    profileActive: true,
    searchVisibility: true,
    shareProfile: true,
  },
  appearance: {
    theme: DEFAULT_PROFILE_THEME_ID,
  },
  introVideo: {
    url: "",
    posterUrl: "",
    durationLabel: "",
  },
  location: {
    officeAddress: "",
    mapsLink: "",
  },
};

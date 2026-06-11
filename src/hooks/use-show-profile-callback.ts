"use client";

import { usePublicProfileView } from "@/context/public-profile-view-context";
import { useAuth } from "@/context/AuthUserContext";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { useIsAdvisorWorkspacePreview } from "@/hooks/use-is-viewing-own-advisor-profile";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useIsVisitorPreview } from "@/lib/use-visitor-preview";

/**
 * Whether "Request Call Back" should appear on the live public profile.
 * On an approved public profile URL, show when the contact form is enabled
 * (primary visitor CTA). Inside workspace / iframe preview, keep hidden.
 */
export function useShowProfileCallback(): boolean {
  const { settings } = useAdvisorSettings();
  const publicView = usePublicProfileView();
  const { advisor } = useAuth();
  const isVisitorPreview = useIsVisitorPreview();
  const isWorkspacePreview = useIsAdvisorWorkspacePreview();

  if (!settings.contact.contactForm || isVisitorPreview) {
    return false;
  }

  const isLivePublicProfile = publicView
    ? isAdvisorProfileApproved(publicView.profile)
    : isAdvisorProfileApproved(advisor);

  if (publicView && isLivePublicProfile) {
    return true;
  }

  if (publicView) return false;

  if (isWorkspacePreview) return false;

  return settings.leads.acceptNewLeads && settings.leads.publicProfileEnquiries;
}

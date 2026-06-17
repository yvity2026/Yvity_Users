"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import {
  buildAdvisorDisplayProfile,
  type AdvisorDisplayProfile,
} from "@/lib/advisor-display-profile";
import type { PublicViewAdvisorPayload } from "@/lib/server/public-view-context";

type PublicProfileViewContextValue = PublicViewAdvisorPayload | null;

const PUBLIC_SECTION_REFRESH_EVENTS = [
  "services-data-updated",
  "achievements-data-updated",
  "testimonials-data-updated",
  "gallery-data-updated",
  "career-data-updated",
] as const;

export const PUBLIC_VIEW_USER_STORAGE_KEY = "yvity-public-view-user";

function refreshPublicSectionStores() {
  for (const evt of PUBLIC_SECTION_REFRESH_EVENTS) {
    window.dispatchEvent(new CustomEvent(evt));
  }
}

const PublicProfileViewContext = createContext<PublicProfileViewContextValue>(null);

export function PublicProfileViewProvider({
  value,
  children,
}: {
  value: PublicProfileViewContextValue;
  children: ReactNode;
}) {
  const [ready, setReady] = useState(!value || !isAdvisorProfileApproved(value.profile));

  useEffect(() => {
    if (!value?.userId) return;
    try {
      sessionStorage.setItem(PUBLIC_VIEW_USER_STORAGE_KEY, value.userId);
      if (value.profile.profile_slug) {
        sessionStorage.setItem("yvity-public-view-slug", value.profile.profile_slug);
      }
    } catch {
      // ignored — private mode / storage blocked
    }
  }, [value?.userId, value?.profile.profile_slug]);

  useEffect(() => {
    if (!value || !isAdvisorProfileApproved(value.profile)) {
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    void fetch("/api/public-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: value.userId }),
    }).then((res) => {
      if (cancelled) return;
      if (res.ok) refreshPublicSectionStores();
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [value?.userId, value?.profile]);

  return (
    <PublicProfileViewContext.Provider value={value}>
      {ready ? (
        children
      ) : (
        <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4">
          <p className="font-poppins text-sm text-muted-foreground">Loading profile…</p>
        </div>
      )}
    </PublicProfileViewContext.Provider>
  );
}

export function usePublicProfileView() {
  return useContext(PublicProfileViewContext);
}

export function buildDisplayProfileFromPublicView(
  payload: PublicViewAdvisorPayload,
): AdvisorDisplayProfile {
  return buildAdvisorDisplayProfile({
    user: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      mobile: payload.phone,
      city: payload.city,
      state: payload.state,
      profession: payload.profession,
      about: payload.about,
      selfie_url: payload.selfie_url,
    },
    advisor: {
      profile_slug: payload.profile.profile_slug,
      account_status: payload.profile.account_status,
      approved_at: payload.profile.approved_at,
    },
    designation: payload.profile.designation ?? undefined,
  });
}

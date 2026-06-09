"use client";

import { Suspense, type ReactNode } from "react";
import { ContactSheet } from "@/components/contact/contact-sheet";
import { PublicProfileGate } from "@/components/public-profile-gate";
import { PublicProfileViewCookieSync } from "@/components/public-profile-view-cookie-sync";
import { GiveTestimonialModal } from "@/components/testimonials/give-testimonial-modal";
import { RequestTestimonialModal } from "@/components/testimonials/request-testimonial-modal";
import { ProfileThemeProvider } from "@/components/profile-theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { RegistrationProvider } from "@/components/auth/registration-provider";
import { ReferralCapture } from "@/components/referral/referral-capture";
import { LoginProvider } from "@/components/auth/login-provider";
import { AuthProvider } from "@/context/AuthUserContext";
import { AdvisorSettingsProvider } from "@/lib/advisor-settings-store";
import { ContactProvider } from "@/lib/contact-store";
import { TestimonialSubmitProvider } from "@/lib/testimonial-submit-store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdvisorSettingsProvider>
        <ProfileThemeProvider>
          <PublicProfileGate>
            <PublicProfileViewCookieSync />
            <ContactProvider>
              <TestimonialSubmitProvider>
                {children}
                <Suspense fallback={null}>
                  <ReferralCapture />
                </Suspense>
                <LoginProvider />
                <RegistrationProvider />
                <ContactSheet />
                <GiveTestimonialModal />
                <RequestTestimonialModal />
                <Toaster position="top-center" richColors closeButton duration={4000} />
              </TestimonialSubmitProvider>
            </ContactProvider>
          </PublicProfileGate>
        </ProfileThemeProvider>
      </AdvisorSettingsProvider>
    </AuthProvider>
  );
}

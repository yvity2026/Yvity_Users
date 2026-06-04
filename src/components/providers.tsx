"use client";

import type { ReactNode } from "react";
import { ContactSheet } from "@/components/contact/contact-sheet";
import { PublicProfileGate } from "@/components/public-profile-gate";
import { GiveTestimonialModal } from "@/components/testimonials/give-testimonial-modal";
import { RequestTestimonialModal } from "@/components/testimonials/request-testimonial-modal";
import { ProfileThemeProvider } from "@/components/profile-theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { RegistrationProvider } from "@/components/auth/registration-provider";
import { LoginProvider } from "@/components/auth/login-provider";
import { Toaster as HotToaster } from "react-hot-toast";
import { AdvisorSettingsProvider } from "@/lib/advisor-settings-store";
import { ContactProvider } from "@/lib/contact-store";
import { TestimonialSubmitProvider } from "@/lib/testimonial-submit-store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AdvisorSettingsProvider>
      <ProfileThemeProvider>
        <PublicProfileGate>
          <ContactProvider>
            <TestimonialSubmitProvider>
              {children}
              <LoginProvider />
              <RegistrationProvider />
              <ContactSheet />
              <GiveTestimonialModal />
              <RequestTestimonialModal />
              <HotToaster position="top-center" toastOptions={{ duration: 4000 }} />
              <Toaster position="top-center" richColors closeButton />
            </TestimonialSubmitProvider>
          </ContactProvider>
        </PublicProfileGate>
      </ProfileThemeProvider>
    </AdvisorSettingsProvider>
  );
}

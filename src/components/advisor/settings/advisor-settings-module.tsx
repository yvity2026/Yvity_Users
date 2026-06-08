"use client";

import { Bell, Eye, Globe, Phone, Settings2, Shield, UserRound, Users } from "lucide-react";
import { ProfileAppearanceSection } from "@/components/advisor/settings/profile-appearance-section";
import { AdvisorReferralSettingsSection } from "@/components/advisor/settings/advisor-referral-settings-section";
import { SettingsGroup, SettingsToggleRow } from "@/components/advisor/settings/settings-ui";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";

export function AdvisorSettingsModule() {
  const { settings, loading, saving, updateSettings } = useAdvisorSettings();

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-3xl bg-white/5" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  const patchVisibility = (key: keyof typeof settings.visibility, value: boolean) =>
    updateSettings({ visibility: { [key]: value } });
  const patchContact = (key: keyof typeof settings.contact, value: boolean) =>
    updateSettings({ contact: { [key]: value } });
  const patchLeads = (key: keyof typeof settings.leads, value: boolean) => {
    if (key === "acceptNewLeads" && !value) {
      updateSettings({
        leads: { acceptNewLeads: false, publicProfileEnquiries: false },
      });
      return;
    }
    updateSettings({ leads: { [key]: value } });
  };
  const patchNotifications = (key: keyof typeof settings.notifications, value: boolean) =>
    updateSettings({ notifications: { [key]: value } });
  const patchPublic = (key: keyof typeof settings.publicProfile, value: boolean) => {
    if (key === "profileActive" && !value) {
      updateSettings({
        publicProfile: {
          profileActive: false,
          searchVisibility: false,
          shareProfile: false,
        },
      });
      return;
    }
    updateSettings({ publicProfile: { [key]: value } });
  };

  return (
    <div className="space-y-3 md:space-y-8 pb-6 animate-in fade-in duration-400">
      <section
        aria-labelledby="settings-section-title"
        className="glass-strong rounded-3xl border border-white/12 p-5 md:p-6"
      >
        <div className="flex items-start gap-4">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.82_0.13_205)] shadow-lg shadow-primary/25 ring-1 ring-white/15">
            <Settings2 className="size-6 text-primary-foreground" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Control center
            </p>
            <h2
              id="settings-section-title"
              className="text-xl md:text-2xl font-bold tracking-tight mt-1"
            >
              Settings
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Manage visibility, contact options, leads and notifications. Profile content is edited
              separately under Profile Management.
            </p>
            {saving && (
              <p
                className="text-[11px] text-[oklch(0.82_0.13_205)] mt-2 font-medium"
                role="status"
                aria-live="polite"
              >
                Saving&hellip;
              </p>
            )}
          </div>
        </div>
      </section>

      <ProfileAppearanceSection />

      <SettingsGroup
        icon={Eye}
        title="Profile visibility"
        description="Choose what visitors see on your public YVITY profile."
      >
        <SettingsToggleRow
          label="Career journey"
          description="Show professional experience on your public profile."
          checked={settings.visibility.careerJourney}
          onCheckedChange={(v) => patchVisibility("careerJourney", v)}
        />
        <SettingsToggleRow
          label="Educational journey"
          description="Show education and qualifications on your public profile."
          checked={settings.visibility.educationalJourney}
          onCheckedChange={(v) => patchVisibility("educationalJourney", v)}
        />
        <SettingsToggleRow
          label="Achievements"
          description="Display awards and milestones publicly."
          checked={settings.visibility.achievements}
          onCheckedChange={(v) => patchVisibility("achievements", v)}
        />
        <SettingsToggleRow
          label="Gallery"
          description="Show photo gallery on your public profile."
          checked={settings.visibility.gallery}
          onCheckedChange={(v) => patchVisibility("gallery", v)}
        />
        <SettingsToggleRow
          label="Introduction video"
          description="Show your intro video when available on the profile."
          checked={settings.visibility.introductionVideo}
          onCheckedChange={(v) => patchVisibility("introductionVideo", v)}
        />
        <SettingsToggleRow
          label="Individual services"
          description="Show detailed service cards (clients, claims, areas) on the Services page."
          checked={settings.visibility.individualServices}
          onCheckedChange={(v) => patchVisibility("individualServices", v)}
        />
      </SettingsGroup>

      <SettingsGroup
        icon={Phone}
        title="Contact controls"
        description="Control how visitors can reach you from the public profile."
      >
        <SettingsToggleRow
          label="Call button"
          description="Show click-to-call options on your public profile."
          checked={settings.contact.callButton}
          onCheckedChange={(v) => patchContact("callButton", v)}
        />
        <SettingsToggleRow
          label="WhatsApp button"
          description="Show WhatsApp contact shortcuts for visitors."
          checked={settings.contact.whatsAppButton}
          onCheckedChange={(v) => patchContact("whatsAppButton", v)}
        />
        <SettingsToggleRow
          label="Contact form"
          description="Allow visitors to submit enquiries through the contact form."
          checked={settings.contact.contactForm}
          onCheckedChange={(v) => patchContact("contactForm", v)}
        />
        <SettingsToggleRow
          label="Show mobile number"
          description="Display your mobile number visibly on the public profile."
          checked={settings.contact.showMobileNumber}
          onCheckedChange={(v) => patchContact("showMobileNumber", v)}
        />
      </SettingsGroup>

      <SettingsGroup
        icon={Users}
        title="Lead controls"
        description="Manage inbound enquiries and lead capture behaviour."
      >
        <SettingsToggleRow
          label="Accept new leads"
          description="When off, new enquiries are blocked across the platform."
          checked={settings.leads.acceptNewLeads}
          onCheckedChange={(v) => patchLeads("acceptNewLeads", v)}
          emphasis={!settings.leads.acceptNewLeads ? "warning" : undefined}
        />
        <SettingsToggleRow
          label="Public profile enquiries"
          description="Accept leads submitted from your public profile contact form."
          checked={settings.leads.publicProfileEnquiries}
          onCheckedChange={(v) => patchLeads("publicProfileEnquiries", v)}
          disabled={!settings.leads.acceptNewLeads}
        />
        <SettingsToggleRow
          label="Testimonial requests"
          description="Allow visitors to submit testimonials from your public profile."
          checked={settings.leads.testimonialRequests}
          onCheckedChange={(v) => patchLeads("testimonialRequests", v)}
        />
        <SettingsToggleRow
          label="Recommendation requests"
          description="Show the &ldquo;Recommend Advisor&rdquo; flow so visitors can endorse you publicly after OTP verification."
          checked={settings.leads.recommendationRequests}
          onCheckedChange={(v) => patchLeads("recommendationRequests", v)}
        />
      </SettingsGroup>

      <SettingsGroup
        icon={Bell}
        title="Notification controls"
        description="Choose which alerts you want to receive in your workspace."
      >
        <SettingsToggleRow
          label="New lead alerts"
          description="Notify when a new lead arrives in your inbox."
          checked={settings.notifications.newLeadAlerts}
          onCheckedChange={(v) => patchNotifications("newLeadAlerts", v)}
        />
        <SettingsToggleRow
          label="New testimonial alerts"
          description="Notify when a client submits a testimonial."
          checked={settings.notifications.newTestimonialAlerts}
          onCheckedChange={(v) => patchNotifications("newTestimonialAlerts", v)}
        />
        <SettingsToggleRow
          label="New recommendation alerts"
          description="Notify when recommendation activity is recorded."
          checked={settings.notifications.newRecommendationAlerts}
          onCheckedChange={(v) => patchNotifications("newRecommendationAlerts", v)}
        />
        <SettingsToggleRow
          label="Membership renewal alerts"
          description="Remind you before your YVITY membership renews."
          checked={settings.notifications.membershipRenewalAlerts}
          onCheckedChange={(v) => patchNotifications("membershipRenewalAlerts", v)}
        />
      </SettingsGroup>

      <SettingsGroup
        icon={Globe}
        title="Public profile controls"
        description="Master switches for profile availability and discovery."
      >
        <SettingsToggleRow
          label="Public profile active"
          description="When off, your public profile is not accessible to visitors."
          checked={settings.publicProfile.profileActive}
          onCheckedChange={(v) => patchPublic("profileActive", v)}
          emphasis={!settings.publicProfile.profileActive ? "warning" : undefined}
        />
        <SettingsToggleRow
          label="Search visibility"
          description="Allow your profile to appear in YVITY advisor listings and search."
          checked={settings.publicProfile.searchVisibility}
          onCheckedChange={(v) => patchPublic("searchVisibility", v)}
          disabled={!settings.publicProfile.profileActive}
        />
        <SettingsToggleRow
          label="Share profile availability"
          description="Enable share and copy-link options for your public profile."
          checked={settings.publicProfile.shareProfile}
          onCheckedChange={(v) => patchPublic("shareProfile", v)}
          disabled={!settings.publicProfile.profileActive}
        />
      </SettingsGroup>

      <AdvisorReferralSettingsSection />

      <p className="text-[10px] text-center text-muted-foreground px-4 flex items-center justify-center gap-1.5">
        <Shield className="size-3" />
        Changes save automatically · Name, photo and profile content are managed under Profile
        Management
        <UserRound className="size-3 inline ml-0.5" />
      </p>
    </div>
  );
}

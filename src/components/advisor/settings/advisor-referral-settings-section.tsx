"use client";

import { Link2 } from "lucide-react";
import { AdvisorReferralProgramPanel } from "@/components/advisor/referral/advisor-referral-program-panel";
import { SettingsGroup } from "@/components/advisor/settings/settings-ui";
import { useAdvisorAmbassador } from "@/hooks/use-advisor-ambassador";

export function AdvisorReferralSettingsSection() {
  const { data, loading } = useAdvisorAmbassador();

  if (loading) {
    return (
      <div className="h-48 rounded-2xl bg-white/5 animate-pulse" aria-hidden="true" />
    );
  }

  if (!data) return null;

  return (
    <SettingsGroup
      icon={Link2}
      title="Referral program"
      description="Your personal link to invite advisors. Free joins are tracked; rewards unlock on Silver or Gold purchases."
    >
      <AdvisorReferralProgramPanel data={data} compact />
    </SettingsGroup>
  );
}

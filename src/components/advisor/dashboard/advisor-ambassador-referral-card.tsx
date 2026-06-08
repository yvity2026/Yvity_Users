"use client";

import { DashboardSection } from "@/components/advisor/dashboard/dashboard-ui";
import { AdvisorReferralProgramPanel } from "@/components/advisor/referral/advisor-referral-program-panel";
import { useAdvisorAmbassador } from "@/hooks/use-advisor-ambassador";

export function AdvisorAmbassadorReferralCard() {
  const { data, loading } = useAdvisorAmbassador();

  if (loading || !data) return null;

  return (
    <DashboardSection
      title="Referral program"
      subtitle="Share your unique link — earn rewards when referrals buy Silver or Gold"
      defaultOpen
    >
      <AdvisorReferralProgramPanel data={data} />
    </DashboardSection>
  );
}

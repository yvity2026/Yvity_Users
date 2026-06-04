import DashboardSavedProfiles from "@/components/dashboard/DashboardSavedProfiles";
import IdentityDashboardShell from "@/components/identity/IdentityDashboardShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved profiles | YVITY Dashboard",
  description: "Your saved advisor profiles",
};

export default function DashboardSavedPage() {
  return (
    <IdentityDashboardShell>
      <DashboardSavedProfiles />
    </IdentityDashboardShell>
  );
}

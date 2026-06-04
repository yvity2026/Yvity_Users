import DashboardMyNetwork from "@/components/dashboard/DashboardMyNetwork";
import IdentityDashboardShell from "@/components/identity/IdentityDashboardShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Network | YVITY Dashboard",
  description: "Your professional network on YVITY",
};

export default function DashboardMyNetworkPage() {
  return (
    <IdentityDashboardShell>
      <DashboardMyNetwork />
    </IdentityDashboardShell>
  );
}

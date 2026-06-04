import IdentityRefreshPage from "@/components/identity/IdentityRefreshPage";
import IdentityDashboardShell from "@/components/identity/IdentityDashboardShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity refresh | YVITY Dashboard",
  description: "Annual identity verification refresh",
};

export default function DashboardIdentityRefreshPage() {
  return (
    <IdentityDashboardShell>
      <IdentityRefreshPage />
    </IdentityDashboardShell>
  );
}

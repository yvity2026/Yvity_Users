import DashboardProfile from "@/components/dashboard/DashboardProfile";
import IdentityDashboardShell from "@/components/identity/IdentityDashboardShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | YVITY Dashboard",
  description: "Your YVITY profile and account",
};

export default function DashboardProfilePage() {
  return (
    <IdentityDashboardShell>
      <DashboardProfile />
    </IdentityDashboardShell>
  );
}

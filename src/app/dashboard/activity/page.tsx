import DashboardActivity from "@/components/dashboard/DashboardActivity";
import IdentityDashboardShell from "@/components/identity/IdentityDashboardShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity | YVITY Dashboard",
  description: "Your YVITY activity feed",
};

export default function DashboardActivityPage() {
  return (
    <IdentityDashboardShell>
      <DashboardActivity />
    </IdentityDashboardShell>
  );
}

import InsuranceDirectory from "@/components/dashboard/InsuranceDirectory";
import IdentityDashboardShell from "@/components/identity/IdentityDashboardShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insurance Directory | YVITY Dashboard",
  description: "Contact details and branch locator for top insurance companies",
};

export default function InsuranceDirectoryPage() {
  return (
    <IdentityDashboardShell>
      <InsuranceDirectory />
    </IdentityDashboardShell>
  );
}

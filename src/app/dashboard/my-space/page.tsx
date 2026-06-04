import DashboardMySpace from "@/components/dashboard/DashboardMySpace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Space | YVITY Dashboard",
  description: "Your personal hub on YVITY",
};

export default function DashboardMySpacePage() {
  return <DashboardMySpace />;
}

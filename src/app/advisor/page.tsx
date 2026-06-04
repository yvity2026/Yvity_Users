import type { Metadata } from "next";
import { AdvisorDashboard } from "@/components/advisor-dashboard";

export const metadata: Metadata = { title: "Advisor Dashboard" };

export default function AdvisorPage() {
  return <AdvisorDashboard />;
}

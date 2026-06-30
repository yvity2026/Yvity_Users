import VaultDashboard from "@/components/vault/VaultDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Financial Vault | YVITY",
  description: "Your personal financial vault — organised and private",
};

export default function VaultPage() {
  return <VaultDashboard />;
}

import { notFound } from "next/navigation";
import { VAULT_CATEGORIES } from "@/lib/vault/categories";
import VaultItemDetail from "@/components/vault/VaultItemDetail";
import type { Metadata } from "next";

type Props = { params: Promise<{ category: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = VAULT_CATEGORIES.find((c) => c.id === category);
  return {
    title: cat ? `${cat.label} Detail | My Financial Vault` : "Vault | YVITY",
  };
}

export default async function VaultItemPage({ params }: Props) {
  const { category } = await params;
  const valid = VAULT_CATEGORIES.some((c) => c.id === category);
  if (!valid) notFound();

  return <VaultItemDetail />;
}

import { notFound } from "next/navigation";
import { VAULT_CATEGORIES } from "@/lib/vault/categories";
import VaultCategoryPage from "@/components/vault/VaultCategoryPage";
import type { Metadata } from "next";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = VAULT_CATEGORIES.find((c) => c.id === category);
  return {
    title: cat ? `${cat.label} | My Financial Vault` : "Vault | YVITY",
  };
}

export default async function VaultCategoryRoute({ params }: Props) {
  const { category } = await params;
  const valid = VAULT_CATEGORIES.some((c) => c.id === category);
  if (!valid) notFound();

  return <VaultCategoryPage />;
}

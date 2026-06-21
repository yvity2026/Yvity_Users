import { ServicesShowcase } from "@/components/sections/services-showcase";
import type { ServiceCategory } from "@/lib/sections/types";

const VALID_CATEGORIES: ServiceCategory[] = ["life", "health", "general", "mutual"];

export default async function SlugServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const raw = params.category;
  const highlightCategory = VALID_CATEGORIES.includes(raw as ServiceCategory)
    ? (raw as ServiceCategory)
    : undefined;

  return <ServicesShowcase highlightCategory={highlightCategory} />;
}

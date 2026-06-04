import type { Metadata } from "next";
import { ServicesShowcase } from "@/components/sections/services-showcase";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return <ServicesShowcase />;
}

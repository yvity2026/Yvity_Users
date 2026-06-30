import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with YVITY support. We're here to help advisors and users.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}

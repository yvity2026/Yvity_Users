import type { ServiceCategory } from "@/lib/sections/types";

/** Suggested supporting documents per service category. */
export const SERVICE_DOCUMENT_REQUIREMENTS: Record<ServiceCategory, string[]> = {
  life: ["IRDA License"],
  health: ["IRDA License", "Company Authorization"],
  general: ["IRDA License", "POSP / Agency Authorization"],
  mutual: ["ARN Certificate", "AMFI Registration"],
};

/** Friendly category label used inside verification UI. */
export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  life: "Life Insurance",
  health: "Health Insurance",
  general: "General Insurance",
  mutual: "Mutual Funds",
};

/** Accepted MIME types for verification document uploads. */
export const VERIFICATION_ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export const VERIFICATION_ACCEPTED_HUMAN = "PDF, JPG, JPEG, or PNG";

export const VERIFICATION_MAX_BYTES = 8 * 1024 * 1024; // 8 MB

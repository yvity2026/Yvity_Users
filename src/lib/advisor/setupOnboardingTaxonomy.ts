import { Building2, HeartPulse, Landmark, Shield, Umbrella } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const DEFAULT_INDUSTRY_ID = "bfsi";
export const DEFAULT_CATEGORY_ID = "insurance";

export const SETUP_PROFILE_STEPS = [
  { id: "scope", label: "Industry & Services" },
  { id: "details", label: "Service Details" },
  { id: "documents", label: "Verification Documents" },
  { id: "plan", label: "Choose Plan" },
  { id: "review", label: "Review & Submit" },
] as const;

export const ONBOARDING_INDUSTRIES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: DEFAULT_INDUSTRY_ID, label: "BFSI", icon: Landmark },
];

export const ONBOARDING_CATEGORIES: Record<
  string,
  { id: string; label: string; icon: LucideIcon }[]
> = {
  [DEFAULT_INDUSTRY_ID]: [
    {
      id: DEFAULT_CATEGORY_ID,
      label: "Insurance",
      icon: Building2,
    },
  ],
};

export const ONBOARDING_SERVICES: Record<
  string,
  {
    id: string;
    label: string;
    apiType: string;
    icon: LucideIcon;
    advisorRoleMatch: string;
  }[]
> = {
  [DEFAULT_CATEGORY_ID]: [
    {
      id: "life-insurance",
      label: "Life Insurance",
      apiType: "Life Insurance",
      icon: Shield,
      advisorRoleMatch: "Life Insurance Advisor",
    },
    {
      id: "health-insurance",
      label: "Health Insurance",
      apiType: "Health Insurance",
      icon: HeartPulse,
      advisorRoleMatch: "Health Insurance Advisor",
    },
    {
      id: "general-insurance",
      label: "General Insurance",
      apiType: "General Insurance",
      icon: Umbrella,
      advisorRoleMatch: "General Insurance Advisor",
    },
  ],
};

export function getCategoriesForIndustry(industryId: string) {
  return ONBOARDING_CATEGORIES[industryId] ?? ONBOARDING_CATEGORIES[DEFAULT_INDUSTRY_ID];
}

export function getServicesForCategory(categoryId: string) {
  return ONBOARDING_SERVICES[categoryId] ?? ONBOARDING_SERVICES[DEFAULT_CATEGORY_ID];
}

export function getIndustryLabel(industryId: string) {
  return ONBOARDING_INDUSTRIES.find((item) => item.id === industryId)?.label ?? "BFSI";
}

export function getCategoryLabel(industryId: string, categoryId: string) {
  return (
    getCategoriesForIndustry(industryId).find((item) => item.id === categoryId)?.label ??
    "Insurance"
  );
}

export function getServiceLabel(categoryId: string, serviceId: string) {
  return (
    getServicesForCategory(categoryId).find((item) => item.id === serviceId)?.label ?? ""
  );
}

export function getServiceMeta(categoryId: string, serviceId: string) {
  return getServicesForCategory(categoryId).find((item) => item.id === serviceId);
}

export type ServiceDetailForm = {
  designation: string;
  company: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  licenseNumber: string;
  professionalCapacity: string;
  licenseHolderType: "self" | "other";
  licenseHolderName: string;
  licenseHolderRelationship: string;
  consentLetterUrl: string;
  consentLetterName: string;
  consentLetterFile: null;
  consentUploading: boolean;
};

export function createEmptyServiceDetail(): ServiceDetailForm {
  return {
    designation: "",
    company: "",
    startDate: "",
    endDate: "",
    isActive: true,
    licenseNumber: "",
    professionalCapacity: "individual_agent",
    licenseHolderType: "self",
    licenseHolderName: "",
    licenseHolderRelationship: "",
    consentLetterUrl: "",
    consentLetterName: "",
    consentLetterFile: null,
    consentUploading: false,
  };
}

export function resolveAdvisorRoleId(
  roles: { id?: string; title?: string }[],
  primaryServiceId: string,
) {
  const meta = getServiceMeta(DEFAULT_CATEGORY_ID, primaryServiceId);
  const matchTitle = meta?.advisorRoleMatch ?? "Life Insurance Advisor";
  const list = Array.isArray(roles) ? roles : [];

  const exact = list.find(
    (role) => String(role.title || "").toLowerCase() === matchTitle.toLowerCase(),
  );
  if (exact?.id) return exact.id;

  const partial = list.find((role) =>
    String(role.title || "").toLowerCase().includes("insurance"),
  );
  return partial?.id ?? list[0]?.id ?? null;
}

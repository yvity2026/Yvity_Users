import { uid } from "@/lib/id";
import { formatExperienceFromStart } from "@/lib/sections/service-experience";
import type { ServiceCategory, ServiceItem } from "@/lib/sections/types";
import { decodeCapacityMetadata } from "@/lib/advisor/serviceCapacity";
import { emptyVerification } from "@/lib/verification/defaults";
import type { VerificationDocument } from "@/lib/verification/types";

const API_TYPE_TO_CATEGORY: Record<string, ServiceCategory> = {
  "Life Insurance": "life",
  "Health Insurance": "health",
  "General Insurance": "general",
  "Mutual Funds": "mutual",
};

export type SetupServicePayload = {
  service?: string;
  company?: string;
  license?: string;
  experience?: number | null;
  designation?: string;
  fromYear?: string | null;
  toYear?: string | null;
  keyServices?: string[];
};

function categoryForApiType(apiType: string): ServiceCategory {
  return API_TYPE_TO_CATEGORY[apiType] ?? "life";
}

export function mapSetupServicesToItems(
  services: SetupServicePayload[],
  documentUrls: string[] = [],
): ServiceItem[] {
  const sharedDocs: VerificationDocument[] = documentUrls.map((url, index) => {
    const filename = url.split("/").pop() ?? `document-${index + 1}`;
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const mimeType =
      ext === "pdf"
        ? "application/pdf"
        : ext === "png"
          ? "image/png"
          : "image/jpeg";
    return {
      id: `setup-doc-${index}`,
      url,
      filename,
      mimeType,
      uploadedAt: new Date().toISOString(),
      label: "Verification document",
    };
  });

  return services.map((row) => {
    const apiType = row.service ?? "Life Insurance";
    const category = categoryForApiType(apiType);
    decodeCapacityMetadata(row.keyServices ?? []);
    const startDate =
      typeof row.fromYear === "string" && row.fromYear.length >= 4
        ? row.fromYear.length === 4
          ? `${row.fromYear}-01-01`
          : row.fromYear
        : undefined;
    const experienceLabel =
      formatExperienceFromStart(startDate) ??
      (typeof row.experience === "number" && row.experience >= 0
        ? `${row.experience}+ Years Experience`
        : "");

    const verification = emptyVerification();
    if (sharedDocs.length) {
      verification.documents = sharedDocs;
      verification.submittedAt = new Date().toISOString();
    }

    return {
      id: uid("svc"),
      category,
      title: apiType,
      provider: row.company?.trim() || "",
      experience: experienceLabel,
      serviceStartDate: startDate,
      roleLabel: row.designation?.trim() || "",
      clients: 0,
      claims: 0,
      sumInsured: "₹ 0",
      claimSettled: "₹ 0",
      claimRatio: 0,
      statusMessage: "",
      statusCaption: "",
      areas: [],
      verified: false,
      verification,
      showDetailCard: true,
    };
  });
}

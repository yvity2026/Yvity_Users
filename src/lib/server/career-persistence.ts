import type { CareerData, Certification, Experience } from "@/lib/career-types";
import { emptyCareerData } from "@/lib/empty-data";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { careerFileForUser } from "@/lib/server/user-data-files";
import { normalizeOptionalVerification } from "@/lib/verification/defaults";

function normalizeExperience(raw: Experience): Experience {
  const verification = normalizeOptionalVerification(
    (raw as { verification?: unknown }).verification,
  );
  if (!verification) {
    const { verification: _drop, ...rest } = raw as Experience & {
      verification?: unknown;
    };
    void _drop;
    return rest;
  }
  return { ...raw, verification };
}

function normalizeCertification(raw: Certification): Certification {
  const verification = normalizeOptionalVerification(
    (raw as { verification?: unknown }).verification,
  );
  if (!verification) {
    const { verification: _drop, ...rest } = raw as Certification & {
      verification?: unknown;
    };
    void _drop;
    return rest;
  }
  return { ...raw, verification };
}

function normalizeCareer(data: CareerData): CareerData {
  return {
    ...data,
    experiences: Array.isArray(data.experiences) ? data.experiences.map(normalizeExperience) : [],
    certifications: Array.isArray(data.certifications)
      ? data.certifications.map(normalizeCertification)
      : [],
    education: Array.isArray(data.education) ? data.education : [],
  };
}

export async function loadCareerForUser(userId: string | undefined): Promise<CareerData> {
  if (!userId) return emptyCareerData;
  const raw = await loadJsonFile<unknown>(careerFileForUser(userId), emptyCareerData);
  return normalizeCareer(raw as CareerData);
}

export async function saveCareerForUser(userId: string, data: CareerData): Promise<void> {
  await saveJsonFile(careerFileForUser(userId), normalizeCareer(data));
}

/** @deprecated Use loadCareerForUser(session.id) */
export async function loadPublicProfile(): Promise<CareerData> {
  return emptyCareerData;
}

/** @deprecated Use saveCareerForUser */
export async function savePublicProfile(data: CareerData): Promise<void> {
  void data;
}

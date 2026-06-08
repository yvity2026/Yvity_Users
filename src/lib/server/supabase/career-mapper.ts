import type {
  CareerData,
  Certification,
  Education,
  Experience,
} from "@/lib/career-types";

type JourneyRow = Record<string, unknown>;

function yearFromRow(row: JourneyRow): string {
  if (row.date != null) return String(row.date);
  if (row.from_year != null) return String(row.from_year);
  return "";
}

function monthFromYear(year: string | number | null | undefined): string {
  if (year == null || year === "") return "";
  const y = String(year);
  if (/^\d{4}-\d{2}$/.test(y)) return y;
  if (/^\d{4}$/.test(y)) return `${y}-01`;
  return "";
}

export function mapJourneyToCareer(rows: JourneyRow[]): CareerData {
  const experiences: Experience[] = [];
  const certifications: Certification[] = [];
  const education: Education[] = [];

  for (const row of rows) {
    const entryType = String(row.entry_type || "");
    const id = String(row.id);
    const description = String(row.description || "");
    const bullets = description
      ? description.split("\n").map((l) => l.trim()).filter(Boolean)
      : [];

    if (entryType === "Profession") {
      experiences.push({
        id,
        role: String(row.title || ""),
        company: String(row.organisation || ""),
        category: String(row.service_category || row.custom_service_category || "general"),
        location: "",
        start: monthFromYear(row.from_year as number),
        end: row.is_ongoing ? "" : monthFromYear(row.to_year as number),
        bullets,
      });
      continue;
    }

    if (entryType === "Certificate") {
      certifications.push({
        id,
        name: String(row.certificate_name || row.title || ""),
        issuer: String(row.organisation || row.institution || ""),
        year: yearFromRow(row),
        status: "pending",
        bullets,
      });
      continue;
    }

    if (entryType === "Education") {
      education.push({
        id,
        degree: String(row.degree_or_certificate || row.title || ""),
        specialization: String(row.description || ""),
        institution: String(row.institution || row.organisation || ""),
        location: "",
        year: yearFromRow(row),
      });
    }
  }

  return { experiences, certifications, education };
}

export function mapCareerExperienceToRow(
  item: Experience,
  userId: string,
): Record<string, unknown> {
  const [fromYear] = item.start.split("-");
  const toYear = item.end ? item.end.split("-")[0] : null;

  return {
    user_id: userId,
    entry_type: "Profession",
    title: item.role,
    organisation: item.company,
    service_category: item.category,
    description: item.bullets.join("\n"),
    from_year: fromYear ? Number(fromYear) : null,
    to_year: toYear ? Number(toYear) : null,
    is_ongoing: !item.end,
  };
}

export function mapCareerCertificationToRow(
  item: Certification,
  userId: string,
): Record<string, unknown> {
  const year = item.year ? Number(String(item.year).replace(/\D/g, "").slice(0, 4)) : null;

  return {
    user_id: userId,
    entry_type: "Certificate",
    title: item.name,
    certificate_name: item.name,
    organisation: item.issuer,
    institution: item.issuer,
    description: item.bullets.join("\n"),
    date: year,
    from_year: year,
  };
}

export function mapCareerEducationToRow(
  item: Education,
  userId: string,
): Record<string, unknown> {
  const year = item.year ? Number(String(item.year).replace(/\D/g, "").slice(0, 4)) : null;

  return {
    user_id: userId,
    entry_type: "Education",
    title: item.degree,
    degree_or_certificate: item.degree,
    organisation: item.institution,
    institution: item.institution,
    description: item.specialization || "",
    date: year,
    from_year: year,
  };
}

export function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

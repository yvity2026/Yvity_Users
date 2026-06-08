import "server-only";

import type { CareerData } from "@/lib/career-types";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import {
  isUuid,
  mapCareerCertificationToRow,
  mapCareerEducationToRow,
  mapCareerExperienceToRow,
  mapJourneyToCareer,
} from "@/lib/server/supabase/career-mapper";

function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export async function loadCareerFromDb(userId: string): Promise<CareerData> {
  const { data, error } = await client()
    .from("advisor_journey")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return mapJourneyToCareer((data ?? []) as Record<string, unknown>[]);
}

export async function syncCareerToDb(userId: string, career: CareerData): Promise<CareerData> {
  const supabase = client();
  const { data: existing } = await supabase
    .from("advisor_journey")
    .select("id")
    .eq("user_id", userId);

  const allItems = [
    ...career.experiences.map((e) => ({ kind: "experience" as const, item: e })),
    ...career.certifications.map((c) => ({ kind: "certification" as const, item: c })),
    ...career.education.map((e) => ({ kind: "education" as const, item: e })),
  ];

  const payloadIds = new Set(allItems.filter((x) => isUuid(x.item.id)).map((x) => x.item.id));
  const toDelete = (existing ?? [])
    .map((r) => String(r.id))
    .filter((id) => !payloadIds.has(id));

  if (toDelete.length) {
    await supabase.from("advisor_journey").delete().eq("user_id", userId).in("id", toDelete);
  }

  for (const entry of allItems) {
    const row =
      entry.kind === "experience"
        ? mapCareerExperienceToRow(entry.item, userId)
        : entry.kind === "certification"
          ? mapCareerCertificationToRow(entry.item, userId)
          : mapCareerEducationToRow(entry.item, userId);

    if (isUuid(entry.item.id)) {
      await supabase.from("advisor_journey").update(row).eq("id", entry.item.id).eq("user_id", userId);
    } else {
      await supabase.from("advisor_journey").insert(row);
    }
  }

  return loadCareerFromDb(userId);
}

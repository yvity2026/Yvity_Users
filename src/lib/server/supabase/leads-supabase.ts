import "server-only";

import type { Lead } from "@/lib/leads/types";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import {
  mapDbProspectsToLeads,
  mapLeadPatchToProspect,
  mapLeadToProspectRow,
} from "@/lib/server/supabase/mappers";

function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

export async function loadLeadsForAdvisor(advisorId: string): Promise<Lead[]> {
  const { data, error } = await client()
    .from("advisor_prospects")
    .select("*")
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return mapDbProspectsToLeads((data ?? []) as Record<string, unknown>[]);
}

export async function saveLeadsForAdvisor(advisorId: string, leads: Lead[]): Promise<void> {
  const supabase = client();
  const { data: existing } = await supabase
    .from("advisor_prospects")
    .select("id")
    .eq("advisor_id", advisorId);

  const payloadIds = new Set(
    leads.filter((l) => /^[0-9a-f-]{36}$/i.test(l.id)).map((l) => l.id),
  );
  const toDelete = (existing ?? [])
    .map((r) => String(r.id))
    .filter((id) => !payloadIds.has(id));

  if (toDelete.length) {
    await supabase.from("advisor_prospects").delete().eq("advisor_id", advisorId).in("id", toDelete);
  }

  for (const lead of leads) {
    const row = mapLeadToProspectRow(advisorId, lead);
    const id = row.id as string | undefined;
    delete row.id;

    if (id) {
      await supabase.from("advisor_prospects").update(row).eq("id", id).eq("advisor_id", advisorId);
    } else {
      await supabase.from("advisor_prospects").insert(row);
    }
  }
}

export async function updateLeadForAdvisor(
  advisorId: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<Lead | null> {
  const { data: existing, error: readError } = await client()
    .from("advisor_prospects")
    .select("*")
    .eq("id", id)
    .eq("advisor_id", advisorId)
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (!existing) return null;

  const { columns, goldMeta } = mapLeadPatchToProspect(patch);
  const currentMeta =
    existing.gold_meta && typeof existing.gold_meta === "object"
      ? (existing.gold_meta as Record<string, unknown>)
      : {};

  const { error } = await client()
    .from("advisor_prospects")
    .update({
      ...columns,
      gold_meta: { ...currentMeta, ...goldMeta },
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("advisor_id", advisorId);

  if (error) throw new Error(error.message);

  const leads = await loadLeadsForAdvisor(advisorId);
  return leads.find((l) => l.id === id) ?? null;
}

export async function deleteLeadForAdvisor(advisorId: string, id: string): Promise<boolean> {
  const { error, count } = await client()
    .from("advisor_prospects")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("advisor_id", advisorId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function insertLeadForAdvisor(advisorId: string, lead: Lead): Promise<Lead> {
  const row = mapLeadToProspectRow(advisorId, lead);
  delete row.id;

  const { data, error } = await client()
    .from("advisor_prospects")
    .insert(row)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapDbProspectsToLeads([data as Record<string, unknown>])[0]!;
}

import "server-only";

import type { ProfileShareKind } from "@/lib/profile-shares/types";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

function client() {
  const supabase = getAdminClientOrNull();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function shareType(kind: ProfileShareKind): "self" | "client" {
  return kind === "self" ? "self" : "client";
}

export async function appendShareEvent(input: {
  advisorUserId: string;
  sharerUserId: string;
  kind: ProfileShareKind;
}): Promise<void> {
  const { error } = await client().from("advisor_share_events").insert({
    advisor_id: input.advisorUserId,
    user_id: input.sharerUserId,
    share_type: shareType(input.kind),
    channel: "yvity_gold",
  });

  if (error) throw new Error(error.message);
}

function isInMonth(iso: string, year: number, month: number): boolean {
  const date = new Date(iso);
  return date.getFullYear() === year && date.getMonth() === month;
}

export async function countSelfProfileShares(advisorUserId: string): Promise<number> {
  const { count, error } = await client()
    .from("advisor_share_events")
    .select("id", { count: "exact", head: true })
    .eq("advisor_id", advisorUserId)
    .eq("share_type", "self");

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function countUniqueClientProfileSharers(advisorUserId: string): Promise<number> {
  const { data, error } = await client()
    .from("advisor_share_events")
    .select("user_id")
    .eq("advisor_id", advisorUserId)
    .eq("share_type", "client");

  if (error) throw new Error(error.message);
  const sharers = new Set(
    (data ?? [])
      .map((row) => String(row.user_id || ""))
      .filter((id) => id && id !== advisorUserId),
  );
  return sharers.size;
}

export async function countSelfProfileSharesInMonth(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  const { data, error } = await client()
    .from("advisor_share_events")
    .select("created_at")
    .eq("advisor_id", advisorUserId)
    .eq("share_type", "self");

  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) => isInMonth(String(row.created_at), year, month)).length;
}

export async function countUniqueClientProfileSharersInMonth(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  const { data, error } = await client()
    .from("advisor_share_events")
    .select("user_id, created_at")
    .eq("advisor_id", advisorUserId)
    .eq("share_type", "client");

  if (error) throw new Error(error.message);
  const sharers = new Set(
    (data ?? [])
      .filter(
        (row) =>
          isInMonth(String(row.created_at), year, month) &&
          row.user_id &&
          String(row.user_id) !== advisorUserId,
      )
      .map((row) => String(row.user_id)),
  );
  return sharers.size;
}

export async function countProfileSharesInMonth(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  const { data, error } = await client()
    .from("advisor_share_events")
    .select("created_at")
    .eq("advisor_id", advisorUserId);

  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) => isInMonth(String(row.created_at), year, month)).length;
}

export async function countProfileViewsInMonth(
  advisorUserId: string,
  year: number,
  month: number,
): Promise<number> {
  void advisorUserId;
  void year;
  void month;
  return 0;
}

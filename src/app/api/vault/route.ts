import { NextResponse } from "next/server";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { getSessionUser } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClientOrNull();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();

  if (q) {
    const like = `%${q}%`;
    const { data, error } = await supabase
      .from("vault_items")
      .select("*")
      .eq("user_id", session.id)
      .or(`title.ilike.${like},subtitle.ilike.${like}`)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[vault] search failed:", error.message);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    return NextResponse.json({ results: data ?? [] });
  }

  if (category) {
    const { data, error } = await supabase
      .from("vault_items")
      .select("*")
      .eq("user_id", session.id)
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[vault] GET items failed:", error.message);
      return NextResponse.json({ error: "Failed to load items" }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  }

  // No category param → return counts per category for the dashboard
  const { data, error } = await supabase
    .from("vault_items")
    .select("category")
    .eq("user_id", session.id);

  if (error) {
    console.error("[vault] GET counts failed:", error.message);
    return NextResponse.json({ error: "Failed to load vault" }, { status: 500 });
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }

  return NextResponse.json({ counts });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminClientOrNull();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { category, title, subtitle, data } = body;

  if (!category || !title) {
    return NextResponse.json({ error: "category and title are required" }, { status: 400 });
  }

  const { data: item, error } = await supabase
    .from("vault_items")
    .insert({
      user_id: session.id,
      category,
      title,
      subtitle: subtitle ?? null,
      data: data ?? {},
    })
    .select()
    .single();

  if (error) {
    console.error("[vault] POST failed:", error.message);
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }

  return NextResponse.json({ item }, { status: 201 });
}

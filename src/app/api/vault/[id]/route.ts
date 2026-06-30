import { NextResponse } from "next/server";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { getSessionUser } from "@/lib/server/session";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = getAdminClientOrNull();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { data: item, error } = await supabase
    .from("vault_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.id)
    .single();

  if (error || !item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PUT(request: Request, context: Context) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = getAdminClientOrNull();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { title, subtitle, data } = body;

  const { data: item, error } = await supabase
    .from("vault_items")
    .update({
      title,
      subtitle: subtitle ?? null,
      data: data ?? {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", session.id)
    .select()
    .single();

  if (error) {
    console.error("[vault] PUT failed:", error.message);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getSessionUser();
  if (!session?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = getAdminClientOrNull();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { error } = await supabase
    .from("vault_items")
    .delete()
    .eq("id", id)
    .eq("user_id", session.id);

  if (error) {
    console.error("[vault] DELETE failed:", error.message);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

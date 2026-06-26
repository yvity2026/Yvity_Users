import { NextResponse } from "next/server";
import type { AdvisorSettingsPatch } from "@/lib/advisor-settings/types";
import { normalizeAdvisorSettings } from "@/lib/advisor-settings/normalize";
import { unauthorized, requireSession } from "@/lib/server/api-auth";
import {
  loadAdvisorSettings,
  saveAdvisorSettings,
} from "@/lib/server/advisor-settings-persistence";

/** PATCH /api/advisor/settings — partial settings update (e.g. location only). */
export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session?.id) return unauthorized();

  let patch: AdvisorSettingsPatch;
  try {
    patch = (await request.json()) as AdvisorSettingsPatch;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const current = await loadAdvisorSettings();
  const merged = normalizeAdvisorSettings({
    ...current,
    ...(patch.location !== undefined && {
      location: { ...current.location, ...patch.location },
    }),
    ...(patch.visibility !== undefined && {
      visibility: { ...current.visibility, ...patch.visibility },
    }),
    ...(patch.contact !== undefined && {
      contact: { ...current.contact, ...patch.contact },
    }),
    ...(patch.appearance !== undefined && {
      appearance: { ...current.appearance, ...patch.appearance },
    }),
    ...(patch.introVideo !== undefined && {
      introVideo: { ...current.introVideo, ...patch.introVideo },
    }),
  });

  try {
    const saved = await saveAdvisorSettings(merged);
    return NextResponse.json({ ok: true, data: saved });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[advisor/settings PATCH]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

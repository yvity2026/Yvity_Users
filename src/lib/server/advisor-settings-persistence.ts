import { defaultAdvisorSettings } from "@/lib/advisor-settings/defaults";
import { normalizeAdvisorSettings } from "@/lib/advisor-settings/normalize";
import type { AdvisorSettings } from "@/lib/advisor-settings/types";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { resolveAdvisorDataUserId } from "@/lib/server/public-view-context";
import { getSessionUser } from "@/lib/server/session";
import {
  loadAdvisorSettingsFromDb,
  saveAdvisorSettingsToDb,
} from "@/lib/server/supabase/platform-supabase";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  mapAdvisorSettingsToDbPatch,
  mapDbToAdvisorSettings,
} from "@/lib/server/supabase/settings-mapper";
import { settingsFileForUser } from "@/lib/server/user-data-files";

async function fileForRead(): Promise<string> {
  const dataUserId = await resolveAdvisorDataUserId();
  return dataUserId ? settingsFileForUser(dataUserId) : "advisor-settings-anonymous.json";
}

async function fileForWrite(): Promise<string | null> {
  const session = await getSessionUser();
  return session?.id ? settingsFileForUser(session.id) : null;
}

export async function loadAdvisorSettings(advisorUserId?: string): Promise<AdvisorSettings> {
  const dataUserId = advisorUserId ?? (await resolveAdvisorDataUserId());
  if (useSupabasePersistence() && dataUserId) {
    const profile = await loadAdvisorSettingsFromDb(dataUserId);
    return mapDbToAdvisorSettings(profile, null);
  }

  const filename = dataUserId ? settingsFileForUser(dataUserId) : await fileForRead();
  const raw = await loadJsonFile<unknown>(filename, defaultAdvisorSettings);
  return normalizeAdvisorSettings(raw);
}

export async function saveAdvisorSettings(settings: AdvisorSettings): Promise<AdvisorSettings> {
  const session = await getSessionUser();
  const normalized = normalizeAdvisorSettings(settings);

  if (useSupabasePersistence() && session?.id) {
    await saveAdvisorSettingsToDb(session.id, mapAdvisorSettingsToDbPatch(normalized));
    return normalized;
  }

  const filename = await fileForWrite();
  if (!filename) return normalized;

  await saveJsonFile(filename, normalized);
  return normalized;
}

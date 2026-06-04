import { defaultAdvisorSettings } from "@/lib/advisor-settings/defaults";
import { normalizeAdvisorSettings } from "@/lib/advisor-settings/normalize";
import type { AdvisorSettings } from "@/lib/advisor-settings/types";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { getSessionUser } from "@/lib/server/session";
import { settingsFileForUser } from "@/lib/server/user-data-files";

async function fileForSession(): Promise<string> {
  const session = await getSessionUser();
  return session?.id ? settingsFileForUser(session.id) : "advisor-settings-anonymous.json";
}

export async function loadAdvisorSettings(): Promise<AdvisorSettings> {
  const raw = await loadJsonFile<unknown>(await fileForSession(), defaultAdvisorSettings);
  return normalizeAdvisorSettings(raw);
}

export async function saveAdvisorSettings(settings: AdvisorSettings): Promise<AdvisorSettings> {
  const normalized = normalizeAdvisorSettings(settings);
  await saveJsonFile(await fileForSession(), normalized);
  return normalized;
}

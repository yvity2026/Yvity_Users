import type { GalleryItem } from "@/lib/gallery-types";
import type { AchievementItem, ServiceItem } from "@/lib/sections/types";
import { EMPTY_ACHIEVEMENTS, EMPTY_GALLERY, EMPTY_SERVICES } from "@/lib/empty-data";
import { normalizeAchievements } from "@/lib/sections/normalize-achievements";
import { normalizeServices } from "@/lib/sections/normalize-services";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  loadAchievementsFromDb,
  loadGalleryFromDb,
  loadServicesFromDb,
  syncAchievements,
  syncGallery,
  syncServices,
} from "@/lib/server/supabase/sync-sections";
import {
  achievementsFileForUser,
  galleryFileForUser,
} from "@/lib/server/user-data-files";
import { servicesFileForUser } from "@/lib/server/advisor-profile-store";

export async function loadServicesForUser(userId: string | null): Promise<ServiceItem[]> {
  if (useSupabasePersistence() && userId) {
    return loadServicesFromDb(userId);
  }
  const raw = await loadJsonFile<unknown>(
    userId ? servicesFileForUser(userId) : "services-anonymous.json",
    EMPTY_SERVICES,
  );
  return normalizeServices(raw);
}

export async function saveServicesForUser(
  userId: string,
  items: ServiceItem[],
): Promise<ServiceItem[]> {
  const normalized = normalizeServices(items);
  if (useSupabasePersistence()) {
    return syncServices(userId, normalized);
  }
  await saveJsonFile(servicesFileForUser(userId), normalized);
  return normalized;
}

export async function loadAchievementsForUser(userId: string | null): Promise<AchievementItem[]> {
  if (useSupabasePersistence() && userId) {
    return loadAchievementsFromDb(userId);
  }
  const raw = await loadJsonFile<unknown>(
    userId ? achievementsFileForUser(userId) : "achievements-anonymous.json",
    EMPTY_ACHIEVEMENTS,
  );
  return normalizeAchievements(raw);
}

export async function saveAchievementsForUser(
  userId: string,
  items: AchievementItem[],
): Promise<AchievementItem[]> {
  const normalized = normalizeAchievements(items);
  if (useSupabasePersistence()) {
    return syncAchievements(userId, normalized);
  }
  await saveJsonFile(achievementsFileForUser(userId), normalized);
  return normalized;
}

export async function loadGalleryForUser(userId: string | null): Promise<GalleryItem[]> {
  if (useSupabasePersistence() && userId) {
    return loadGalleryFromDb(userId);
  }
  return loadJsonFile<GalleryItem[]>(
    userId ? galleryFileForUser(userId) : "gallery-anonymous.json",
    EMPTY_GALLERY,
  );
}

export async function saveGalleryForUser(
  userId: string,
  items: GalleryItem[],
): Promise<GalleryItem[]> {
  if (useSupabasePersistence()) {
    return syncGallery(userId, items);
  }
  await saveJsonFile(galleryFileForUser(userId), items);
  return items;
}

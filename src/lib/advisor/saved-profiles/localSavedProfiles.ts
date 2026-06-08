import "server-only";

import { getPublicAdvisors } from "@/lib/advisors";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import {
  loadSavedProfilesDb,
  mutateSavedProfilesDb,
  type SavedProfileEntry,
} from "@/lib/server/saved-profiles-store";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  isProfileSavedInDb,
  listSavedProfileAdvisorUserIds,
  removeSavedProfileInDb,
  resolveAdvisorProfileUuid,
  saveProfileInDb,
} from "@/lib/server/supabase/telemetry-supabase";

export type SavedProfilesPagination = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

function paginate<T>(items: T[], page: number, limit: number) {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(50, Math.max(1, limit));
  const offset = (validPage - 1) * validLimit;
  const slice = items.slice(offset, offset + validLimit);
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / validLimit) || 0;

  return {
    data: slice,
    pagination: {
      currentPage: validPage,
      pageSize: validLimit,
      totalCount,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1,
    },
  };
}

async function advisorCardsByIds(ids: string[]): Promise<PublicAdvisorCard[]> {
  const advisors = await getPublicAdvisors();
  const byId = new Map(advisors.map((advisor) => [advisor.id, advisor]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as PublicAdvisorCard[];
}

export async function getLocalSavedProfiles(userId: string, page = 1, limit = 10) {
  if (useSupabasePersistence()) {
    const advisorUserIds = await listSavedProfileAdvisorUserIds(userId);
    const { data: pageIds, pagination } = paginate(advisorUserIds, page, limit);
    const cards = await advisorCardsByIds(pageIds);
    return { data: cards, pagination, error: null as string | null };
  }

  const db = loadSavedProfilesDb();
  const entries = db.entries
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);

  const { data: pageEntries, pagination } = paginate(entries, page, limit);
  const cards = await advisorCardsByIds(
    pageEntries.map((entry) => entry.advisorProfileId),
  );

  return { data: cards, pagination, error: null as string | null };
}

export async function checkLocalSavedProfile(userId: string, advisorProfileId: string) {
  if (useSupabasePersistence()) {
    const isSaved = await isProfileSavedInDb(userId, advisorProfileId);
    const profileId = await resolveAdvisorProfileUuid(advisorProfileId);
    return {
      isSaved,
      savedProfileId: isSaved && profileId ? `${userId}:${profileId}` : null,
      error: null as string | null,
    };
  }

  const entry = loadSavedProfilesDb().entries.find(
    (row) => row.userId === userId && row.advisorProfileId === advisorProfileId,
  );

  return {
    isSaved: Boolean(entry),
    savedProfileId: entry ? `${entry.userId}:${entry.advisorProfileId}` : null,
    error: null as string | null,
  };
}

export async function saveLocalAdvisorProfile(userId: string, advisorProfileId: string) {
  if (useSupabasePersistence()) {
    const result = await saveProfileInDb(userId, advisorProfileId);
    if (!result.profileId) {
      return {
        data: null,
        error: "Advisor profile not found",
        message: "Could not save profile",
        isNew: false,
      };
    }

    return {
      data: {
        userId,
        advisorProfileId: result.profileId,
        createdAt: Date.now(),
      },
      error: null as string | null,
      message: result.created ? "Profile saved successfully" : "Profile already saved",
      isNew: result.created,
    };
  }

  let created: SavedProfileEntry | null = null;
  let isNew = false;

  mutateSavedProfilesDb((db) => {
    const exists = db.entries.some(
      (row) => row.userId === userId && row.advisorProfileId === advisorProfileId,
    );
    if (exists) return;

    created = { userId, advisorProfileId, createdAt: Date.now() };
    isNew = true;
    db.entries.push(created);
  });

  if (!created) {
    const existing = loadSavedProfilesDb().entries.find(
      (row) => row.userId === userId && row.advisorProfileId === advisorProfileId,
    );
    return {
      data: existing,
      error: null as string | null,
      message: "Profile already saved",
      isNew: false,
    };
  }

  return {
    data: created,
    error: null as string | null,
    message: "Profile saved successfully",
    isNew,
  };
}

export async function removeLocalSavedProfile(userId: string, advisorProfileId: string) {
  if (useSupabasePersistence()) {
    const removed = await removeSavedProfileInDb(userId, advisorProfileId);
    if (!removed) {
      return { data: null, error: "Saved profile not found" };
    }
    return { data: { userId, advisorProfileId }, error: null as string | null };
  }

  let removed = false;

  mutateSavedProfilesDb((db) => {
    const before = db.entries.length;
    db.entries = db.entries.filter(
      (row) => !(row.userId === userId && row.advisorProfileId === advisorProfileId),
    );
    removed = db.entries.length < before;
  });

  if (!removed) {
    return { data: null, error: "Saved profile not found" };
  }

  return { data: { userId, advisorProfileId }, error: null as string | null };
}

import { randomUUID } from "crypto";
import type { AdvisorNotification, NotificationKind } from "@/lib/notifications/types";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import {
  appendNotificationToDb,
  hasNotificationKindInDb,
  listNotificationsFromDb,
  markAllNotificationsReadInDb,
  markNotificationReadInDb,
} from "@/lib/server/supabase/telemetry-supabase";

const FILE = "notifications.json";

type NotificationsDb = {
  items: AdvisorNotification[];
};

function emptyDb(): NotificationsDb {
  return { items: [] };
}

async function loadDb(): Promise<NotificationsDb> {
  return loadJsonFile(FILE, emptyDb());
}

async function saveDb(db: NotificationsDb) {
  await saveJsonFile(FILE, db);
}

export async function listNotificationsForUser(userId: string): Promise<AdvisorNotification[]> {
  if (useSupabasePersistence()) {
    return listNotificationsFromDb(userId);
  }

  const db = await loadDb();
  return db.items
    .filter((item) => item.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const items = await listNotificationsForUser(userId);
  return items.filter((item) => !item.read).length;
}

export async function hasNotificationKind(
  userId: string,
  kind: NotificationKind,
): Promise<boolean> {
  if (useSupabasePersistence()) {
    return hasNotificationKindInDb(userId, kind);
  }

  const db = await loadDb();
  return db.items.some((item) => item.userId === userId && item.kind === kind);
}

export async function appendNotification(
  input: Omit<AdvisorNotification, "id" | "createdAt" | "read"> & {
    read?: boolean;
  },
): Promise<AdvisorNotification> {
  if (useSupabasePersistence()) {
    return appendNotificationToDb(input);
  }

  const db = await loadDb();
  const entry: AdvisorNotification = {
    ...input,
    id: randomUUID(),
    read: input.read ?? false,
    createdAt: new Date().toISOString(),
  };
  db.items.unshift(entry);
  await saveDb(db);
  return entry;
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
  if (useSupabasePersistence()) {
    return markNotificationReadInDb(userId, notificationId);
  }

  const db = await loadDb();
  const item = db.items.find((row) => row.id === notificationId && row.userId === userId);
  if (!item) return false;
  item.read = true;
  await saveDb(db);
  return true;
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  if (useSupabasePersistence()) {
    return markAllNotificationsReadInDb(userId);
  }

  const db = await loadDb();
  let count = 0;
  for (const item of db.items) {
    if (item.userId === userId && !item.read) {
      item.read = true;
      count += 1;
    }
  }
  if (count) await saveDb(db);
  return count;
}

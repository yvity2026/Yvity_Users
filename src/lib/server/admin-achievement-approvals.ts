import "server-only";

import { appendNotification } from "@/lib/server/notifications-store";
import { loadRegistrationDb } from "@/lib/server/registration-store";
import { markVerified, markRejected } from "@/lib/verification/defaults";
import {
  loadAchievementsFromDb,
  syncAchievements,
} from "@/lib/server/supabase/sync-sections";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { defaultAchievements } from "@/lib/sections/defaults";
import { normalizeAchievements } from "@/lib/sections/normalize-achievements";
import { emptyVerification } from "@/lib/verification/defaults";
import type { AchievementItem } from "@/lib/sections/types";

const ACHIEVEMENTS_FILE = "achievements.json";

export type AchievementVerificationRow = {
  achievementId: string;
  advisorId: string;
  advisorName: string;
  title: string;
  subtitle: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string | null;
  rejectionReason: string | null;
  documentCount: number;
  documentUrls: string[];
};

async function loadItems(advisorId: string): Promise<AchievementItem[]> {
  if (useSupabasePersistence()) {
    return loadAchievementsFromDb(advisorId);
  }
  const raw = await loadJsonFile<unknown>(ACHIEVEMENTS_FILE, defaultAchievements);
  return normalizeAchievements(raw);
}

async function saveItems(advisorId: string, items: AchievementItem[]): Promise<void> {
  if (useSupabasePersistence()) {
    await syncAchievements(advisorId, items);
    return;
  }
  await saveJsonFile(ACHIEVEMENTS_FILE, items);
}

/** List all achievements across all advisors that have pending/rejected verification. */
export async function listPendingAchievementVerifications(): Promise<AchievementVerificationRow[]> {
  const users = loadRegistrationDb().users;
  const rows: AchievementVerificationRow[] = [];

  for (const user of users) {
    const items = await loadItems(user.id).catch(() => []);
    for (const item of items) {
      if (!item.verification || item.verification.documents.length === 0) continue;
      if (item.verification.status === "verified") continue;
      const advisorName = user.fullName?.trim() || "Advisor";
      rows.push({
        achievementId: item.id,
        advisorId: user.id,
        advisorName,
        title: item.title,
        subtitle: item.subtitle || "",
        status: item.verification.status,
        submittedAt: item.verification.submittedAt ?? null,
        rejectionReason: item.verification.rejectionReason ?? null,
        documentCount: item.verification.documents.length,
        documentUrls: item.verification.documents.map((d) => d.url),
      });
    }
  }

  return rows.sort((a, b) =>
    (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""),
  );
}

export async function approveAchievementVerification(
  advisorId: string,
  achievementId: string,
): Promise<void> {
  const items = await loadItems(advisorId);
  const updated = items.map((item) => {
    if (item.id !== achievementId) return item;
    const verification = markVerified(item.verification ?? emptyVerification());
    return { ...item, verification, verified: true };
  });
  await saveItems(advisorId, updated);

  const item = updated.find((i) => i.id === achievementId);
  const user = loadRegistrationDb().users.find((u) => u.id === advisorId);
  const advisorName = user?.fullName?.trim() || "Advisor";

  await appendNotification({
    userId: advisorId,
    kind: "achievement_verified",
    title: "Achievement verified by YVITY ✓",
    message: `Hi ${advisorName}, your achievement "${item?.title ?? "achievement"}" has been verified. A "Verified by YVITY" badge now appears on your public profile.`,
    href: "/dashboard/my-space?section=career",
    meta: { achievementId, verifiedAt: new Date().toISOString() },
  });
}

export async function rejectAchievementVerification(
  advisorId: string,
  achievementId: string,
  reason: string,
): Promise<void> {
  const items = await loadItems(advisorId);
  const updated = items.map((item) => {
    if (item.id !== achievementId) return item;
    const verification = markRejected(item.verification ?? emptyVerification(), reason);
    return { ...item, verification, verified: false };
  });
  await saveItems(advisorId, updated);

  const item = updated.find((i) => i.id === achievementId);
  const user = loadRegistrationDb().users.find((u) => u.id === advisorId);
  const advisorName = user?.fullName?.trim() || "Advisor";

  await appendNotification({
    userId: advisorId,
    kind: "achievement_rejected",
    title: "Achievement verification — action needed",
    message: `Hi ${advisorName}, we could not verify your achievement "${item?.title ?? "achievement"}". Reason: ${reason}. Please re-upload the correct document.`,
    href: "/dashboard/my-space?section=career",
    meta: { achievementId, reason, rejectedAt: new Date().toISOString() },
  });
}

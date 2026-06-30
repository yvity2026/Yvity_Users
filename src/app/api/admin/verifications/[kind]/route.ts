import { NextResponse } from "next/server";
import { defaultAchievements } from "@/lib/sections/defaults";
import { normalizeAchievements } from "@/lib/sections/normalize-achievements";
import type { AchievementItem } from "@/lib/sections/types";
import { requireSession, unauthorized } from "@/lib/server/api-auth";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { emptyVerification, markRejected, markVerified } from "@/lib/verification/defaults";
import type { VerificationRecord } from "@/lib/verification/types";

export const runtime = "nodejs";

const ACHIEVEMENTS_FILE = "achievements.json";

// experiences and certifications verification dropped — handled via achievement-verification route
type AdminKind = "achievements";
const KINDS: AdminKind[] = ["achievements"];

type ReviewBody = {
  entityId: string;
  action: "approve" | "reject";
  reason?: string;
};

type AdminEntity = {
  id: string;
  /** Friendly title for the admin card header. */
  title: string;
  /** Secondary line (issuer, company, category, etc.). */
  subtitle?: string;
  verification: VerificationRecord;
};

/* ------------------------------------------------------------------ */
/*  Adapters — collapse heterogeneous entity shapes into AdminEntity. */
/* ------------------------------------------------------------------ */

function toAchievementEntity(item: AchievementItem): AdminEntity {
  return {
    id: item.id,
    title: item.title || "Untitled achievement",
    subtitle: item.subtitle,
    verification: item.verification ?? emptyVerification(),
  };
}

/* ------------------------------------------------------------------ */
/*  Loaders / mutators                                                 */
/* ------------------------------------------------------------------ */

async function loadAchievements(): Promise<AchievementItem[]> {
  const raw = await loadJsonFile<unknown>(ACHIEVEMENTS_FILE, defaultAchievements);
  return normalizeAchievements(raw);
}

async function listEntities(_kind: AdminKind): Promise<AdminEntity[]> {
  const items = await loadAchievements();
  return items
    .filter((a) => a.verification && a.verification.documents.length > 0)
    .map(toAchievementEntity);
}

function applyVerificationUpdate(
  current: VerificationRecord,
  action: ReviewBody["action"],
  reason?: string,
): VerificationRecord {
  if (action === "approve") return markVerified(current);
  return markRejected(current, reason!.trim());
}

async function mutate(
  _kind: AdminKind,
  entityId: string,
  action: ReviewBody["action"],
  reason: string | undefined,
): Promise<AdminEntity[]> {
  const items = await loadAchievements();
  const next = items.map((a) => {
    if (a.id !== entityId) return a;
    const v = applyVerificationUpdate(a.verification ?? emptyVerification(), action, reason);
    return { ...a, verification: v, verified: v.status === "verified" };
  });
  await saveJsonFile(ACHIEVEMENTS_FILE, next);
  return next
    .filter((a) => a.verification && a.verification.documents.length > 0)
    .map(toAchievementEntity);
}

/* ------------------------------------------------------------------ */
/*  Route handlers                                                     */
/* ------------------------------------------------------------------ */

function isKind(value: string): value is AdminKind {
  return (KINDS as string[]).includes(value);
}

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!isKind(kind)) {
    return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
  }
  const data = await listEntities(kind);
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!(await requireSession())) return unauthorized();

  const { kind } = await params;
  if (!isKind(kind)) {
    return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as ReviewBody | null;
  if (!body || !body.entityId || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (body.action === "reject" && !body.reason?.trim()) {
    return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
  }

  const data = await mutate(kind, body.entityId, body.action, body.reason);
  return NextResponse.json({ ok: true, data });
}

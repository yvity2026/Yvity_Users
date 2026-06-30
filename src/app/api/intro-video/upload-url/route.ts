import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { canUseIntroVideo } from "@/lib/advisor-membership/plan-enforcement";
import { getAdvisorPlanContext } from "@/lib/advisor-membership/plan-enforcement-server";
import { unauthorized } from "@/lib/server/api-auth";
import { getSessionUser } from "@/lib/server/session";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { STORAGE_BUCKETS, publicObjectUrl } from "@/lib/server/supabase/object-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session?.id) return unauthorized();

  const planCtx = await getAdvisorPlanContext(session.id);
  if (planCtx) {
    const enabled = canUseIntroVideo(planCtx.limits, planCtx.planId);
    if (!enabled.ok) {
      return NextResponse.json(
        { error: enabled.reason ?? "Intro video is not available on your plan." },
        { status: 403 },
      );
    }
  }

  let ext = "mp4";
  try {
    const body = (await request.json()) as { contentType?: string };
    const ct = (body.contentType ?? "").toLowerCase();
    if (ct.includes("quicktime") || ct.includes("mov")) ext = "mov";
    else if (ct.includes("webm")) ext = "webm";
    else if (ct.includes("m4v")) ext = "m4v";
  } catch {
    // body is optional
  }

  const supabase = getAdminClientOrNull();
  if (!supabase) {
    return NextResponse.json(
      { error: "Storage is not configured — contact support." },
      { status: 503 },
    );
  }

  const filename = `${session.id}/${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;

  // Ensure bucket exists
  await supabase.storage.createBucket(STORAGE_BUCKETS.introVideo, { public: true }).catch(() => {});

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.introVideo)
    .createSignedUploadUrl(filename, { upsert: true });

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create upload URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path: filename,
    publicUrl: publicObjectUrl(STORAGE_BUCKETS.introVideo, filename),
  });
}

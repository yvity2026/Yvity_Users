import "server-only";

import { normaliseMobile } from "@/lib/recommendations/types";
import type { TestimonialService } from "@/lib/sections/types";
import { loadJsonFile, saveJsonFile } from "@/lib/server/json-store";
import { parseGoldMeta } from "@/lib/server/supabase/gold-meta";
import { useSupabasePersistence } from "@/lib/server/supabase/persistence-mode";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";
import { TESTIMONIAL_DUPLICATE_WINDOW_DAYS } from "@/lib/testimonials/submission-limits";

type SubmissionRecord = {
  mobileNormalised: string;
  service: string;
  submittedAt: string;
};

function submissionsFileForUser(advisorUserId: string) {
  return `testimonial-submissions-${advisorUserId}.json`;
}

function windowStartIso(withinDays = TESTIMONIAL_DUPLICATE_WINDOW_DAYS): string {
  const start = new Date();
  start.setDate(start.getDate() - withinDays);
  return start.toISOString();
}

function isWithinWindow(iso: string | undefined, withinDays: number): boolean {
  if (!iso) return false;
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return false;
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  return ts >= cutoff;
}

async function loadLocalSubmissionRecords(advisorUserId: string): Promise<SubmissionRecord[]> {
  const raw = await loadJsonFile<unknown>(submissionsFileForUser(advisorUserId), []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (row): row is SubmissionRecord =>
      Boolean(row) &&
      typeof row === "object" &&
      typeof (row as SubmissionRecord).mobileNormalised === "string" &&
      typeof (row as SubmissionRecord).service === "string" &&
      typeof (row as SubmissionRecord).submittedAt === "string",
  );
}

export async function recordTestimonialSubmission(
  advisorUserId: string,
  mobile: string,
  service: TestimonialService | string,
): Promise<void> {
  if (useSupabasePersistence()) return;

  const list = await loadLocalSubmissionRecords(advisorUserId);
  list.push({
    mobileNormalised: normaliseMobile(mobile),
    service: String(service),
    submittedAt: new Date().toISOString(),
  });
  await saveJsonFile(submissionsFileForUser(advisorUserId), list);
}

export async function hasRecentTestimonialFromMobileForService(
  advisorUserId: string,
  mobile: string,
  service: TestimonialService | string,
  withinDays = TESTIMONIAL_DUPLICATE_WINDOW_DAYS,
): Promise<boolean> {
  const mobileNormalised = normaliseMobile(mobile);
  if (mobileNormalised.length < 10) return false;

  const serviceKey = String(service).trim();
  if (!serviceKey) return false;

  if (useSupabasePersistence()) {
    const supabase = getAdminClientOrNull();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from("advisor_testimonials")
      .select("content, created_at, mobile_number")
      .eq("advisor_id", advisorUserId)
      .eq("mobile_number", mobileNormalised)
      .gte("created_at", windowStartIso(withinDays));

    if (error || !data?.length) return false;

    return data.some((row) => {
      const mobileNumber = String(row.mobile_number ?? "");
      if (mobileNumber === "0000000000") return false;

      const { meta } = parseGoldMeta(String(row.content ?? ""));
      const rowService = String(meta.service ?? "").trim();
      if (rowService !== serviceKey) return false;

      const submittedAt =
        typeof meta.submittedAt === "string"
          ? meta.submittedAt
          : row.created_at
            ? String(row.created_at)
            : undefined;
      return isWithinWindow(submittedAt, withinDays);
    });
  }

  const records = await loadLocalSubmissionRecords(advisorUserId);
  return records.some(
    (row) =>
      row.mobileNormalised === mobileNormalised &&
      row.service === serviceKey &&
      isWithinWindow(row.submittedAt, withinDays),
  );
}

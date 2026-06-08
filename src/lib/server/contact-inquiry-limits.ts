import "server-only";

import { normaliseMobile } from "@/lib/recommendations/types";
import type { ContactInquiry } from "@/lib/contact-config";
import { loadContactInquiries } from "@/lib/server/contact-persistence";
import { CONTACT_DUPLICATE_WINDOW_DAYS } from "@/lib/contact/submission-limits";

function isWithinWindow(iso: string | undefined, withinDays: number): boolean {
  if (!iso) return false;
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return false;
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  return ts >= cutoff;
}

export async function hasRecentContactInquiryFromMobile(
  advisorUserId: string,
  mobile: string,
  withinDays = CONTACT_DUPLICATE_WINDOW_DAYS,
): Promise<boolean> {
  const mobileNormalised = normaliseMobile(mobile);
  if (mobileNormalised.length < 10) return false;

  const inquiries = await loadContactInquiries(advisorUserId);
  return inquiries.some((row) => {
    if (row.advisorUserId && row.advisorUserId !== advisorUserId) return false;
    return (
      normaliseMobile(row.mobile) === mobileNormalised &&
      isWithinWindow(row.createdAt, withinDays)
    );
  });
}

export function filterContactInquiriesForAdvisor(
  advisorUserId: string,
  rows: ContactInquiry[],
): ContactInquiry[] {
  return rows.filter((row) => !row.advisorUserId || row.advisorUserId === advisorUserId);
}

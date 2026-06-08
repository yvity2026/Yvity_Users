import { NextResponse } from "next/server";
import { getAdvisorPlanContext } from "@/lib/advisor-membership/plan-enforcement-server";
import {
  recordSearchImpressions,
  resolveSearcherKey,
  SEARCHER_COOKIE,
  type SearchImpressionSource,
} from "@/lib/server/search-impressions-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SOURCES = new Set<SearchImpressionSource>([
  "dashboard_home",
  "dashboard_explore",
  "landing_search",
]);

type Body = {
  advisorIds?: string[];
  source?: SearchImpressionSource;
};

/** Record advisor cards shown in client-side search/explore result lists. */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const source = body.source;
  if (!source || !SOURCES.has(source)) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const advisorIds = Array.isArray(body.advisorIds) ? body.advisorIds : [];
  const eligibleIds: string[] = [];
  for (const id of advisorIds) {
    const trimmed = id.trim();
    if (!trimmed) continue;
    const ctx = await getAdvisorPlanContext(trimmed);
    if (ctx?.limits.searchAppearance) eligibleIds.push(trimmed);
  }

  const searcherKey = await resolveSearcherKey();

  await recordSearchImpressions({
    advisorUserIds: eligibleIds,
    searcherKey,
    source,
  });

  const response = NextResponse.json({ ok: true });
  if (searcherKey.startsWith("anon_")) {
    response.cookies.set(SEARCHER_COOKIE, searcherKey, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

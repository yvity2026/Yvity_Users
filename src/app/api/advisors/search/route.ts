import { NextResponse } from "next/server";
import { searchPublicAdvisors } from "@/lib/advisors";
import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
import {
  recordSearchImpressions,
  resolveSearcherKey,
  SEARCHER_COOKIE,
} from "@/lib/server/search-impressions-persistence";
import { getSessionUser } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json(
      { error: "Login required to search advisors", code: "LOGIN_REQUIRED" },
      { status: 401 },
    );
  }

  try {
    const advisors: PublicAdvisorCard[] = await searchPublicAdvisors({
      city: searchParams.get("city"),
      state: searchParams.get("state"),
      service: searchParams.get("service"),
      company: searchParams.get("company"),
      name: searchParams.get("name"),
    });

    const searcherKey = await resolveSearcherKey();
    void recordSearchImpressions({
      advisorUserIds: advisors.map((advisor) => advisor.id),
      searcherKey,
      source: "api_search",
    });

    const response = NextResponse.json({ advisors });
    if (searcherKey.startsWith("anon_")) {
      response.cookies.set(SEARCHER_COOKIE, searcherKey, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  } catch (error) {
    console.error("Advisor search failed:", error);
    return NextResponse.json({ error: "Failed to search advisors" }, { status: 500 });
  }
}

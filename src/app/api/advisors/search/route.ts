import { NextResponse } from "next/server";
import { searchPublicAdvisors } from "@/lib/advisors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const advisors = await searchPublicAdvisors({
      city: searchParams.get("city"),
      state: searchParams.get("state"),
      service: searchParams.get("service"),
      company: searchParams.get("company"),
      name: searchParams.get("name"),
    });

    return NextResponse.json({ advisors });
  } catch (error) {
    console.error("Advisor search failed:", error);
    return NextResponse.json({ error: "Failed to search advisors" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

/** Mock landing stats until YVITY Supabase bridge is connected. */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      verifiedAdvisors: 8,
      citiesCovered: 4,
      verifiedReviews: 11,
    },
  });
}

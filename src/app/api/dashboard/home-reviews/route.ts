import { NextResponse } from "next/server";

/** Mock home reviews until Supabase bridge is connected. */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: "review-1",
        text: "Krishna helped us choose the right health plan for our family. Clear, patient, and very professional.",
        rating: 5,
        reviewerName: "Sandeep R.",
        advisorId: "demo-1",
        advisorName: "Krishna Mohan Noti",
        advisorTitle: "Insurance Advisor & Financial Consultant",
        advisorCity: "Hyderabad",
        profileUrl: "/profile",
        createdAt: new Date().toISOString(),
      },
      {
        id: "review-2",
        text: "I could compare advisors by score and reviews in one place. It made choosing someone I trust much easier.",
        rating: 5,
        reviewerName: "Meera K.",
        advisorId: "demo-4",
        advisorName: "Anita Reddy",
        advisorTitle: "Insurance & Wealth Advisor",
        advisorCity: "Hyderabad",
        profileUrl: "/profile",
        createdAt: new Date().toISOString(),
      },
    ],
  });
}

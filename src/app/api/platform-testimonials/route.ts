import { NextResponse } from "next/server";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

type PlatformTestimonialRow = {
  id: string;
  name: string;
  profession: string;
  city: string;
  respondent_type: string;
  testimonial_type: string;
  testimonial_rating: number;
  content: string | null;
  media_url: string | null;
  yvity_reply: string | null;
  status: string;
};

function mapForLanding(row: PlatformTestimonialRow) {
  const type = row.testimonial_type || "text";

  return {
    id: row.id,
    name: row.name,
    role: `${row.profession || "Member"} • ${row.city || "India"}`,
    type: row.respondent_type === "advisor" ? "Advisor" : "Customer",
    text:
      type === "text"
        ? `"${row.content || ""}"`
        : `"Shared a ${type} testimonial about their YVITY experience."`,
    rating: row.testimonial_rating || 0,
    status: "Verified",
    hasAudio: type === "audio",
    hasVideo: type === "video",
    hasMedia: type === "audio" || type === "video",
    mediaUrl: row.media_url,
    replyText: row.yvity_reply || null,
  };
}

export async function GET() {
  try {
    const supabase = getAdminClientOrNull();

    if (!supabase) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from("yvity_testimonials")
      .select(
        "id, name, profession, city, respondent_type, testimonial_type, testimonial_rating, content, media_url, yvity_reply, status",
      )
      .eq("status", "approved")
      .order("testimonial_rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("GET /api/platform-testimonials failed:", error);
      return NextResponse.json({ error: "Unable to load testimonials" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: (data || []).map((row) => mapForLanding(row as PlatformTestimonialRow)),
    });
  } catch (error) {
    console.error("GET /api/platform-testimonials failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

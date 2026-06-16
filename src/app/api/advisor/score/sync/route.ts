import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { getAdvisorProfileForUser } from "@/lib/server/advisor-profile-store";
import { isAdvisorProfileApproved } from "@/lib/advisor/profile-approval";
import { hasIrdaiCertificateUploaded } from "@/lib/advisor/irdai-workspace";
import { loadCareerForUser } from "@/lib/server/career-persistence";
import { loadAdvisorSettings } from "@/lib/server/advisor-settings-persistence";
import { countVerifiedRecommendations } from "@/lib/server/recommendations-persistence";
import { countSelfProfileShares } from "@/lib/server/profile-shares-persistence";
import {
  loadAchievementsForUser,
  loadGalleryForUser,
  loadServicesForUser,
} from "@/lib/server/section-persistence";
import { loadTestimonials } from "@/lib/server/testimonials-persistence";
import { resolvePlanLimits } from "@/lib/advisor-membership/plan-limits";
import { getPlanGatedIntroVideoUrl } from "@/lib/intro-video";
import { getYvityScoreTotal } from "@/lib/advisor-score/build";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const userId = session.id;

    const [profile, services, achievements, testimonials, gallery, settings, career, verifiedRecs, selfShareCount] =
      await Promise.all([
        getAdvisorProfileForUser(userId),
        loadServicesForUser(userId),
        loadAchievementsForUser(userId),
        loadTestimonials(userId),
        loadGalleryForUser(userId),
        loadAdvisorSettings(userId),
        loadCareerForUser(userId),
        countVerifiedRecommendations(userId),
        countSelfProfileShares(userId),
      ]);

    const profileApproved = isAdvisorProfileApproved(profile);
    const underReview = profile?.account_status === "under_review";
    const publicProfileActive = settings.publicProfile?.profileActive ?? profileApproved;
    const limits = resolvePlanLimits(profile?.subscription_plan, profile?.account_status);
    const photoUrl = session.selfie_url ?? undefined;
    const introVideoUrl = getPlanGatedIntroVideoUrl(settings, limits);

    const score = getYvityScoreTotal({
      photoUrl: photoUrl?.trim() || undefined,
      introVideoUrl,
      publicProfileActive,
      profileApproved,
      irdaiCertificateUploaded: hasIrdaiCertificateUploaded(profile),
      career,
      services,
      achievements,
      testimonials,
      gallery,
      underReview,
      verifiedRecommendationCount: underReview ? 0 : verifiedRecs,
      selfShareCount,
    });

    const finalScore = Math.max(0, Math.min(100, score));

    const supabase = getAdminClientOrNull();
    if (supabase) {
      const [scoreResult] = await Promise.all([
        supabase
          .from("advisor_scores")
          .upsert({ advisor_id: userId, total_score: finalScore }, { onConflict: "advisor_id" }),
        // Sync selfie_url to users table so Find Advisors cards show the correct photo
        session.selfie_url
          ? supabase
              .from("users")
              .update({ selfie_url: session.selfie_url })
              .eq("id", userId)
          : Promise.resolve(null),
      ]);

      if (scoreResult.error) {
        console.warn("[score/sync] upsert failed:", scoreResult.error.message);
      }
    }

    return NextResponse.json({ success: true, score: finalScore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Score sync failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

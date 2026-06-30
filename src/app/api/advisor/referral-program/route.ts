import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/session";
import { ensureAmbassadorForUser } from "@/lib/server/referrals-store";
import { loadReferralsForAmbassadorFromDb } from "@/lib/server/supabase/referrals-supabase";
import { getAdminClientOrNull } from "@/lib/supabase/adminClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Credit constants ────────────────────────────────────────────
const CREDITS_PER_PLAN: Record<string, number> = {
  silver: 600,
  gold: 1000,
};

// ── Extension thresholds (credits → months) ─────────────────────
const EXTENSION_TIERS = [
  { credits: 3000, months: 1 },
  { credits: 6000, months: 2 },
  { credits: 9000, months: 3 },
  { credits: 12000, months: 4 },
  { credits: 15000, months: 6 },
  { credits: 25000, months: 12 },
];

// ── Ambassador badge tiers ──────────────────────────────────────
const BADGE_TIERS = [
  { threshold: 100, label: "Diamond Ambassador", color: "#60A5FA" },
  { threshold: 60,  label: "Platinum Ambassador", color: "#C084FC" },
  { threshold: 30,  label: "Gold Ambassador",     color: "#F59E0B" },
  { threshold: 15,  label: "Silver Ambassador",   color: "#94A3B8" },
  { threshold: 5,   label: "Bronze Ambassador",   color: "#CD7F32" },
];

function computeBadge(qualifiedCount: number) {
  for (const tier of BADGE_TIERS) {
    if (qualifiedCount >= tier.threshold) return tier;
  }
  return null;
}

function computeNextBadge(qualifiedCount: number) {
  for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
    if (qualifiedCount < BADGE_TIERS[i].threshold) return BADGE_TIERS[i];
  }
  return null;
}

function computeExtension(credits: number) {
  let result = { months: 0, label: "" };
  for (const tier of EXTENSION_TIERS) {
    if (credits >= tier.credits) {
      result = {
        months: tier.months,
        label: tier.months === 12 ? "1 Year FREE Extension" : `${tier.months} Month${tier.months > 1 ? "s" : ""} Extension`,
      };
    }
  }
  return result;
}

function computeNextExtension(credits: number) {
  for (const tier of EXTENSION_TIERS) {
    if (credits < tier.credits) return tier;
  }
  return null;
}

type ReferralRowArray = Awaited<ReturnType<typeof loadReferralsForAmbassadorFromDb>>;

async function syncCreditsToReferrals(referrals: ReferralRowArray) {
  const supabase = getAdminClientOrNull();
  if (!supabase) return;

  for (const r of referrals) {
    if (r.status !== "qualified") continue;
    if (r.planPurchased && (r as Record<string, unknown>).credits_awarded == null) {
      const credits = CREDITS_PER_PLAN[r.planPurchased] ?? 0;
      if (credits > 0) {
        await supabase
          .from("referrals")
          .update({ credits_awarded: credits })
          .eq("id", r.id)
          .is("credits_awarded", null);
      }
    }
  }
}

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session?.id) {
      return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
    }

    const userId = session.id;
    const ambassador = await ensureAmbassadorForUser(userId);

    // Load all referrals for this advisor
    const referrals = await loadReferralsForAmbassadorFromDb(userId);

    // Sync credits_awarded for any qualified referral missing it
    await syncCreditsToReferrals(referrals);

    // Re-load with updated credits (or read from supabase directly)
    const supabase = getAdminClientOrNull();
    const { data: refreshedReferrals } = supabase
      ? await supabase.from("referrals").select("*").eq("referrer_user_id", userId).order("registered_at", { ascending: false })
      : { data: referrals };

    const rows = (refreshedReferrals ?? referrals) as Array<Record<string, unknown>>;

    // ── Compute stats ────────────────────────────────────────────
    const totalReferrals = rows.length;
    const qualifiedReferrals = rows.filter((r) => r.status === "qualified");
    const pendingReferrals = rows.filter((r) => r.status === "registered");
    const qualifiedCount = qualifiedReferrals.length;

    // ── Credits ─────────────────────────────────────────────────
    const totalCredits = rows.reduce((sum, r) => sum + (Number(r.credits_awarded) || 0), 0);

    // ── Badge ────────────────────────────────────────────────────
    const badge = computeBadge(qualifiedCount);
    const nextBadge = computeNextBadge(qualifiedCount);
    const badgeProgress = nextBadge
      ? { needed: nextBadge.threshold, remaining: nextBadge.threshold - qualifiedCount }
      : null;

    // ── Extension ───────────────────────────────────────────────
    const currentExtension = computeExtension(totalCredits);
    const nextExtensionTier = computeNextExtension(totalCredits);
    const creditsToNext = nextExtensionTier ? nextExtensionTier.credits - totalCredits : 0;

    // ── History (last 20) ───────────────────────────────────────
    const history = rows.slice(0, 20).map((r) => ({
      id: String(r.id),
      name: String(r.referred_user_name || "—"),
      status: String(r.status),
      planPurchased: r.plan_purchased ? String(r.plan_purchased) : null,
      creditsAwarded: Number(r.credits_awarded) || 0,
      registeredAt: String(r.registered_at || ""),
    }));

    return NextResponse.json({
      success: true,
      data: {
        referralCode: ambassador.referralCode,
        referralLink: ambassador.referralLink,
        totalCredits,
        currentExtension,
        nextExtensionTier,
        creditsToNext,
        extensionTiers: EXTENSION_TIERS,
        badge,
        nextBadge,
        badgeProgress,
        allBadgeTiers: BADGE_TIERS,
        stats: {
          total: totalReferrals,
          qualified: qualifiedCount,
          pending: pendingReferrals.length,
        },
        history,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load referral data";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

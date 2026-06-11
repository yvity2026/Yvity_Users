"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import UserProfileAvatar from "@/components/user/UserProfileAvatar";
import SetupMyProfileModal from "@/components/advisor/setup-profile/SetupMyProfileModal";
import { MySpaceSetupBanner } from "@/components/advisor/my-space-setup-banner";
import YvityGoldMySpaceDashboard from "@/components/yvity-gold/yvity-gold-my-space-dashboard";
import { shouldShowGoldAdvisorWorkspace } from "@/lib/dashboard/goldWorkspace";
import { useAdvisorWorkspaceSetup } from "@/hooks/useAdvisorWorkspaceSetup";
import { useAuth } from "@/context/AuthUserContext";
import { parseUserRoles } from "@/lib/advisor/workspaceSetupStatus";

function WorkspaceCardBody({ workspaceActive, isAdvisorRole, accountStatus }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F4F4] text-[#0A4A4A]">
        <BriefcaseBusiness size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-cormorant text-xl font-bold text-[#0A4A4A]">Advisor workspace</h3>
        <p className="mt-1 font-poppins text-sm text-[#6B7280]">
          {workspaceActive
            ? "Your advisor dashboard is ready — profile, YVITY score, testimonials, and quick actions."
            : isAdvisorRole
              ? accountStatus === "action_required"
                ? "Complete your profile setup to activate your advisor workspace."
                : accountStatus === "under_review"
                  ? "IRDAI license submitted — awaiting admin verification (usually 24–48 hours)."
                  : "Upload your IRDAI certificate and services to complete My Space setup."
              : "Create your verified advisor workspace when you want to list services on YVITY."}
        </p>
      </div>
    </div>
  );
}

function WorkspaceSetupActions({ setupState, onSetupMySpace }) {
  const { showSetupWorkspace, isUnderReview } = setupState;

  if (isUnderReview) {
    return (
      <p className="mt-4 rounded-xl bg-[#E6F4F4] px-4 py-3 font-poppins text-sm text-[#0A4A4A]">
        IRDAI certificate received — admin verification usually takes 24–48 hours. Keep building
        your profile; score and sharing points unlock after approval.
      </p>
    );
  }

  if (showSetupWorkspace) {
    return (
      <button
        type="button"
        onClick={onSetupMySpace}
        className="mt-4 inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#0A4A4A] px-5 py-3 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.25)] transition hover:bg-[#083c3c] active:scale-[0.98] sm:w-auto"
      >
        Setup My Space
        <ArrowRight size={16} />
      </button>
    );
  }

  return (
    <p className="mt-4 font-poppins text-sm font-medium text-[#89B5B7]">
      Finish setup to unlock your public profile.
    </p>
  );
}

export default function DashboardMySpace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, advisor, loading } = useAuth();
  const setup = useAdvisorWorkspaceSetup();
  const [setupProfileOpen, setSetupProfileOpen] = useState(false);

  const { setupState } = setup;
  const { isUnderReview, showSetupWorkspace, irdaiPendingAdminReview } = setupState;

  const showGoldWorkspace = shouldShowGoldAdvisorWorkspace(user, advisor);
  const roleList = parseUserRoles(user);
  const isAdvisorRole = roleList.includes("advisor");

  useEffect(() => {
    const intent = searchParams.get("setup");
    if (!intent) return;

    if (intent === "profile" || intent === "workspace") {
      if (showSetupWorkspace || intent === "profile") {
        setSetupProfileOpen(true);
      }
      router.replace("/dashboard/my-space", { scroll: false });
      return;
    }

    if (intent === "submitted") {
      void setup.refreshAuthState();
      router.replace("/dashboard/my-space", { scroll: false });
    }
  }, [searchParams, showSetupWorkspace, setup.refreshAuthState, router]);

  if (loading) {
    return (
      <div
        className={
          showGoldWorkspace
            ? "flex min-h-[100dvh] items-center justify-center bg-background"
            : "mx-auto w-full max-w-[1200px] animate-pulse px-3 py-5 sm:px-4"
        }
      >
        {showGoldWorkspace ? (
          <p className="font-poppins text-sm text-muted-foreground">Loading workspace…</p>
        ) : (
          <>
            <div className="mb-6 h-10 w-56 rounded-lg bg-[#E4E2DB]" />
            <div className="h-32 rounded-[28px] bg-[#E4E2DB]" />
          </>
        )}
      </div>
    );
  }

  const openSetupProfile = async () => {
    try {
      const res = await fetch("/api/auth/advisor-intent", { method: "POST" });
      if (res.ok) await setup.refreshAuthState();
    } catch {
      // modal can still open
    }
    setSetupProfileOpen(true);
  };

  const handleSetupComplete = async () => {
    setSetupProfileOpen(false);
    await setup.refreshAuthState();
  };

  if (showGoldWorkspace) {
    return (
      <>
        <SetupMyProfileModal
          isOpen={setupProfileOpen}
          onClose={() => setSetupProfileOpen(false)}
          onComplete={handleSetupComplete}
        />

        {showSetupWorkspace ? (
          <MySpaceSetupBanner variant="setup" onSetup={openSetupProfile} />
        ) : irdaiPendingAdminReview ? (
          <MySpaceSetupBanner variant="review" />
        ) : null}

        <YvityGoldMySpaceDashboard reviewMode={isUnderReview} />
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8">
      <SetupMyProfileModal
        isOpen={setupProfileOpen}
        onClose={() => setSetupProfileOpen(false)}
        onComplete={handleSetupComplete}
      />

      <div className="mb-6">
        <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">My Space</h1>
        <p className="mt-2 font-poppins text-sm text-[#6B7280] sm:text-base">
          Your personal hub on YVITY — workspace, account, and identity.
        </p>
      </div>

      <section className="yvity-on-dark rounded-[28px] bg-[#124B48] p-5 text-white sm:p-6">
        <div className="flex items-center gap-4">
          <UserProfileAvatar
            src={user?.selfie_url}
            name={user?.name}
            size={64}
            className="shrink-0 ring-2 ring-[#F59E0B]"
          />
          <div className="min-w-0 flex-1">
            <p className="font-poppins text-sm text-[#89B5B7]">Signed in as</p>
            <h2 className="mt-0.5 font-cormorant text-xl font-bold leading-snug text-white break-words sm:text-2xl">
              {user?.name || "YVITY member"}
            </h2>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[#E4E2DB] bg-white p-5 shadow-sm sm:p-6">
        <WorkspaceCardBody
          workspaceActive={setupState.canAccessDashboard}
          isAdvisorRole={isAdvisorRole}
          accountStatus={advisor?.account_status}
        />
        <WorkspaceSetupActions setupState={setupState} onSetupMySpace={openSetupProfile} />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/profile"
          className="rounded-2xl border border-[#E4E2DB] bg-white p-5 shadow-sm transition hover:border-[#0A4A4A]/20"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F6F1] text-[#0A4A4A]">
            <UserRound size={20} />
          </div>
          <h3 className="font-cormorant text-lg font-bold text-[#0A4A4A]">Profile & account</h3>
          <p className="mt-1 font-poppins text-sm text-[#6B7280]">
            Name, contact details, selfie, and identity settings.
          </p>
        </Link>

        <Link
          href="/dashboard/identity-refresh"
          className="rounded-2xl border border-[#E4E2DB] bg-white p-5 shadow-sm transition hover:border-[#0A4A4A]/20"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#047857]">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-cormorant text-lg font-bold text-[#0A4A4A]">
            Identity verification
          </h3>
          <p className="mt-1 font-poppins text-sm text-[#6B7280]">
            Refresh your live selfie when your YVITY anniversary is due.
          </p>
        </Link>
      </section>
    </div>
  );
}

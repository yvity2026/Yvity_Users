"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { getIdentityRefreshStatus } from "@/lib/identity/refreshPolicy";
import IdentityRefreshBanner from "@/components/identity/IdentityRefreshBanner";

export default function IdentityDashboardShell({ children, className = "" }) {
  const { user } = useAuth();

  const identityData = useMemo(() => {
    if (!user) return null;
    return getIdentityRefreshStatus(user);
  }, [user]);

  return (
    <div className={className}>
      <div className="mx-auto w-full max-w-[1200px] px-3 pt-4 sm:px-4">
        <IdentityRefreshBanner identityData={identityData} />
      </div>
      {children}
    </div>
  );
}

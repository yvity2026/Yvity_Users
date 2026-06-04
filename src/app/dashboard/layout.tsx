import DashboardShell from "@/components/dashboard/DashboardShell";
import { ProfileThemeProvider } from "@/components/profile-theme-provider";
import { AuthProvider } from "@/context/AuthUserContext";
import { AdvisorSettingsProvider } from "@/lib/advisor-settings-store";
import { mapSessionToDashboardUser } from "@/lib/dashboard/map-session-user";
import { getSessionUser } from "@/lib/server/session";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser();

  if (!sessionUser?.id && !sessionUser?.identifier) {
    redirect("/?login=true");
  }

  const initialUser = mapSessionToDashboardUser(sessionUser);

  return (
    <AuthProvider initialUser={initialUser}>
      <AdvisorSettingsProvider>
        <ProfileThemeProvider>
          <DashboardShell>{children}</DashboardShell>
        </ProfileThemeProvider>
      </AdvisorSettingsProvider>
    </AuthProvider>
  );
}

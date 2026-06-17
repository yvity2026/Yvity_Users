"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getIdentityRefreshStatus } from "@/lib/identity/refreshPolicy";

export type DashboardUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  profession?: string;
  selfie_url?: string | null;
  mobile?: string;
  address_line?: string;
  pincode?: string;
  about?: string;
  mobile_verified?: boolean;
  email_verified?: boolean;
  roles?: string[] | string;
  onboarding_cta_completed?: boolean;
  identity_verified_at?: string | null;
  created_at?: string | null;
};

export type DashboardAdvisor = {
  id?: string;
  advisor_id?: string;
  account_status?: string;
  profile_status?: boolean;
  subscription_plan?: string;
  profile_slug?: string;
  approved_at?: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
  iridai_certificate_url?: string | null;
  irdai_rejected_reason?: string | null;
  designation?: string | null;
} | null;

export type IdentityRefreshData = ReturnType<typeof getIdentityRefreshStatus>;

type AuthContextValue = {
  user: DashboardUser | null;
  advisor: DashboardAdvisor;
  identityData: IdentityRefreshData | null;
  setUser: (user: DashboardUser | null) => void;
  setAdvisor: (advisor: DashboardAdvisor) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshIdentity: () => Promise<IdentityRefreshData | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(raw: Record<string, unknown> | null | undefined): DashboardUser | null {
  if (!raw) return null;

  const phone = String(raw.phone ?? raw.identifier ?? "");
  const email = String(raw.email ?? "");
  const id = raw.id != null ? String(raw.id) : undefined;
  const name = String(raw.name ?? "");

  if (!id && !name && !phone && !email) return null;

  return {
    id,
    name,
    email,
    phone,
    city: String(raw.city ?? ""),
    state: String(raw.state ?? ""),
    profession: String(raw.profession ?? ""),
    selfie_url: (raw.selfie_url as string | null | undefined) ?? (raw.selfieUrl as string | null | undefined) ?? null,
    mobile: String(raw.mobile ?? raw.phone ?? raw.identifier ?? ""),
    address_line: String(raw.address_line ?? ""),
    pincode: String(raw.pincode ?? ""),
    about: String(raw.about ?? ""),
    mobile_verified: Boolean(raw.mobile_verified),
    email_verified: Boolean(raw.email_verified),
    roles: (raw.roles as string[] | string | undefined) ?? [],
    onboarding_cta_completed: Boolean(raw.onboarding_cta_completed),
    identity_verified_at: (raw.identity_verified_at as string | null | undefined) ?? null,
    created_at: (raw.created_at as string | null | undefined) ?? null,
  };
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: DashboardUser | null;
}) {
  const [user, setUser] = useState<DashboardUser | null>(initialUser);
  const [advisor, setAdvisor] = useState<DashboardAdvisor>(null);
  const [loading, setLoading] = useState(!initialUser);

  const identityData = useMemo(
    () => (user ? getIdentityRefreshStatus(user) : null),
    [user],
  );

  const refreshIdentity = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const result = (await response.json()) as { user?: Record<string, unknown> };
      const currentUser = normalizeUser(result.user ?? null);
      setUser(currentUser);
      return currentUser ? getIdentityRefreshStatus(currentUser) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);

        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const result = (await response.json()) as {
          user?: Record<string, unknown>;
          data?: Record<string, unknown>;
        };
        const currentUser = normalizeUser(result.user ?? result.data ?? null);
        setUser(currentUser);

        try {
          const advRes = await fetch("/api/advisor/auth/me", { cache: "no-store" });
          if (advRes.ok) {
            const advResult = (await advRes.json()) as {
              data?: DashboardAdvisor;
              advisor?: DashboardAdvisor;
            };
            setAdvisor(advResult.data ?? advResult.advisor ?? null);
          } else {
            setAdvisor(null);
          }
        } catch {
          setAdvisor(null);
        }
      } catch (error) {
        console.error("Auth fetch error:", error);
        setUser(null);
        setAdvisor(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        advisor,
        identityData,
        setUser,
        setAdvisor,
        loading,
        setLoading,
        refreshIdentity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

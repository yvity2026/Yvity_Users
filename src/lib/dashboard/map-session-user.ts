import type { AuthUser } from "@/lib/auth-store";
import type { DashboardUser } from "@/context/AuthUserContext";

export function mapSessionToDashboardUser(session: AuthUser | null): DashboardUser | null {
  if (!session) return null;

  const phone = session.phone ?? (session.method === "phone" ? session.identifier : "");
  const email = session.email ?? (session.method === "email" ? session.identifier : "");

  if (!session.id && !session.name && !phone && !email) {
    return null;
  }

  return {
    id: session.id,
    name: session.name,
    email,
    phone,
    city: session.city,
    state: session.state,
    profession: session.profession,
    selfie_url: session.selfie_url ?? null,
    mobile: phone || undefined,
    address_line: session.address_line,
    pincode: session.pincode,
    about: session.about,
    roles: session.roles ?? [],
    onboarding_cta_completed: session.onboarding_cta_completed ?? false,
    identity_verified_at: (session as { identity_verified_at?: string }).identity_verified_at ?? null,
    created_at: null,
  };
}

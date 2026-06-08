declare module "@/yvity-landing/app/components/home/FindAdvisors" {
  import type { PublicAdvisorCard } from "@/lib/advisors/mock-public-advisors";
  import type { ComponentType } from "react";

  const FindAdvisors: ComponentType<{
    advisors?: PublicAdvisorCard[];
    isLoggedIn?: boolean;
  }>;
  export default FindAdvisors;
}

declare module "@/components/auth/RegistrationModal" {
  import type { ComponentType } from "react";

  const RegistrationModal: ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin?: (phone?: string) => void;
    referralCode?: string | null;
  }>;
  export default RegistrationModal;
}

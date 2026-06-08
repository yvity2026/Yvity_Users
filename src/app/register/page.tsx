"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RegistrationModal from "@/components/auth/RegistrationModal";
import {
  captureReferralCodeFromSearch,
  readStoredReferralCode,
} from "@/lib/referral/attribution";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const query = searchParams.toString();
    if (query) {
      captureReferralCodeFromSearch(`?${query}`);
    }
    setReferralCode(readStoredReferralCode());
    setOpen(true);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <RegistrationModal
        isOpen={open}
        referralCode={referralCode}
        onClose={() => {
          setOpen(false);
          router.push("/");
        }}
        onSwitchToLogin={(phone?: string) => {
          if (phone && typeof window !== "undefined") {
            sessionStorage.setItem("yvity_login_phone", phone);
          }
          router.push("/?login=true");
        }}
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-[#F8F6F1]" aria-label="Loading registration" />}
    >
      <RegisterPageContent />
    </Suspense>
  );
}

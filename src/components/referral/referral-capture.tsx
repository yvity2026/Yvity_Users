"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { captureReferralCodeFromSearch } from "@/lib/referral/attribution";

export function ReferralCapture() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    if (!query) return;

    const code = captureReferralCodeFromSearch(`?${query}`);
    if (!code) return;

    if (pathname === "/") {
      router.replace(`/register?ref=${encodeURIComponent(code)}`);
    }
  }, [pathname, router, searchParams]);

  return null;
}

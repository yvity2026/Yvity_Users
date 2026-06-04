"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy /login URL — opens login modal on the landing page. */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/?login=true");
  }, [router]);

  return null;
}

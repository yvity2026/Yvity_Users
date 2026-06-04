"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RegistrationModal from "@/components/auth/RegistrationModal";

export default function RegisterPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <RegistrationModal
      isOpen={open}
      onClose={() => {
        setOpen(false);
        router.push("/");
      }}
      onSwitchToLogin={(phone?: string) => {
        if (phone && typeof window !== "undefined") {
          sessionStorage.setItem("yvity_login_phone", phone);
        }
        router.push("/login");
      }}
    />
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import RegistrationModal from "@/components/auth/RegistrationModal";
import { openLoginModal } from "@/lib/ui/openLoginModal";
import {
  OPEN_REGISTRATION_MODAL_EVENT,
} from "@/lib/ui/openRegistrationModal";

export function RegistrationProvider() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openModal = () => setOpen(true);
    window.addEventListener(OPEN_REGISTRATION_MODAL_EVENT, openModal);
    return () => window.removeEventListener(OPEN_REGISTRATION_MODAL_EVENT, openModal);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleSwitchToLogin = useCallback(
    (phone?: string) => {
      setOpen(false);
      if (phone && typeof window !== "undefined") {
        sessionStorage.setItem("yvity_login_phone", phone);
      }
      openLoginModal();
    },
    [],
  );

  return (
    <RegistrationModal
      isOpen={open}
      onClose={handleClose}
      onSwitchToLogin={handleSwitchToLogin}
    />
  );
}

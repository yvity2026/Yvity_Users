"use client";

import { useCallback, useEffect, useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import { OPEN_LOGIN_MODAL_EVENT } from "@/lib/ui/openLoginModal";
import { openRegistrationModal } from "@/lib/ui/openRegistrationModal";

export function LoginProvider() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openModal = () => setOpen(true);
    window.addEventListener(OPEN_LOGIN_MODAL_EVENT, openModal);

    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "true") {
      setOpen(true);
      params.delete("login");
      const query = params.toString();
      const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", nextUrl);
    }

    return () => window.removeEventListener(OPEN_LOGIN_MODAL_EVENT, openModal);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleSwitchToRegister = useCallback(() => {
    setOpen(false);
    openRegistrationModal();
  }, []);

  return (
    <LoginModal
      isOpen={open}
      onClose={handleClose}
      onSwitchToRegister={handleSwitchToRegister}
    />
  );
}

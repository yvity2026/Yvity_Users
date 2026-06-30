"use client";

import { useEffect, useRef } from "react";
import { X, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { openLoginModal } from "@/yvity-landing/lib/ui/openLoginModal";
import { openRegistrationModal } from "@/yvity-landing/lib/ui/openRegistrationModal";

/**
 * Modal shown when an unauthenticated visitor clicks "View Profile" on a
 * non-featured advisor card. After login/register the browser navigates to
 * the stored profile URL.
 *
 * Props:
 *   open        — boolean
 *   profileUrl  — the advisor profile URL to redirect to after login
 *   onClose     — () => void
 */
export function AdvisorProfileGateModal({ open, profileUrl, onClose }) {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Trap scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleLogin = () => {
    onClose();
    // Store destination so the login flow can redirect after success
    if (profileUrl && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("yvity-post-login-redirect", profileUrl);
    }
    openLoginModal();
  };

  const handleRegister = () => {
    onClose();
    if (profileUrl && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("yvity-post-login-redirect", profileUrl);
    }
    openRegistrationModal();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="gate-modal-title"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" aria-hidden />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[28px] bg-white shadow-[0_24px_64px_rgba(10,74,74,0.22)]">

        {/* Teal header strip */}
        <div className="bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] px-6 pt-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/80 transition hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
            <ShieldCheck className="h-6 w-6 text-[#F59E0B]" />
          </div>
          <h2
            id="gate-modal-title"
            className="font-cormorant text-[22px] font-bold leading-tight text-white"
          >
            View Full Advisor Profile
          </h2>
          <p className="mt-1.5 font-poppins text-[13px] leading-relaxed text-white/80">
            Please login or create a free customer account to view this advisor profile.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 px-6 py-5">
          <button
            type="button"
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0A4A4A] px-5 py-3 font-poppins text-sm font-semibold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.25)] transition hover:bg-[#083c3c] active:scale-[0.98]"
          >
            <LogIn className="h-4 w-4" />
            Login
          </button>

          <button
            type="button"
            onClick={handleRegister}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#0A4A4A] bg-white px-5 py-3 font-poppins text-sm font-semibold text-[#0A4A4A] transition hover:bg-[#F8F6F1] active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            Create Free Account
          </button>

          <p className="text-center font-poppins text-[11px] text-[#6B7280]">
            Free to join · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}

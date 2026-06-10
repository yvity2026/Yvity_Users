"use client";

import React, { useState, useRef, useEffect } from "react";
import BrandMark from "@/yvity-landing/components/brand/BrandMark";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  ComplianceFooter,
  FieldError,
  FieldLabel,
  OtpInputs,
  PrimaryButton,
} from "@/components/auth/registration/registrationUi";
import { sendOtp } from "@/lib/api/auth/sendOtp";
import { verifyOtp } from "@/lib/api/auth/verifyOtp";
import { createFreshDeviceToken } from "@/lib/deviceToken";
import { notifyAuthChanged } from "@/lib/auth-store";
import {
  formatOtpResendTimer,
  useOtpResendCountdown,
} from "@/hooks/use-otp-resend-countdown";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { modalPanelMotion, stepSlideMotion } from "@/lib/ui/framer-reduced-motion";

const loginSchema = z.object({
  mobile: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit phone number starting with 6-9",
    ),
  otp: z
    .string()
    .length(6, "6-digit OTP required")
    .optional()
    .or(z.literal("")),
  rememberMe: z.boolean().default(true),
});

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const reducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(1);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [deactivatedAccount, setDeactivatedAccount] = useState(null);
  const otpRefs = useRef([]);
  const authDeviceTokenRef = useRef("");
  const modalPanelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const {
    otpSecondsLeft,
    canResend,
    startCountdown,
    resetCountdown,
  } = useOtpResendCountdown();

  const {
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: "", otp: "", rememberMe: true },
    mode: "onChange",
  });

  const mobileValue = watch("mobile") || "";
  const otpValue = watch("otp") || "";

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSendingOtp(false);
      setIsResendingOtp(false);
      setIsVerifyingOtp(false);
      setDeactivatedAccount(null);
      authDeviceTokenRef.current = "";
      reset();
      setOtpArray(["", "", "", "", "", ""]);
      resetCountdown();

      const prefilledPhone = sessionStorage.getItem("yvity_login_phone");
      if (prefilledPhone && /^[6-9]\d{9}$/.test(prefilledPhone)) {
        setValue("mobile", prefilledPhone, { shouldValidate: true });
        sessionStorage.removeItem("yvity_login_phone");
      }
    }
  }, [isOpen, reset, resetCountdown, setValue]);

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current =
      typeof document !== "undefined" ? document.activeElement : null;

    const panel = modalPanelRef.current;
    const focusable = panel?.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    if (first && typeof first.focus === "function") {
      window.setTimeout(() => first.focus(), 0);
    }

    const handleKeyDown = (e) => {
      if (e.key !== "Tab" || !panel) return;
      const nodes = panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (nodes.length === 0) return;
      const list = Array.from(nodes);
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === "function") {
        prev.focus();
      }
    };
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").replace(/^[0-5]+/, "");
    if (val.length <= 10) {
      setValue("mobile", val, { shouldValidate: true });
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);
    setValue("otp", newOtp.join(""), { shouldValidate: true });

    if (value && index < otpArray.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;
    e.preventDefault();

    const newOtp = pasteData.split("");
    setOtpArray(newOtp);
    setValue("otp", pasteData, { shouldValidate: true });

    setTimeout(() => {
      otpRefs.current[5]?.focus();
    }, 0);
  };

  const handleLoginOtpResult = (result) => {
    if (result.error) {
      if (result.redirectToRegister) {
        toast.error(result.error);
        onSwitchToRegister?.();
        return false;
      }

      if (result.accountDeactivated && result.canReactivate) {
        setDeactivatedAccount({
          deactivatedUntil: result.deactivatedUntil || null,
        });
        setStep(3);
        return false;
      }

      toast.error(result.error);
      return false;
    }

    setDeactivatedAccount(null);
    return true;
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSendingOtp) return;

    const isMobileValid = await trigger("mobile");
    if (!isMobileValid) return;

    setIsSendingOtp(true);
    const result = await sendOtp(mobileValue, "login");
    setIsSendingOtp(false);

    if (!handleLoginOtpResult(result)) {
      return;
    }

    toast.success("OTP sent successfully");
    startCountdown();
    setStep(2);
  };

  const handleReactivateAccount = async () => {
    if (isSendingOtp) return;

    setIsSendingOtp(true);
    const result = await sendOtp(mobileValue, "login", { reactivate: true });
    setIsSendingOtp(false);

    if (!handleLoginOtpResult(result)) {
      return;
    }

    toast.success("Account reactivated. OTP sent");
    startCountdown();
    setStep(2);
  };

  const handleKeepDeactivated = () => {
    setDeactivatedAccount(null);
    setStep(1);
    toast.message("Account remains deactivated");
  };

  const onSubmit = async (data) => {
    if (isVerifyingOtp) return;

    const otp = (otpValue || data.otp || otpArray.join("")).trim();
    const mobile = (mobileValue || data.mobile || "").trim();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Enter a valid mobile number");
      return;
    }

    if (!authDeviceTokenRef.current) {
      authDeviceTokenRef.current = createFreshDeviceToken();
    }

    setIsVerifyingOtp(true);

    try {
      const result = await verifyOtp(
        mobile,
        otp,
        authDeviceTokenRef.current,
        "login",
      );

      if (result.error) {
        if (result.redirectToRegister) {
          toast.error(result.error);
          onSwitchToRegister?.();
          return;
        }
        toast.error(result.error);
        return;
      }

      toast.success("Welcome back!");
      notifyAuthChanged();
      onClose?.();
      window.location.assign(result.redirectUrl || "/dashboard");
    } catch (error) {
      toast.error(error.message || "Unable to complete login right now");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const titleId = "login-modal-title";

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 font-poppins sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        ref={modalPanelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...modalPanelMotion(reducedMotion)}
        className="relative flex max-h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden rounded-t-[24px] bg-white sm:max-h-[min(92dvh,720px)] sm:rounded-3xl"
        style={{ boxShadow: "0 0 8px 2px rgba(245, 158, 11, 0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 bg-[#0f4f4f] px-5 py-5 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#0A4A4A] before:via-[#F59E0B] before:to-[#0A4A4A] sm:px-6 sm:py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F59E0B]">
                Welcome back
              </p>
              <h2
                id={titleId}
                className="mt-0.5 font-cormorant text-[22px] font-semibold leading-tight tracking-wide sm:text-[26px]"
              >
                {step === 1
                  ? "Log in"
                  : step === 3
                    ? "Reactivate account"
                    : "Verify your number"}
              </h2>
              <p className="mt-1 text-[11px] leading-snug text-white/75 sm:text-xs">
                {step === 1
                  ? "Enter your mobile number to continue"
                  : step === 3
                    ? `Account found for +91 ${mobileValue}`
                    : `OTP sent to +91 ${mobileValue} on WhatsApp`}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white/20 p-1 text-white/80 transition hover:text-white"
                aria-label="Close login"
              >
                <X size={22} />
              </button>
              <div className="rounded-lg bg-white p-1 shadow-sm">
                <BrandMark
                  logoSize={44}
                  showName
                  layout="stack"
                  className="items-center"
                  logoClassName="h-10 w-10 object-contain"
                  nameClassName="font-cormorant text-[11px] font-bold leading-none text-[#0A4A4A]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" {...stepSlideMotion(reducedMotion, "left")}>
                  <FieldLabel htmlFor="login-mobile" required>
                    Mobile number
                  </FieldLabel>
                  <div className="flex overflow-hidden rounded-xl border border-[#E6E6E6] bg-[#F8F6F1] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/20">
                    <span className="flex items-center border-r border-[#E6E6E6] bg-[#F8F6F1] px-2.5 text-[12px] font-bold text-[#374151]">
                      +91
                    </span>
                    <input
                      id="login-mobile"
                      type="text"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      className="min-h-[42px] w-full flex-1 bg-[#F7F4ED] px-2 py-2 text-[13px] text-[#374151] outline-none placeholder:text-[#6B7280]"
                      placeholder="9876543210"
                      value={mobileValue}
                      onChange={handleMobileChange}
                    />
                  </div>
                  <FieldError message={errors.mobile?.message} />

                  <p className="mt-3 text-[11px] text-[#6B7280]">
                    We&apos;ll send a one-time code — no password needed.
                  </p>

                  <div className="mt-4">
                    <PrimaryButton
                      onClick={handleNextStep}
                      disabled={mobileValue.length !== 10 || isSendingOtp}
                    >
                      {isSendingOtp ? (
                        "Sending OTP…"
                      ) : (
                        <>
                          Continue <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </PrimaryButton>
                  </div>

                  <p className="mt-4 text-center text-[11px] text-[#6B7280]">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToRegister}
                      className="font-bold text-[#0A4A4A] transition hover:text-[#F59E0B]"
                    >
                      Register now →
                    </button>
                  </p>

                  <div className="mt-5">
                    <ComplianceFooter />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" {...stepSlideMotion(reducedMotion, "right")}>
                  <button
                    type="button"
                    onClick={() => {
                      resetCountdown();
                      setStep(1);
                    }}
                    disabled={isVerifyingOtp}
                    className="mb-4 flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] transition hover:text-[#F59E0B] disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" /> Change number
                  </button>

                  <div className="mb-2 flex flex-col items-center gap-1">
                    {otpSecondsLeft > 0 ? (
                      <span className="tabular-nums text-[10px] font-medium text-[#F59E0B] sm:text-[11px]">
                        Resend in {formatOtpResendTimer(otpSecondsLeft)}
                      </span>
                    ) : null}
                  </div>

                  <OtpInputs
                    digits={otpArray}
                    inputRefs={otpRefs}
                    idPrefix="login-otp"
                    hint="Enter the 6-digit code from WhatsApp"
                    onChange={handleOtpChange}
                    onKeyDown={handleOtpKeyDown}
                    onPaste={handlePaste}
                  />
                  <FieldError message={errors.otp?.message} />

                  <div className="mt-4 space-y-3">
                    <PrimaryButton
                      type="submit"
                      disabled={otpValue.length !== 6 || isVerifyingOtp}
                    >
                      {isVerifyingOtp ? (
                        "Verifying…"
                      ) : (
                        <>
                          Verify &amp; continue <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </PrimaryButton>

                    <button
                      type="button"
                      onClick={async () => {
                        if (isResendingOtp || isVerifyingOtp || !canResend) {
                          return;
                        }

                        const isMobileValid = await trigger("mobile");
                        if (!isMobileValid) {
                          toast.error("Enter valid phone number");
                          return;
                        }

                        setIsResendingOtp(true);
                        const result = await sendOtp(mobileValue, "login");
                        setIsResendingOtp(false);

                        if (!handleLoginOtpResult(result)) {
                          return;
                        }

                        toast.success("OTP resent successfully");
                        startCountdown();
                        setOtpArray(["", "", "", "", "", ""]);
                        setValue("otp", "", { shouldValidate: false });
                        otpRefs.current[0]?.focus();
                      }}
                      disabled={isResendingOtp || isVerifyingOtp || !canResend}
                      className="w-full text-center text-[11px] font-semibold text-[#6B7280] underline-offset-2 transition hover:text-[#F59E0B] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isResendingOtp
                        ? "Resending…"
                        : canResend
                          ? "Resend OTP"
                          : `Resend in ${formatOtpResendTimer(otpSecondsLeft)}`}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" {...stepSlideMotion(reducedMotion, "right")}>
                  <button
                    type="button"
                    onClick={() => {
                      setDeactivatedAccount(null);
                      setStep(1);
                    }}
                    disabled={isSendingOtp}
                    className="mb-4 flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] transition hover:text-[#F59E0B] disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" /> Go back
                  </button>

                  <div className="mb-5 rounded-xl border border-[#E6E6E6] bg-[#F8F6F1] p-4">
                    <p className="text-[14px] font-semibold text-[#0f4f4f]">
                      Reactivate account?
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-[#6B7280]">
                      This mobile number belongs to a deactivated account. You
                      can reactivate it now and continue with OTP login.
                    </p>
                    {deactivatedAccount?.deactivatedUntil ? (
                      <p className="mt-3 text-[11px] text-[#6B7280]">
                        Reactivation available until{" "}
                        {new Date(
                          deactivatedAccount.deactivatedUntil,
                        ).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        .
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    <PrimaryButton
                      onClick={handleReactivateAccount}
                      disabled={isSendingOtp}
                    >
                      {isSendingOtp ? (
                        "Reactivating…"
                      ) : (
                        <>
                          Reactivate &amp; send OTP{" "}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </PrimaryButton>

                    <button
                      type="button"
                      onClick={handleKeepDeactivated}
                      disabled={isSendingOtp}
                      className="w-full rounded-xl border border-[#D1D5DB] py-3 text-[12px] font-semibold text-[#374151] transition hover:border-[#0f4f4f] hover:text-[#0f4f4f] disabled:opacity-50"
                    >
                      No, keep deactivated
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;

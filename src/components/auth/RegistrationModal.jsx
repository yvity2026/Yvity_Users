"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Camera,
  Phone,
  Mail,
  MapPin,
  User,
  X,
} from "lucide-react";
import {
  ComplianceFooter,
  FieldError,
  FieldHint,
  FieldLabel,
  IconInput,
  OtpInputs,
  PrimaryButton,
  RegistrationHeader,
  RegistrationProgress,
  StepHero,
  StepWhy,
  TextInput,
  ExistingAccountNotice,
} from "@/components/auth/registration/registrationUi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { registerUser } from "@/lib/api/auth/register";
import { checkRegistrationAvailability } from "@/lib/api/auth/checkRegistrationAvailability";
import { sendOtp } from "@/lib/api/auth/sendOtp";
import { verifyOtp } from "@/lib/api/auth/verifyOtp";
import { sendEmailOtp } from "@/lib/api/auth/sendEmailOtp";
import { verifyEmailOtp } from "@/lib/api/auth/verifyEmailOtp";
import { createFreshDeviceToken } from "@/lib/deviceToken";
import { notifyAuthChanged } from "@/lib/auth-store";
import { clearStoredReferralCode, readStoredReferralCode } from "@/lib/referral/attribution";
import { useRegistrationIdentityVerification } from "@/hooks/useRegistrationIdentityVerification";
import RegistrationIdentityVerification from "@/components/auth/registration/RegistrationIdentityVerification";
import {
  formatOtpResendTimer,
  useOtpResendCountdown,
} from "@/hooks/use-otp-resend-countdown";

// Zod Validation Schema
const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit phone number starting with 6-9",
    ),
  phoneOtp: z
    .string()
    .length(6, "6-digit OTP required")
    .optional()
    .or(z.literal("")),
  dob: z.string().min(1, "Date of birth is required").refine((val) => {
    const dob = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  }, "You must be at least 18 years old"),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Enter a valid email address"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  profession: z.string().min(1, "Profession or designation is required"),
  emailOtp: z
    .string()
    .length(6, "6-digit OTP required")
    .optional()
    .or(z.literal("")),
});

const isValidIndianPhone = (value) => /^[6-9]\d{9}$/.test(String(value || ""));
const isValidEmailAddress = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value || "")
      .trim()
      .toLowerCase(),
  );

const EXISTING_PHONE_NOTICE =
  "This mobile number is already registered with YVITY. Please log in to access your account.";
const EXISTING_EMAIL_NOTICE =
  "This email is already linked to an account. Log in or use a different email address.";

// Opt-in bypass only for local debugging (NEXT_PUBLIC_REGISTRATION_BYPASS_SELFIE=true)
const BYPASS_SELFIE_VERIFICATION =
  process.env.NEXT_PUBLIC_REGISTRATION_BYPASS_SELFIE === "true";

const REG_STEP_META = {
  1: {
    title: "Verify mobile",
    subtitle: "Enter your details — we'll send an OTP on WhatsApp",
  },
  2: {
    title: "About you & email",
    subtitle: "Confirm your email with a one-time code",
  },
  3: {
    title: "Your profile",
    subtitle: "City, state, and profession",
  },
  4: {
    title: "Identity check",
    subtitle: "Quick selfie verification",
  },
};

const RegistrationModal = ({ isOpen, onClose, onSwitchToLogin, referralCode = null }) => {
  const [step, setStep] = useState(1);
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isResendingPhoneOtp, setIsResendingPhoneOtp] = useState(false);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isResendingEmailOtp, setIsResendingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  // Local array states purely for UI interaction (focus, paste, backspace)
  const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);
  const phoneOtpRefs = useRef([]);
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Email OTP
  const otpRefs = useRef([]);
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [doesPhoneExist, setDoesPhoneExist] = useState(false);
  const [doesEmailExist, setDoesEmailExist] = useState(false);
  const [existingPhoneMessage, setExistingPhoneMessage] = useState("");
  const [existingEmailMessage, setExistingEmailMessage] = useState("");
  const contentRef = useRef(null);
  const lastPhoneExistToastRef = useRef("");
  const lastEmailExistToastRef = useRef("");

  const [isSubmittingRegistration, setIsSubmittingRegistration] =
    useState(false);
  const {
    otpSecondsLeft: phoneOtpSecondsLeft,
    canResend: canResendPhoneOtp,
    startCountdown: startPhoneOtpCountdown,
    resetCountdown: resetPhoneOtpCountdown,
  } = useOtpResendCountdown();
  const {
    otpSecondsLeft: emailOtpSecondsLeft,
    canResend: canResendEmailOtp,
    startCountdown: startEmailOtpCountdown,
    resetCountdown: resetEmailOtpCountdown,
  } = useOtpResendCountdown();

  const authDeviceTokenRef = useRef("");
  const completeRegistrationRef = useRef(null);
  const modalPanelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // React Hook Form setup
  const {
    register,
    getValues,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      phoneOtp: "",
      dob: "",
      gender: "",
      email: "",
      state: "",
      city: "",
      profession: "",
      emailOtp: "",
    },
    mode: "onChange",
  });

  /* eslint-disable react-hooks/incompatible-library -- RHF `watch()` is intentionally non-memoizable */
  const phoneValue = watch("phone") || "";
  const emailValue = watch("email") || "";
  /* eslint-enable react-hooks/incompatible-library */

  const identity = useRegistrationIdentityVerification({
    isOpen,
    step,
    phoneValue,
    onSelfieUploaded: (url) => completeRegistrationRef.current?.(url),
  });

  const { selfieState, setSelfieState, selfieUrl, resetIdentity } = identity;

  const resetEmailVerificationState = () => {
    setOtp(["", "", "", "", "", ""]);
    setValue("emailOtp", "", { shouldValidate: false });
    setIsEmailOtpSent(false);
    setIsEmailVerified(false);
    resetEmailOtpCountdown();
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSendingPhoneOtp(false);
      setIsResendingPhoneOtp(false);
      setIsVerifyingPhoneOtp(false);
      setIsResendingEmailOtp(false);
      reset(); // Reset form state
      setPhoneOtp(["", "", "", "", "", ""]);
      setIsPhoneOtpSent(false);
      setIsPhoneVerified(false);
      setOtp(["", "", "", "", "", ""]);
      setIsSendingEmailOtp(false);
      setIsVerifyingEmailOtp(false);
      setIsEmailOtpSent(false);
      setIsEmailVerified(false);
      setDoesPhoneExist(false);
      setDoesEmailExist(false);
      setExistingPhoneMessage("");
      setExistingEmailMessage("");
      resetPhoneOtpCountdown();
      resetEmailOtpCountdown();
      lastPhoneExistToastRef.current = "";
      lastEmailExistToastRef.current = "";
      setIsSubmittingRegistration(false);
      authDeviceTokenRef.current = "";
      resetIdentity();
    }
  }, [isOpen, reset, resetIdentity]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [step, selfieState]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current =
      typeof document !== "undefined"
        ? document.activeElement
        : null;

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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "auto";
      return undefined;
    }
    // Lock background scroll while the modal is visible.
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isValidIndianPhone(phoneValue)) {
      if (!isValidIndianPhone(phoneValue)) {
        setDoesPhoneExist(false);
        setExistingPhoneMessage("");
      }
      return undefined;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      const result = await checkRegistrationAvailability({ phone: phoneValue });
      if (cancelled || result.error) return;

      const phoneExists = Boolean(result.phoneExists);
      setDoesPhoneExist(phoneExists);
      setExistingPhoneMessage(
        phoneExists ? result.phoneMessage || EXISTING_PHONE_NOTICE : "",
      );
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, phoneValue]);

  if (!isOpen) return null;

  async function completeRegistration(url) {
    setSelfieState("submitting");
    setIsSubmittingRegistration(true);

    try {
      if (!authDeviceTokenRef.current) {
        authDeviceTokenRef.current = createFreshDeviceToken();
      }

      const result = await registerUser({
        ...getValues(),
        selfieUrl: url,
        deviceToken: authDeviceTokenRef.current,
        referralCode: readStoredReferralCode(),
      });

      if (result.error) {
        if (result.redirectToLogin || result.phoneExists) {
          markExistingPhone(result.error);
          setStep(1);
        } else if (result.emailExists) {
          markExistingEmail(result.error);
        }
        toast.error(result.error);
        setSelfieState("instructions");
        return;
      }

      if (typeof window !== "undefined" && result.userId) {
        clearStoredReferralCode();
        toast.success("Account created — opening your workspace…");
        notifyAuthChanged();
        onClose?.();
        window.location.assign(result.redirectUrl || "/dashboard");
      }
    } finally {
      setIsSubmittingRegistration(false);
    }
  }

  completeRegistrationRef.current = completeRegistration;

  // Custom handlers to sync local UI logic with React Hook Form
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").replace(/^[0-5]+/, "");

    if (val.length <= 10) {
      if (val !== phoneValue) {
        setPhoneOtp(["", "", "", "", "", ""]);
        setIsPhoneOtpSent(false);
        setIsPhoneVerified(false);
        resetPhoneOtpCountdown();
        setDoesPhoneExist(false);
        setExistingPhoneMessage("");
        setValue("phoneOtp", "", { shouldValidate: false });
        if (
          lastPhoneExistToastRef.current &&
          lastPhoneExistToastRef.current !== val
        ) {
          lastPhoneExistToastRef.current = "";
        }
      }

      setValue("phone", val, { shouldValidate: true });
    }
  };

  const switchToLoginWithPhone = () => {
    if (phoneValue && isValidIndianPhone(phoneValue)) {
      sessionStorage.setItem("yvity_login_phone", phoneValue);
    }
    onSwitchToLogin?.();
  };

  const markExistingPhone = (message = EXISTING_PHONE_NOTICE) => {
    setDoesPhoneExist(true);
    setExistingPhoneMessage(message);
  };

  const markExistingEmail = (message = EXISTING_EMAIL_NOTICE) => {
    setDoesEmailExist(true);
    setExistingEmailMessage(message);
  };

  const checkPhoneExists = async (value = phoneValue, showToast = true) => {
    if (!isValidIndianPhone(value)) {
      setDoesPhoneExist(false);
      setExistingPhoneMessage("");
      return { phoneExists: false };
    }

    const result = await checkRegistrationAvailability({ phone: value });
    if (result.error) {
      return result;
    }

    const phoneExists = Boolean(result.phoneExists);
    setDoesPhoneExist(phoneExists);
    setExistingPhoneMessage(
      phoneExists ? result.phoneMessage || EXISTING_PHONE_NOTICE : "",
    );

    if (phoneExists && showToast && lastPhoneExistToastRef.current !== value) {
      toast.error(result.phoneMessage || EXISTING_PHONE_NOTICE);
      lastPhoneExistToastRef.current = value;
    }

    if (!phoneExists && lastPhoneExistToastRef.current === value) {
      lastPhoneExistToastRef.current = "";
    }

    return { phoneExists, redirectToLogin: result.redirectToLogin };
  };

  const checkEmailExists = async (value = emailValue, showToast = true) => {
    const normalizedEmail = String(value || "")
      .trim()
      .toLowerCase();

    if (!isValidEmailAddress(normalizedEmail)) {
      setDoesEmailExist(false);
      setExistingEmailMessage("");
      return { emailExists: false };
    }

    const result = await checkRegistrationAvailability({
      email: normalizedEmail,
    });
    if (result.error) {
      return result;
    }

    const emailExists = Boolean(result.emailExists);
    setDoesEmailExist(emailExists);
    setExistingEmailMessage(
      emailExists ? result.emailMessage || EXISTING_EMAIL_NOTICE : "",
    );

    if (
      emailExists &&
      showToast &&
      lastEmailExistToastRef.current !== normalizedEmail
    ) {
      toast.error(result.emailMessage || EXISTING_EMAIL_NOTICE);
      lastEmailExistToastRef.current = normalizedEmail;
    }

    if (!emailExists && lastEmailExistToastRef.current === normalizedEmail) {
      lastEmailExistToastRef.current = "";
    }

    return { emailExists };
  };

  const handlePhoneOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newPhoneOtp = [...phoneOtp];
    newPhoneOtp[index] = value;
    setPhoneOtp(newPhoneOtp);
    setValue("phoneOtp", newPhoneOtp.join(""), { shouldValidate: true });

    if (value && index < phoneOtp.length - 1) {
      phoneOtpRefs.current[index + 1]?.focus();
    }
  };

  const handlePhoneOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !phoneOtp[index] && index > 0) {
      phoneOtpRefs.current[index - 1]?.focus();
    }
  };

  const handlePhonePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;
    e.preventDefault();

    const newOtp = pasteData.split("");
    setPhoneOtp(newOtp);
    setValue("phoneOtp", pasteData, { shouldValidate: true });

    setTimeout(() => {
      phoneOtpRefs.current[5]?.focus();
    }, 0);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setValue("emailOtp", newOtp.join(""), { shouldValidate: true });

    // Auto focus next
    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleEmailPaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;
    e.preventDefault();

    const newOtp = pasteData.split("");
    setOtp(newOtp);
    setValue("emailOtp", pasteData, { shouldValidate: true });

    // Focus last input
    setTimeout(() => {
      otpRefs.current[5]?.focus();
    }, 0);
  };

  const onSubmit = async () => {
    if (!BYPASS_SELFIE_VERIFICATION && !selfieUrl) {
      toast.error("Complete identity verification first");
      return;
    }
    await completeRegistration(selfieUrl || "");
  };

  const activeProgress =
    selfieState === "uploading" ||
    selfieState === "submitting" ||
    isSubmittingRegistration
      ? 5
      : step;

  const headerMeta =
    activeProgress >= 5
      ? {
          title: "Almost done",
          subtitle:
            selfieState === "submitting" || isSubmittingRegistration
              ? "Creating your secure workspace — you will never repeat this setup."
              : "Saving your verification — one last moment.",
        }
      : REG_STEP_META[step] || REG_STEP_META[1];

  const maxDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

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
        aria-labelledby="registration-modal-title"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        className="relative flex max-h-[100dvh] w-full max-w-[420px] flex-col overflow-hidden rounded-t-[24px] bg-white sm:max-h-[min(92dvh,720px)] sm:rounded-3xl"
        style={{ boxShadow: "0 0 8px 2px rgba(245, 158, 11, 0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-3 top-3 z-20 rounded-full bg-white/20 p-1 text-white/80 transition hover:text-white"
          aria-label="Close registration"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <RegistrationHeader
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
        />
        <h2 id="registration-modal-title" className="sr-only">
          YVITY registration — {headerMeta.title}
        </h2>

        {referralCode ? (
          <div className="mx-4 mb-1 rounded-xl border border-[#F59E0B]/25 bg-[#FFF9F0] px-3 py-2 text-center text-[11px] font-medium text-[#92400E]">
            Referred by ambassador · code <span className="font-bold">{referralCode}</span>
          </div>
        ) : null}

        <div
          ref={contentRef}
          className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4"
        >
          <RegistrationProgress
            activeIndex={activeProgress}
            completedThrough={activeProgress - 1}
          />

          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                >
                  <StepHero
                    icon={Phone}
                    subtitle="We'll send a one-time password to confirm your number on WhatsApp."
                  />
                  <div className="space-y-3">
                    <div>
                      <FieldLabel htmlFor="reg-full-name" required>
                        Full name
                      </FieldLabel>
                      <IconInput
                        id="reg-full-name"
                        icon={User}
                        {...register("fullName")}
                        placeholder="Enter name as per your licence certificate"
                        autoComplete="name"
                        error={errors.fullName}
                      />
                      <p className="mt-1 font-poppins text-[11px] text-[#6B7280]">
                        Use the exact name printed on your IRDAI licence certificate.
                      </p>
                      <FieldError message={errors.fullName?.message} />
                    </div>

                    <div>
                      <FieldLabel htmlFor="reg-phone" required>
                        Mobile number
                      </FieldLabel>
                      <div
                        className={`flex overflow-hidden rounded-xl border bg-[#F8F6F1] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/20 ${
                          errors.phone ? "border-red-300" : "border-[#E6E6E6]"
                        }`}
                      >
                        <span className="flex items-center border-r border-[#E6E6E6] bg-[#F8F6F1] px-2.5 text-[12px] font-bold text-[#374151]">
                          +91
                        </span>
                        <input
                          id="reg-phone"
                          type="text"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          value={phoneValue}
                          onChange={handlePhoneChange}
                          onBlur={() => {
                            void checkPhoneExists(phoneValue);
                          }}
                          placeholder="9876543210"
                          className="min-h-[42px] w-full flex-1 bg-[#F7F4ED] px-2 py-2 text-[13px] text-[#374151] outline-none placeholder:text-[#6B7280]"
                        />
                      </div>
                      <FieldError message={errors.phone?.message} />
                      <ExistingAccountNotice
                        message={doesPhoneExist ? existingPhoneMessage : ""}
                        onLogin={switchToLoginWithPhone}
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={async (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (isSendingPhoneOtp) return;

                            const isPhoneValid = await trigger("phone");
                            if (!isPhoneValid) {
                              toast.error("Enter valid phone number");
                              return;
                            }

                            const availability =
                              await checkPhoneExists(phoneValue);
                            if (availability.error) {
                              toast.error(availability.error);
                              return;
                            }
                            if (availability.phoneExists || doesPhoneExist) {
                              return;
                            }

                            setIsSendingPhoneOtp(true);
                            const result = await sendOtp(
                              phoneValue,
                              "register",
                            );
                            setIsSendingPhoneOtp(false);

                            if (result.error) {
                              if (result.redirectToLogin || result.phoneExists) {
                                markExistingPhone(result.error);
                              }
                              toast.error(result.error);
                              return;
                            }

                            toast.success("OTP sent successfully");
                            setIsPhoneOtpSent(true);
                            setIsPhoneVerified(false);
                            startPhoneOtpCountdown();
                          }}
                          disabled={isSendingPhoneOtp}
                          className="text-[11px] font-semibold text-[#F59E0B] underline-offset-2 transition hover:text-[#D97706] hover:underline disabled:opacity-50"
                        >
                          {isSendingPhoneOtp ? "Sending…" : "Send OTP"}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isPhoneOtpSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden border-t border-stone-100 pt-3"
                        >
                          <OtpInputs
                            digits={phoneOtp}
                            inputRefs={phoneOtpRefs}
                            idPrefix="phone-otp"
                            hint="Enter the 6-digit code from WhatsApp"
                            onChange={handlePhoneOtpChange}
                            onKeyDown={handlePhoneOtpKeyDown}
                            onPaste={handlePhonePaste}
                          />
                          <FieldError message={errors.phoneOtp?.message} />
                          <div className="mt-2 flex flex-col items-center gap-1 sm:mt-3">
                            {phoneOtpSecondsLeft > 0 ? (
                              <span className="tabular-nums text-[10px] font-medium text-[#F59E0B] sm:text-[11px]">
                                Resend in {formatOtpResendTimer(phoneOtpSecondsLeft)}
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={async () => {
                                if (isResendingPhoneOtp || !canResendPhoneOtp) {
                                  return;
                                }

                                const isPhoneValid = await trigger("phone");
                                if (!isPhoneValid) {
                                  toast.error("Enter valid phone number");
                                  return;
                                }

                                const availability =
                                  await checkPhoneExists(phoneValue);
                                if (availability.error) {
                                  toast.error(availability.error);
                                  return;
                                }
                                if (
                                  availability.phoneExists ||
                                  doesPhoneExist
                                ) {
                                  return;
                                }

                                setIsResendingPhoneOtp(true);
                                const result = await sendOtp(
                                  phoneValue,
                                  "register",
                                );
                                setIsResendingPhoneOtp(false);

                                if (result.error) {
                                  if (
                                    result.redirectToLogin ||
                                    result.phoneExists
                                  ) {
                                    markExistingPhone(result.error);
                                  }
                                  toast.error(result.error);
                                  return;
                                }

                                setIsPhoneVerified(false);
                                setPhoneOtp(["", "", "", "", "", ""]);
                                setValue("phoneOtp", "", {
                                  shouldValidate: false,
                                });
                                phoneOtpRefs.current[0]?.focus();
                                startPhoneOtpCountdown();
                                toast.success("OTP resent successfully");
                              }}
                              disabled={isResendingPhoneOtp || !canResendPhoneOtp}
                              className="text-[11px] font-semibold text-[#6B7280] underline-offset-2 transition hover:text-[#F59E0B] hover:underline disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                              >
                              {isResendingPhoneOtp
                                ? "Resending…"
                                : canResendPhoneOtp
                                  ? "Resend OTP"
                                  : `Resend in ${formatOtpResendTimer(phoneOtpSecondsLeft)}`}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4">
                    <PrimaryButton
                      onClick={async (event) => {
                        event?.preventDefault?.();
                        if (isVerifyingPhoneOtp) return;

                        if (isPhoneVerified) {
                          setStep(2);
                          return;
                        }

                        const isValid = await trigger(["fullName", "phone"]);
                        if (!isValid || phoneOtp.join("").length !== 6) {
                          toast.error(
                            "Enter your name, valid phone, and the 6-digit OTP",
                          );
                          return;
                        }

                        if (!authDeviceTokenRef.current) {
                          authDeviceTokenRef.current = createFreshDeviceToken();
                        }

                        setIsVerifyingPhoneOtp(true);
                        const result = await verifyOtp(
                          phoneValue,
                          phoneOtp.join(""),
                          authDeviceTokenRef.current,
                          "register",
                        );
                        setIsVerifyingPhoneOtp(false);

                        if (result.error) {
                          if (result.redirectToLogin || result.phoneExists) {
                            markExistingPhone(result.error);
                          }
                          toast.error(result.error);
                          return;
                        }

                        if (result.isNewUser === false) {
                          markExistingPhone();
                          toast.error(EXISTING_PHONE_NOTICE);
                          return;
                        }

                        setIsPhoneVerified(true);
                        toast.success("Mobile verified");
                        setStep(2);
                      }}
                      disabled={
                        isPhoneVerified
                          ? isVerifyingPhoneOtp
                          : !isPhoneOtpSent ||
                            phoneOtp.join("").length !== 6 ||
                            isVerifyingPhoneOtp
                      }
                    >
                      {isVerifyingPhoneOtp ? (
                        "Verifying…"
                      ) : isPhoneVerified ? (
                        <>
                          <ArrowRight className="h-4 w-4" /> Continue
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4" /> Verify &amp; continue
                        </>
                      )}
                    </PrimaryButton>
                  </div>

                  <p className="mt-4 text-center text-[11px] text-[#6B7280]">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="font-bold text-[#0A4A4A] transition hover:text-[#F59E0B]"
                    >
                      Login →
                    </button>
                  </p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                >
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mb-3 flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] transition hover:text-[#F59E0B]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <StepHero
                    icon={Mail}
                    subtitle="Confirm your email with a one-time code. IRDAI license comes after signup."
                  />
                  <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-stone-800 sm:mb-2 sm:text-sm">
                            Date of birth{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            max={maxDate}
                            {...register("dob")}
                            className={`w-full cursor-pointer rounded-xl border bg-[#F8F6F1] px-2 py-2 text-xs text-[#374151] transition focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 sm:px-4 sm:py-3 sm:text-sm [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer ${errors.dob ? "border-red-400" : "border-[#E6E6E6]"}`}
                          />
                          {errors.dob && (
                            <p className="mt-1 text-[11px] text-red-600 sm:mt-1.5 sm:text-sm">
                              {errors.dob.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-stone-800 sm:mb-2 sm:text-sm">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              {...register("gender")}
                              className={`w-full cursor-pointer appearance-none rounded-xl border bg-[#F8F6F1] px-2 py-2 pr-8 text-xs text-[#374151] transition focus:border-[#F59E0B] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 sm:px-4 sm:py-3 sm:pr-10 sm:text-sm ${errors.gender ? "border-red-400" : "border-[#E6E6E6]"}`}
                            >
                              <option value="" disabled hidden>
                                Select
                              </option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500 sm:right-3 sm:h-5 sm:w-5"
                              strokeWidth={1.5}
                            />
                          </div>
                          {errors.gender && (
                            <p className="mt-1 text-[11px] text-red-600 sm:mt-1.5 sm:text-sm">
                              {errors.gender.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                      <FieldLabel required>Email address</FieldLabel>
                      <IconInput
                        type="email"
                        icon={Mail}
                        {...register("email", {
                          onChange: () => {
                            resetEmailVerificationState();
                            setDoesEmailExist(false);
                            setExistingEmailMessage("");
                            lastEmailExistToastRef.current = "";
                          },
                          onBlur: (event) => {
                            void checkEmailExists(event.target.value);
                          },
                        })}
                        placeholder="you@example.com"
                        autoComplete="email"
                        error={errors.email}
                      />
                      <FieldError message={errors.email?.message} />
                      <ExistingAccountNotice
                        message={doesEmailExist ? existingEmailMessage : ""}
                        actionLabel="Log in to your account"
                        onLogin={switchToLoginWithPhone}
                      />
                      {!isEmailVerified && (
                        <div className="mt-2 flex justify-end sm:mt-3">
                          <button
                            type="button"
                            onClick={async () => {
                              if (isSendingEmailOtp) return;

                              const isEmailValid = await trigger("email");
                              if (!isEmailValid) {
                                toast.error("Enter a valid email address");
                                return;
                              }

                              const availability =
                                await checkEmailExists(emailValue);
                              if (availability.error) {
                                toast.error(availability.error);
                                return;
                              }
                              if (availability.emailExists || doesEmailExist) {
                                return;
                              }

                              setIsSendingEmailOtp(true);
                              const result = await sendEmailOtp(
                                emailValue,
                                "register",
                              );
                              setIsSendingEmailOtp(false);

                              if (result.error) {
                                if (result.emailExists) {
                                  markExistingEmail(result.error);
                                }
                                toast.error(result.error);
                                return;
                              }

                              setIsEmailOtpSent(true);
                              setIsEmailVerified(false);
                              setOtp(["", "", "", "", "", ""]);
                              setValue("emailOtp", "", {
                                shouldValidate: false,
                              });
                              toast.success("Verification code sent to email");
                            }}
                            disabled={isSendingEmailOtp}
                            className="rounded-full border border-[#F59E0B]/40 bg-[#FFFBEB] px-3 py-1.5 text-[11px] font-semibold text-[#0A4A4A] transition hover:bg-[#FEF3C7] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                          >
                            {isSendingEmailOtp ? "Sending…" : "Send OTP"}
                          </button>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {isEmailOtpSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden border-t border-stone-100 pt-3 sm:mt-5 sm:pt-5"
                        >
                          {!isEmailVerified && (
                            <>
                              <div className="mb-2 flex flex-col items-center gap-1 sm:mb-4">
                                <p
                                  id="email-otp-hint"
                                  className="text-center text-[11px] font-semibold text-[#0f4f4f] sm:text-sm"
                                >
                                  Enter the 6-digit code sent to your email
                                </p>
                                {emailOtpSecondsLeft > 0 ? (
                                  <span className="tabular-nums text-[10px] font-medium text-[#F59E0B] sm:text-[11px]">
                                    Resend in{" "}
                                    {formatOtpResendTimer(emailOtpSecondsLeft)}
                                  </span>
                                ) : null}
                              </div>
                              <div
                                className="flex justify-center gap-1 sm:gap-2.5"
                                role="group"
                                aria-labelledby="email-otp-hint"
                              >
                                {otp.map((digit, idx) => (
                                  <input
                                    key={`email-otp-${idx}`}
                                    ref={(element) => {
                                      otpRefs.current[idx] = element;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoComplete="one-time-code"
                                    maxLength={1}
                                    aria-label={`Email code digit ${idx + 1} of 6`}
                                    className="h-9 w-8 rounded-lg border-2 border-stone-200 bg-white text-center text-sm font-bold text-stone-800 shadow-sm outline-none transition focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/25 sm:h-14 sm:w-11 sm:rounded-xl sm:text-xl sm:focus:ring-2"
                                    value={digit}
                                    onChange={(e) =>
                                      handleOtpChange(idx, e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                      handleOtpKeyDown(idx, e)
                                    }
                                    onPaste={handleEmailPaste}
                                    style={{
                                      borderColor: digit
                                        ? "#F59E0B"
                                        : undefined,
                                      background: digit ? "#FFFBF5" : undefined,
                                    }}
                                  />
                                ))}
                              </div>
                              {errors.emailOtp && (
                                <p className="mt-1.5 text-center text-[11px] text-red-600 sm:mt-2 sm:text-sm">
                                  {errors.emailOtp.message}
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={async () => {
                                  const isValid = await trigger("emailOtp");
                                  if (!isValid || otp.join("").length !== 6) {
                                    toast.error(
                                      "Enter the 6-digit code from your email",
                                    );
                                    return;
                                  }

                                  setIsVerifyingEmailOtp(true);
                                  const result = await verifyEmailOtp(
                                    emailValue,
                                    otp.join(""),
                                  );
                                  setIsVerifyingEmailOtp(false);

                                  if (result.error) {
                                    toast.error(result.error);
                                    return;
                                  }

                                  setIsEmailVerified(true);
                                  toast.success("Email verified");
                                }}
                                disabled={
                                  isVerifyingEmailOtp ||
                                  otp.join("").length !== 6
                                }
                                className="mt-3 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#0A4A4A] px-3 py-2.5 text-[11px] font-semibold text-[#F59E0B] shadow-md shadow-teal-900/20 ring-1 ring-[#F59E0B]/35 transition hover:bg-[#0D6060] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none disabled:ring-0 sm:mt-5 sm:min-h-[52px] sm:px-4 sm:py-3.5 sm:text-sm"
                              >
                                {isVerifyingEmailOtp
                                  ? "Verifying…"
                                  : "Verify email"}
                                {!isVerifyingEmailOtp && (
                                  <Check className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} />
                                )}
                              </button>

                              <div className="mt-2 flex justify-center sm:mt-3">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (
                                      isResendingEmailOtp ||
                                      !canResendEmailOtp
                                    ) {
                                      return;
                                    }

                                    const isEmailValid =
                                      await trigger("email");
                                    if (!isEmailValid) {
                                      toast.error(
                                        "Enter a valid email address",
                                      );
                                      return;
                                    }

                                    const availability =
                                      await checkEmailExists(emailValue);
                                    if (availability.error) {
                                      toast.error(availability.error);
                                      return;
                                    }
                                    if (
                                      availability.emailExists ||
                                      doesEmailExist
                                    ) {
                                      return;
                                    }

                                    setIsResendingEmailOtp(true);
                                    const result = await sendEmailOtp(
                                      emailValue,
                                      "register",
                                    );
                                    setIsResendingEmailOtp(false);

                                    if (result.error) {
                                      if (result.emailExists) {
                                        markExistingEmail(result.error);
                                      }
                                      toast.error(result.error);
                                      return;
                                    }

                                    setIsEmailVerified(false);
                                    setOtp(["", "", "", "", "", ""]);
                                    setValue("emailOtp", "", {
                                      shouldValidate: false,
                                    });
                                    otpRefs.current[0]?.focus();
                                    startEmailOtpCountdown();
                                    toast.success("A new code has been sent");
                                  }}
                                  disabled={
                                    isResendingEmailOtp || !canResendEmailOtp
                                  }
                                  className="text-[11px] font-semibold text-[#6B7280] underline-offset-2 transition hover:text-[#F59E0B] hover:underline disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                                  >
                                  {isResendingEmailOtp
                                    ? "Resending…"
                                    : canResendEmailOtp
                                      ? "Resend OTP"
                                      : `Resend in ${formatOtpResendTimer(emailOtpSecondsLeft)}`}
                                </button>
                              </div>
                            </>
                          )}

                          {isEmailVerified && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-2.5 sm:rounded-xl sm:p-4"
                            >
                              <div className="flex items-start gap-2 sm:gap-3">
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A4A4A] text-[#F59E0B] sm:h-9 sm:w-9">
                                  <Check className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" strokeWidth={3} />
                                </div>
                                <div>
                                  <p className="text-[11px] font-semibold text-[#0f4f4f] sm:text-sm">
                                    Email verified
                                  </p>
                                  <p className="mt-0.5 text-[10px] leading-snug text-stone-600 sm:mt-1 sm:text-sm sm:leading-relaxed">
                                    Your account is now protected by both mobile
                                    and email — a second lock only you hold.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4">
                    <PrimaryButton
                      onClick={async () => {
                        const isValid = await trigger(["dob", "gender", "email"]);
                        if (!isValid) {
                          toast.error("Please fix the highlighted fields");
                          return;
                        }
                        if (!isEmailVerified) {
                          toast.error("Verify your email with the 6-digit code");
                          return;
                        }
                        setStep(3);
                      }}
                      disabled={!isEmailVerified}
                    >
                      <ArrowRight className="h-4 w-4" /> Continue to profile
                    </PrimaryButton>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                >
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mb-3 flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] transition hover:text-[#F59E0B]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <StepHero
                    icon={MapPin}
                    subtitle="Whether you are searching for an advisor today or may list yourself later — this personalizes your experience."
                    why="Location shows verified advisors near you first. Profession tells us how you use YVITY right now — you can set up a full advisor profile (with IRDAI licence) anytime from your dashboard, no need to sign up again."
                  />
                  <div className="space-y-3">
                    <div>
                      <FieldLabel htmlFor="reg-state" required>
                        State
                      </FieldLabel>
                      <TextInput
                        id="reg-state"
                        {...register("state")}
                        placeholder="e.g. Telangana"
                        autoComplete="address-level1"
                        error={errors.state}
                      />
                      <FieldHint>
                        So we can surface trusted advisors in your region first.
                      </FieldHint>
                      <FieldError message={errors.state?.message} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="reg-city" required>
                        City
                      </FieldLabel>
                      <TextInput
                        id="reg-city"
                        {...register("city")}
                        placeholder="e.g. Hyderabad"
                        autoComplete="address-level2"
                        error={errors.city}
                      />
                      <FieldHint>
                        Helps you discover advisors closest to you.
                      </FieldHint>
                      <FieldError message={errors.city?.message} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="reg-profession" required>
                        Profession / designation
                      </FieldLabel>
                      <TextInput
                        id="reg-profession"
                        {...register("profession")}
                        placeholder="e.g. Customer, LIC Advisor, Business owner"
                        autoComplete="organization-title"
                        error={errors.profession}
                      />
                      <FieldHint>
                        How you use YVITY today — not a licence check. Advisors
                        add IRDAI details separately when they are ready.
                      </FieldHint>
                      <FieldError message={errors.profession?.message} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <PrimaryButton
                      onClick={async () => {
                        const isValid = await trigger([
                          "state",
                          "city",
                          "profession",
                        ]);
                        if (!isValid) {
                          toast.error("Please complete all fields");
                          return;
                        }
                        if (BYPASS_SELFIE_VERIFICATION) {
                          await completeRegistration("");
                          return;
                        }
                        setStep(4);
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />{" "}
                      {BYPASS_SELFIE_VERIFICATION
                        ? "Finish signup"
                        : "Continue to identity check"}
                    </PrimaryButton>
                  </div>
                </motion.div>
              )}

              {step === 4 && !BYPASS_SELFIE_VERIFICATION && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                >
                  <RegistrationIdentityVerification
                    identity={identity}
                    onBack={() => setStep(3)}
                    isSubmittingRegistration={isSubmittingRegistration}
                  />
                </motion.div>
              )}

              {step === 4 && BYPASS_SELFIE_VERIFICATION && (
                <motion.div
                  key="step4-bypass"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                >
                  <p className="mb-4 text-center text-sm text-[#6B7280]">
                    Identity check skipped (dev mode).
                  </p>
                  <PrimaryButton onClick={() => void completeRegistration("")}>
                    Finish signup
                  </PrimaryButton>
                </motion.div>
              )}

            </AnimatePresence>
          </form>
          <ComplianceFooter />
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationModal;

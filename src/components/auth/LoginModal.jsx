"use client";
import React, { useState, useRef, useEffect } from "react";
import BrandMark from "@/yvity-landing/components/brand/BrandMark";
// 1. Added X to the lucide-react import
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { sendOtp } from "@/lib/api/auth/sendOtp";
import { verifyOtp } from "@/lib/api/auth/verifyOtp";
import { createFreshDeviceToken } from "@/lib/deviceToken";
import { notifyAuthChanged } from "@/lib/auth-store";

// Zod Validation Schema
const loginSchema = z.object({
  mobile: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit phone number starting with 6-9",
    ),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .optional()
    .or(z.literal("")),
  rememberMe: z.boolean().default(true),
});

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [step, setStep] = useState(1);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [deactivatedAccount, setDeactivatedAccount] = useState(null);
  const otpRefs = useRef([]);
  const authDeviceTokenRef = useRef("");

  // Local state purely for the individual OTP boxes to keep focus/paste logic intact
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);

  // React Hook Form setup
  const {
    register,
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

  // Reset state and manage body scroll when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSendingOtp(false);
      setIsResendingOtp(false);
      setIsVerifyingOtp(false);
      setDeactivatedAccount(null);
      authDeviceTokenRef.current = "";
      reset(); // Resets React Hook Form
      setOtpArray(["", "", "", "", "", ""]);

      const prefilledPhone = sessionStorage.getItem("yvity_login_phone");
      if (prefilledPhone && /^[6-9]\d{9}$/.test(prefilledPhone)) {
        setValue("mobile", prefilledPhone, { shouldValidate: true });
        sessionStorage.removeItem("yvity_login_phone");
      }

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const handleMobileChange = (e) => {
    // 1. \D completely removes non-numbers
    // 2. ^[0-5]+ instantly removes 0-5 if they are at the start
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

    // Auto focus next
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

    // Focus last input
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

    console.info("[login] continue/send otp clicked");
    const isMobileValid = await trigger("mobile");
    if (!isMobileValid) return;

    setIsSendingOtp(true);
    const result = await sendOtp(mobileValue, "login");
    setIsSendingOtp(false);

    if (!handleLoginOtpResult(result)) {
      return;
    }

    toast.success("OTP sent");
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
    setStep(2);
  };

  const handleKeepDeactivated = () => {
    setDeactivatedAccount(null);
    setStep(1);
    toast("Account remains deactivated");
  };

  const onSubmit = async (data) => {
    console.info("[login] verify form submitted", {
      mobile: data.mobile,
      otpLength: String(data.otp || "").length,
    });

    if (!authDeviceTokenRef.current) {
      authDeviceTokenRef.current = createFreshDeviceToken();
    }

    setIsVerifyingOtp(true);

    try {
      const result = await verifyOtp(
        data.mobile,
        data.otp,
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
      console.error("[login] OTP verification failed", error);
      toast.error(error.message || "Unable to complete login right now");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-6 font-poppins md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative flex max-h-[90vh] w-full max-w-[450px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:max-h-[95vh]"
        style={{
          boxShadow: "0 0 8px 2px rgba(245, 158, 11, 0.25)",
        }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 2. Added Top Right 'X' Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 z-10 text-white/80 hover:text-white transition-colors cursor-pointer p-1 bg-white/20 rounded-full"
          aria-label="Close modal"
        >
          <X size={24} className="text-white hover:text-red-400" />
        </button>

        {/* Header */}
        <div className="bg-[#0f4f4f] px-6 py-4 md:py-8 relative w-full shrink-0 before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[6px] before:bg-gradient-to-r before:from-[#0A4A4A] before:via-[#F59E0B] before:to-[#0A4A4A]">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <h2 className="text-[clamp(24px,4vw,32px)] font-semibold font-cormorant tracking-wide mt-7 md:mt-4">
                {step === 1
                  ? "Welcome"
                  : step === 3
                    ? "Reactivate Account"
                    : "Verify Your Number"}
              </h2>
              <p className="text-[clamp(12px,1.5vw,16px)] text-[#A9A9A9] text-sm mt-1 pr-6">
                {step === 1
                  ? "Enter your mobile number to continue"
                  : step === 3
                    ? `Account found for +91 ${mobileValue}`
                    : `OTP sent to +91 ${mobileValue}`}
              </p>
            </div>
            <div className="rounded bg-white p-1 mt-4">
              <BrandMark
                logoSize={56}
                showName
                layout="stack"
                className="items-center"
                logoClassName="h-12 w-12 object-contain md:h-14 md:w-14"
                nameClassName="font-cormorant text-lg font-bold text-[#0A4A4A]"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto min-h-0 custom-scrollbar flex-1">
          {/* Form tag wrapped around the AnimatePresence */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="mb-6">
                    <label className="block text-[#374151] font-semibold mb-2 ml-1 text-xs">
                      Mobile Number
                    </label>
                    <div className="flex bg-[#F8F6F1] rounded-lg overflow-hidden border border-[#E6E6E6] focus-within:border-[#0f4f4f] transition-colors outline-none">
                      <span className="flex items-center justify-center px-4 font-bold text-[#374151] text-xs">
                        +91
                      </span>
                      <input
                        type="text"
                        className="w-full py-4 bg-[#F7F4ED] outline-none text-gray-800 tracking-wider font-medium placeholder-[#6B7280] text-xs"
                        placeholder="9876543210"
                        value={mobileValue}
                        onChange={handleMobileChange}
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-red-500 text-xs mt-1 ml-1">
                        {errors.mobile.message}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[#6B7280] mb-4 md:mb-8 ml-1">
                    We&apos;ll send an OTP - no Passwords needed
                  </p>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={mobileValue.length !== 10 || isSendingOtp}
                    className="w-full bg-[#0A4A4A] hover:bg-[#0a3a3a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 md:py-4 rounded-[8px] flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
                  >
                    {isSendingOtp ? "Sending OTP..." : "Continue"}{" "}
                    <ArrowRight size={18} />
                  </button>

                  <div
                    className="mt-6 text-center text-xs
 text-[#6B7280]"
                  >
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToRegister}
                      className="font-bold text-[#0A4A4A] hover:transform-stroke hover:text-[#0a3a3a] cursor-pointer ml-2 text-xs"
                    >
                      Register Now
                    </button>
                    {/* 3. Removed Cancel text button from here */}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isVerifyingOtp}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-xs cursor-pointer"
                  >
                    <ArrowLeft size={16} /> Change Number
                  </button>

                  <div className="text-center mb-6">
                    <p className="text-[#0f4f4f] font-semibold mb-2 md:mb-4 text-xs">
                      Enter 6-digit OTP sended to Whatsapp
                    </p>
                    <div className="flex justify-center gap-1 md:gap-3 ">
                      {otpArray.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(element) => {
                            otpRefs.current[idx] = element;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="one-time-code"
                          className="w-10 h-12 md:w-12 md:h-14 rounded-[10px] border bg-[#F8F6F1] text-center text-[clamp(16px,2.5vw,20px)] font-bold text-gray-800 outline-none focus:border-[#F49F0F] focus:ring-1 focus:ring-[#F49F0F] transition-all"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handlePaste}
                          style={{
                            borderColor: digit ? "#F49F0F" : "#B7B7B7",
                            boxShadow: digit
                              ? "0 0 4px 2px rgba(245, 158, 11, 0.25)"
                              : "none",
                            background: digit ? "#FFF" : "#F7F4ED",
                          }}
                        />
                      ))}
                    </div>
                    {errors.otp && (
                      <p className="text-red-500 text-xs mt-2">
                        {errors.otp.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <button
                      type="submit"
                      disabled={otpValue.length !== 6 || isVerifyingOtp}
                      className="w-full bg-[#0f4f4f] hover:bg-[#0a3a3a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 md:py-4 rounded-[8px] flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
                    >
                      {isVerifyingOtp ? "Verifying..." : "Verify & Continue"}{" "}
                      {!isVerifyingOtp && <ArrowRight size={18} />}
                    </button>

                    {/* <label className="flex items-center gap-3 text-[clamp(10px,1vw,14px)] text-gray-600 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("rememberMe")}
                        className="w-5 h-5 rounded border-gray-300 text-[#0f4f4f] focus:ring-[#0f4f4f]"
                      />
                      Remember this device for 30 days
                    </label> */}

                    <button
                      type="button"
                      onClick={async () => {
                        if (isResendingOtp || isVerifyingOtp) return;

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

                        toast.success("OTP resent");
                      }}
                      disabled={isResendingOtp || isVerifyingOtp}
                      className="text-gray-500 text-xs mt-0 md:mt-2 hover:text-[#0A4A4A] font-semibold cursor-pointer disabled:text-gray-400"
                    >
                      {isResendingOtp ? "Resending..." : "Resend OTP"}
                    </button>
                    {/* 4. Removed Cancel text button from here */}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    type="button"
                    onClick={handleKeepDeactivated}
                    disabled={isSendingOtp}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-[clamp(10px,1vw,14px)] cursor-pointer disabled:text-gray-400"
                  >
                    <ArrowLeft size={16} /> Change Number
                  </button>

                  <div className="mb-6 rounded-[8px] border border-[#E6E6E6] bg-[#F8F6F1] p-4">
                    <p className="text-[#0f4f4f] font-semibold text-[clamp(14px,1.5vw,18px)]">
                      Reactivate account?
                    </p>
                    <p className="mt-2 text-[#6B7280] leading-6 text-[clamp(12px,1.5vw,14px)]">
                      This mobile number belongs to a deactivated account. You
                      can reactivate it now and continue with OTP login.
                    </p>
                    {deactivatedAccount?.deactivatedUntil && (
                      <p className="mt-3 text-[#6B7280] text-[clamp(11px,1vw,13px)]">
                        Reactivation available until{" "}
                        {new Date(
                          deactivatedAccount.deactivatedUntil,
                        ).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        .
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleReactivateAccount}
                      disabled={isSendingOtp}
                      className="w-full bg-[#0f4f4f] hover:bg-[#0a3a3a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 md:py-4 rounded-[8px] flex items-center justify-center gap-2 transition-colors cursor-pointer text-[clamp(10px,1vw,14px)]"
                    >
                      {isSendingOtp ? "Reactivating..." : "Reactivate & Send OTP"}
                      {!isSendingOtp && <ArrowRight size={18} />}
                    </button>

                    <button
                      type="button"
                      onClick={handleKeepDeactivated}
                      disabled={isSendingOtp}
                      className="w-full border border-[#D1D5DB] text-[#374151] hover:border-[#0f4f4f] hover:text-[#0f4f4f] disabled:text-gray-400 disabled:cursor-not-allowed font-medium py-2 md:py-4 rounded-[8px] transition-colors cursor-pointer text-[clamp(10px,1vw,14px)]"
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

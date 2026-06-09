"use client";

import { useCallback, useEffect, useState } from "react";

export const OTP_RESEND_SECONDS = 60;

export function formatOtpResendTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function useOtpResendCountdown(seconds = OTP_RESEND_SECONDS) {
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);

  const startCountdown = useCallback(() => {
    setOtpSecondsLeft(seconds);
  }, [seconds]);

  const resetCountdown = useCallback(() => {
    setOtpSecondsLeft(0);
  }, []);

  useEffect(() => {
    if (otpSecondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setOtpSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [otpSecondsLeft]);

  const canResend = otpSecondsLeft <= 0;

  return {
    otpSecondsLeft,
    canResend,
    startCountdown,
    resetCountdown,
  };
}

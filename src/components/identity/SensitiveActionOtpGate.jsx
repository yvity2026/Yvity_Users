"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { IDENTITY_COPY } from "@/lib/identity/messages";

function OtpBoxes({ digits, onChange, idPrefix }) {
  const refs = useRef([]);

  const focusAt = (idx) => {
    refs.current[idx]?.focus();
    refs.current[idx]?.select();
  };

  const handleChange = (idx, raw) => {
    const val = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = val;
    onChange(next);
    if (val && idx < digits.length - 1) focusAt(idx + 1);
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        // clear current
        const next = [...digits];
        next[idx] = "";
        onChange(next);
      } else if (idx > 0) {
        // move back
        const next = [...digits];
        next[idx - 1] = "";
        onChange(next);
        focusAt(idx - 1);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      focusAt(idx - 1);
    } else if (e.key === "ArrowRight" && idx < digits.length - 1) {
      focusAt(idx + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits.length);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    onChange(next);
    const nextFocus = Math.min(pasted.length, digits.length - 1);
    focusAt(nextFocus);
  };

  return (
    <div className="flex justify-center gap-1.5">
      {digits.map((digit, idx) => (
        <input
          key={`${idPrefix}-${idx}`}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          aria-label={`${idPrefix} digit ${idx + 1}`}
          className="h-10 w-9 rounded-lg border border-[#E6E6E6] bg-[#F8F6F1] text-center text-sm font-bold focus:border-[#F59E0B] focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

export default function SensitiveActionOtpGate({ onVerified, compact = false }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);

  const sendCodes = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/auth/sensitive-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send codes");
      setSent(true);
      toast.success("Codes sent to your mobile and email");
    } catch (error) {
      toast.error(error.message || "Could not send verification codes");
    } finally {
      setSending(false);
    }
  };

  const verifyCodes = async () => {
    if (phoneOtp.join("").length !== 6 || emailOtp.join("").length !== 6) {
      toast.error("Enter both 6-digit codes");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/sensitive-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          phoneOtp: phoneOtp.join(""),
          emailOtp: emailOtp.join(""),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Verification failed");
      toast.success("Verified — you can update your profile photo safely");
      onVerified?.();
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-4 rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB] p-4"}>
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
        <div>
          <p className="text-[13px] font-bold text-[#0A4A4A]">
            Confirm it&apos;s really you
          </p>
          <p className="mt-1 text-[12px] leading-snug text-[#78350F]">
            {IDENTITY_COPY.profilePhoto.why}
          </p>
        </div>
      </div>

      {!sent ? (
        <button
          type="button"
          onClick={() => void sendCodes()}
          disabled={sending}
          className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg bg-[#0A4A4A] text-[12px] font-bold text-[#F59E0B] disabled:opacity-60"
        >
          {sending ? "Sending codes…" : "Send OTP to mobile & email"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-center text-[11px] font-semibold text-[#0A4A4A]">
              Mobile OTP
            </p>
            <OtpBoxes digits={phoneOtp} onChange={setPhoneOtp} idPrefix="sensitive-phone" />
          </div>
          <div>
            <p className="mb-2 text-center text-[11px] font-semibold text-[#0A4A4A]">
              Email OTP
            </p>
            <OtpBoxes digits={emailOtp} onChange={setEmailOtp} idPrefix="sensitive-email" />
          </div>
          <button
            type="button"
            onClick={() => void verifyCodes()}
            disabled={verifying}
            className="flex min-h-[40px] w-full items-center justify-center rounded-lg bg-[#0A4A4A] text-[12px] font-bold text-[#F59E0B] disabled:opacity-60"
          >
            {verifying ? "Verifying…" : "Verify & continue"}
          </button>
        </div>
      )}
    </div>
  );
}

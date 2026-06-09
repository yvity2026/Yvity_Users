"use client";

import { useState, useRef } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthUserContext";

export function SettingsModal({ isOpen, onClose, title, icon, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-250 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-xl sm:max-w-md sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            <h2 className="font-cormorant text-xl font-bold text-[#0A4A4A] sm:text-lg">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F4F0] text-gray-500 transition-colors hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="h-4 w-4 cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:p-6 sm:pt-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function MobileModal({ isOpen, onClose }) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setStep(1);
    setMobile("");
    onClose();
  };

  const normalizedMobile = mobile.replace(/\D/g, "").replace(/^[0-5]+/, "").slice(0, 10);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", newMobile: normalizedMobile }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send OTP");
      toast.success("OTP sent to your new mobile number");
      setStep(2);
    } catch (error) {
      toast.error(error.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (otp) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          newMobile: normalizedMobile,
          otp,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Verification failed");
      if (json.data) setUser(json.data);
      else setUser((prev) => (prev ? { ...prev, mobile: normalizedMobile } : prev));
      toast.success(json.message || "Mobile updated");
      handleClose();
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsModal isOpen={isOpen} onClose={handleClose} title="Change Mobile" icon="📱">
      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <div className="bg-[#EAF5F3] rounded-lg p-4 mb-6">
            <p className="text-[#0A4A4A] text-sm font-medium">
              Current: +91 {user?.mobile || "—"}
            </p>
          </div>
          <p className="mb-4 text-[12px] leading-snug text-[#6B7280]">
            OTP will be sent only to your <span className="font-semibold">new</span> number —
            so only you can claim it.
          </p>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              New Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#0A4A4A] focus:ring-1 focus:ring-[#0A4A4A]"
              placeholder="Enter new 10-digit mobile"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A4A4A] text-white rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#083a3a] transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send OTP"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <OtpForm
          length={6}
          loading={loading}
          onBack={() => setStep(1)}
          onSubmit={handleVerify}
          backText="Change Number"
          title="Enter OTP sent to new mobile"
        />
      )}
    </SettingsModal>
  );
}

export function EmailModal({ isOpen, onClose }) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setStep(1);
    setEmail("");
    onClose();
  };

  const normalizedEmail = email.trim().toLowerCase();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", newEmail: normalizedEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send OTP");
      toast.success("Verification code sent to your new email");
      setStep(2);
    } catch (error) {
      toast.error(error.message || "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (otp) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          newEmail: normalizedEmail,
          otp,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Verification failed");
      if (json.data) setUser(json.data);
      else setUser((prev) => (prev ? { ...prev, email: normalizedEmail } : prev));
      toast.success(json.message || "Email updated");
      handleClose();
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsModal isOpen={isOpen} onClose={handleClose} title="Change Email" icon="📧">
      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <div className="bg-[#EAF5F3] rounded-lg p-4 mb-6">
            <p className="text-[#0A4A4A] text-sm font-medium break-all">
              Current: {user?.email || "—"}
            </p>
          </div>
          <p className="mb-4 text-[12px] leading-snug text-[#6B7280]">
            OTP will be sent only to your <span className="font-semibold">new</span> inbox —
            so only you can confirm it.
          </p>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Enter New Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#0A4A4A] focus:ring-1 focus:ring-[#0A4A4A]"
              placeholder="Enter your new email"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A4A4A] text-white rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#083a3a] transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send Verification"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <OtpForm
          length={6}
          loading={loading}
          onBack={() => setStep(1)}
          onSubmit={handleVerify}
          backText="Change Email"
          title="Enter code sent to new email"
        />
      )}
    </SettingsModal>
  );
}




export function PasswordModal({ isOpen, onClose }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation using toast
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    // success (for now)
    toast.success("Password updated successfully");

    handleClose();
  };

  return (
    <SettingsModal isOpen={isOpen} onClose={handleClose} title="Change Password" icon="🔒">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input 
              type="password"
              required
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#0A4A4A] focus:ring-1 focus:ring-[#0A4A4A]" 
              placeholder="Enter current password" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <input 
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#0A4A4A] focus:ring-1 focus:ring-[#0A4A4A]" 
              placeholder="Min 8 characters" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input 
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#0A4A4A] focus:ring-1 focus:ring-[#0A4A4A]" 
              placeholder="Repeat new password" 
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-[#0A4A4A] text-white rounded-lg py-3 font-semibold text-sm hover:bg-[#083a3a] transition-colors cursor-pointer"
        >
          Update Password
        </button>
      </form>
    </SettingsModal>
  );
}
function OtpForm({ onBack, onSubmit, backText, length = 4, loading = false, title = `Enter ${length}-digit OTP` }) {
  const [otp, setOtp] = useState(Array.from({ length }, () => ""));
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (loading) return;
    if (isNaN(value)) return;
    const digits = value.replace(/\D/g, "").slice(0, length - index);

    if (digits.length > 1) {
      const newOtp = [...otp];
      digits.split("").forEach((digit, offset) => {
        newOtp[index + offset] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(index + digits.length, length - 1)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digits;
    setOtp(newOtp);

    // Auto focus next input
    if (digits !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, event) => {
    event.preventDefault();
    if (loading) return;

    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length - index);

    if (!pastedDigits) return;

    const newOtp = [...otp];
    pastedDigits.split("").forEach((digit, offset) => {
      newOtp[index + offset] = digit;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(index + pastedDigits.length, length - 1)]?.focus();
  };

  const handleKeyDown = (index, e) => {
    // Auto focus previous input on backspace
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    if (otp.every(digit => digit !== "")) {
      onSubmit(otp.join(""));
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <button 
        type="button" 
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-6 transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4" /> {backText}
      </button>

      <div className="mb-8 mt-2">
        <h3 className="text-[#0A4A4A] text-base font-medium text-center mb-6">{title}</h3>
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              maxLength={1}
              value={digit}
              disabled={loading}
              onChange={(e) => handleChange(index, e.target.value)}
              onPaste={(e) => handlePaste(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-10 h-11 sm:w-12 sm:h-12 bg-[#F8F6F1] border border-gray-200 rounded-xl text-center text-xl font-bold focus:outline-none focus:border-[#0A4A4A] focus:ring-1 focus:ring-[#0A4A4A] focus:bg-white transition-all disabled:opacity-70 disabled:cursor-wait"
            />
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        className="w-full bg-[#0A4A4A] text-white rounded-lg py-3 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#083a3a] transition-colors mt-auto cursor-pointer disabled:opacity-70 disabled:cursor-wait"
        disabled={loading || otp.some(digit => digit === "")}
      >
        {loading ? "Verifying..." : "Submit"} <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

function clearBrowserCookies() {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();
    if (!name) return;

    document.cookie = `${name}=; Max-Age=0; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}

export function DeactivateModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState("confirm");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const actionInFlightRef = useRef(false);

  const handleClose = () => {
    actionInFlightRef.current = false;
    setStep("confirm");
    setLoading(false);
    setEmail("");
    onClose();
  };

  const requestOtp = async () => {
    if (actionInFlightRef.current) return;
    actionInFlightRef.current = true;

    try {
      setLoading(true);
      const res = await fetch("/api/advisor/account/danger-zone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate" }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Unable to send OTP");

      setEmail(data.email || user?.email || "");
      setStep("otp");
      toast.success(data.message || "OTP sent");
    } catch (error) {
      toast.error(error.message || "Unable to send OTP");
    } finally {
      actionInFlightRef.current = false;
      setLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    if (actionInFlightRef.current) return;
    actionInFlightRef.current = true;

    try {
      setLoading(true);
      const res = await fetch("/api/advisor/account/danger-zone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate", otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Unable to deactivate account");

      toast.success(data.message || "Account deactivated");
      handleClose();
      if (data.redirect_url) {
        clearBrowserCookies();
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      toast.error(error.message || "Unable to deactivate account");
    } finally {
      actionInFlightRef.current = false;
      setLoading(false);
    }
  };

  return (
    <SettingsModal isOpen={isOpen} onClose={handleClose} title="Deactivate Account?">
      {step === "confirm" ? (
        <>
          <p className="text-gray-500 text-[clamp(12px,1.2vw,15px)] leading-relaxed mb-6 font-medium">
            Your profile will be hidden temporarily. You can activate your profile again within 30 days.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={requestOtp}
              disabled={loading}
              className="flex-1 py-3 bg-[#FEF2F2] border border-[#FECACA] text-[#D32323] rounded-lg font-bold text-sm hover:bg-[#FEE2E2] transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Deactivate"}
            </button>
            <button 
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 bg-[#0A4A4A] text-white rounded-lg font-bold text-sm hover:bg-[#083a3a] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-500 text-sm leading-relaxed mb-5 font-medium">
            We sent a 6-digit OTP to {email || "your registered email"}.
          </p>
          <OtpForm
            length={6}
            loading={loading}
            onBack={() => setStep("confirm")}
            onSubmit={verifyOtp}
            backText="Back"
          />
        </>
      )}
    </SettingsModal>
  );
}

export function DeleteModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [step, setStep] = useState("confirm");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const actionInFlightRef = useRef(false);

  const handleClose = () => {
    actionInFlightRef.current = false;
    setConfirmText("");
    setStep("confirm");
    setLoading(false);
    setEmail("");
    onClose();
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    if (actionInFlightRef.current) return;
    if (confirmText !== "DELETE") return;

    actionInFlightRef.current = true;

    try {
      setLoading(true);
      const res = await fetch("/api/advisor/account/danger-zone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Unable to send OTP");

      setEmail(data.email || user?.email || "");
      setStep("otp");
      toast.success(data.message || "OTP sent");
    } catch (error) {
      toast.error(error.message || "Unable to send OTP");
    } finally {
      actionInFlightRef.current = false;
      setLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    if (actionInFlightRef.current) return;
    actionInFlightRef.current = true;

    try {
      setLoading(true);
      const res = await fetch("/api/advisor/account/danger-zone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Unable to delete account");

      toast.success(data.message || "Account deleted");
      handleClose();
      if (data.redirect_url) {
        clearBrowserCookies();
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      toast.error(error.message || "Unable to delete account");
    } finally {
      actionInFlightRef.current = false;
      setLoading(false);
    }
  };

  return (
    <SettingsModal isOpen={isOpen} onClose={handleClose} title="Delete Account" icon="⚠️">
      {step === "confirm" ? (
        <>
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 mb-6">
            <p className="text-[clamp(12px,1.2vw,14px)] text-[#D32323] leading-relaxed">
              <span className="font-bold">This is permanent and cannot be undone.</span> All your profile data, testimonials, achievements and subscription will be deleted.
            </p>
          </div>

          <form onSubmit={requestOtp}>
            <div className="mb-6">
              <label className="block text-[clamp(13px,1.3vw,15px)] font-bold text-gray-900 mb-2">
                Type DELETE to confirm
              </label>
              <input 
                type="text"
                required
                value={confirmText}
                disabled={loading}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#D32323] focus:ring-1 focus:ring-[#D32323] disabled:opacity-70 disabled:cursor-wait" 
                placeholder="Type DELETE" 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || confirmText !== "DELETE"}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-colors cursor-pointer ${
                confirmText === "DELETE" && !loading
                  ? "bg-[#DF3737] hover:bg-[#c72f2f] text-white" 
                  : "bg-[#F3F4F6] text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Sending OTP..." : "Send OTP to Delete Account"}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="text-gray-500 text-sm leading-relaxed mb-5 font-medium">
            We sent a 6-digit OTP to {email || "your registered email"}.
          </p>
          <OtpForm
            length={6}
            loading={loading}
            onBack={() => setStep("confirm")}
            onSubmit={verifyOtp}
            backText="Back"
          />
        </>
      )}
    </SettingsModal>
  );
}

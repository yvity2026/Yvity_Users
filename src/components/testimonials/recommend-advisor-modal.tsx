"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, Loader2, ShieldCheck, Sparkles, Star, X } from "lucide-react";
import { advisorProfile } from "@/lib/advisor-profile";
import { RECOMMENDATION_TAGS, type RecommendationTag } from "@/lib/recommendations/types";
import { validateMobile } from "@/lib/testimonials/submit-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const OTP_RESEND_SECONDS = 60;

type RecommendAdvisorModalProps = {
  open: boolean;
  onClose: () => void;
};

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Premium "Recommend Advisor" submission flow.
 *
 *   1. Visitor fills name → picks chips → optional comment → mobile.
 *   2. Visitor taps "Verify Mobile Number" → server sends OTP.
 *   3. Visitor enters 6-digit OTP → client hits `/otp/verify` →
 *      "Mobile verified" badge appears.
 *   4. Submit button enables; final POST re-verifies OTP server-side,
 *      blocks duplicates by mobile, persists with `verified: true`.
 *   5. Success state confirms the recommendation was recorded.
 *
 * The chip palette is gold to match the Recommend Advisor quick-action
 * tile on the home page. Mobile-first sizing: chips wrap, full-width
 * inputs, sticky header, bottom-sheet on phones / centered card on
 * `sm+`.
 */
export function RecommendAdvisorModal({ open, onClose }: RecommendAdvisorModalProps) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<RecommendationTag>>(new Set());

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const canResend = otpSent && otpSecondsLeft <= 0;

  const reset = useCallback(() => {
    setFullName("");
    setMobile("");
    setComment("");
    setSelectedTags(new Set());
    setOtp("");
    setOtpSent(false);
    setOtpSecondsLeft(0);
    setSendingOtp(false);
    setVerifyingOtp(false);
    setMobileVerified(false);
    setError(null);
    setSubmitting(false);
    setSuccess(false);
  }, []);

  // Reset modal state shortly after close so the next open starts fresh
  // without snapping mid-animation.
  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(reset, 300);
      return () => window.clearTimeout(t);
    }
  }, [open, reset]);

  // ESC to close + lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // OTP resend countdown.
  useEffect(() => {
    if (!otpSent || otpSecondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setOtpSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [otpSent, otpSecondsLeft]);

  // Changing the mobile number after verification invalidates the OTP.
  useEffect(() => {
    if (!mobileVerified) return;
    setMobileVerified(false);
    setOtpSent(false);
    setOtp("");
    setOtpSecondsLeft(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  const toggleTag = (tag: RecommendationTag) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const sendOtp = async () => {
    setError(null);
    if (!validateMobile(mobile)) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch("/api/recommendations/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: mobile.trim() }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not send OTP. Please try again.");
        return;
      }
      setOtpSent(true);
      setOtpSecondsLeft(OTP_RESEND_SECONDS);
      setOtp("");
      setMobileVerified(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setError(null);
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/recommendations/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: code }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "Invalid OTP. Please try again.");
        return;
      }
      setMobileVerified(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    if (mobileVerified) setMobileVerified(false);
    if (digits.length === 6 && !verifyingOtp) {
      void verifyOtp(digits);
    }
  };

  const tagsArray = useMemo(() => Array.from(selectedTags), [selectedTags]);

  const canSubmit =
    fullName.trim().length >= 2 &&
    tagsArray.length > 0 &&
    validateMobile(mobile) &&
    mobileVerified &&
    otp.length === 6;

  const submit = async () => {
    setError(null);
    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (tagsArray.length === 0) {
      setError("Pick at least one reason you recommend this advisor.");
      return;
    }
    if (!validateMobile(mobile) || !mobileVerified) {
      setError("Please verify your mobile number with the OTP first.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          comment: comment.trim(),
          tags: tagsArray,
          otp: otp.trim(),
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Could not submit recommendation.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recommend-advisor-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        className={cn(
          "relative z-10 w-full sm:max-w-lg max-h-[92dvh] overflow-hidden",
          "glass-strong border border-white/12 rounded-t-3xl sm:rounded-3xl shadow-2xl",
          "flex flex-col",
          "animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300",
        )}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[oklch(0.18_0.035_235/0.95)] backdrop-blur-md px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                "bg-gradient-to-br from-[oklch(0.85_0.16_78)] to-[oklch(0.72_0.15_55)]",
                "text-white shadow-md ring-1 ring-[oklch(0.85_0.16_78/0.45)]",
              )}
            >
              <Star className="size-4 fill-current" />
            </span>
            <div className="min-w-0">
              <h2
                id="recommend-advisor-title"
                className="text-sm font-bold tracking-tight truncate"
              >
                Recommend {advisorProfile.name.split(" ")[0]}
              </h2>
              <p className="text-[11px] text-muted-foreground">Share why you trust this advisor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/12 hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {success ? (
            <SuccessState onClose={onClose} firstName={advisorProfile.name.split(" ")[0]} />
          ) : (
            <div className="p-5 space-y-5">
              {/* Full name */}
              <div className="space-y-1.5">
                <Label htmlFor="rec-name">
                  Full name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rec-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                  autoComplete="name"
                  disabled={submitting}
                />
              </div>

              {/* Recommendation tag chips */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label id="rec-tags-label" className="leading-none">
                    Why do you recommend this advisor? <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {tagsArray.length} selected
                  </span>
                </div>
                <p id="rec-tags-help" className="text-[11px] text-muted-foreground -mt-1">
                  Pick all that apply. Highlighted chips are selected.
                </p>
                {/* Multi-select chip group. Each chip is a `button` with
                    `aria-pressed`; wrapping them in `role="group"` plus
                    `aria-labelledby` ensures screen readers announce
                    "<label>, group" before reading the chips. */}
                <div
                  role="group"
                  aria-labelledby="rec-tags-label"
                  aria-describedby="rec-tags-help"
                  className="flex flex-wrap gap-2 pt-1"
                >
                  {RECOMMENDATION_TAGS.map((tag) => {
                    const active = selectedTags.has(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        disabled={submitting}
                        aria-pressed={active}
                        className={cn(
                          "group inline-flex items-center gap-1.5 rounded-full",
                          "px-3 py-1.5 text-[12px] font-medium leading-none",
                          "border transition-all duration-200 ease-out motion-reduce:transition-none",
                          "active:scale-[0.97]",
                          active
                            ? cn(
                                "border-[oklch(0.85_0.16_78/0.6)]",
                                "bg-gradient-to-br from-[oklch(0.85_0.16_78/0.22)] to-[oklch(0.72_0.15_55/0.22)]",
                                "text-[oklch(0.95_0.12_82)] shadow-[0_4px_14px_-6px_oklch(0.85_0.16_78/0.5)]",
                                "ring-1 ring-[oklch(0.85_0.16_78/0.4)]",
                              )
                            : cn(
                                "border-white/12 bg-white/[0.04] text-foreground/80",
                                "hover:border-white/22 hover:bg-white/[0.07] hover:text-foreground",
                              ),
                        )}
                      >
                        {active && (
                          <Check
                            className="size-3 shrink-0 text-[oklch(0.92_0.14_82)] animate-in fade-in zoom-in-75 duration-150"
                            strokeWidth={3}
                          />
                        )}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional comments (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="rec-comment">Additional comments (optional)</Label>
                <Textarea
                  id="rec-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Why would you recommend this advisor to friends or family?"
                  rows={3}
                  className="rounded-xl border-white/15 bg-white/[0.04] resize-none"
                  disabled={submitting}
                />
              </div>

              {/* Mobile + OTP block */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rec-mobile">
                    Mobile number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rec-mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 00000 00000"
                    className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                    autoComplete="tel"
                    disabled={submitting || (mobileVerified && otpSent)}
                  />
                </div>

                {mobileVerified ? (
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2.5",
                      "border border-[oklch(0.78_0.16_162/0.4)] bg-[oklch(0.78_0.16_162/0.1)]",
                      "animate-in fade-in slide-in-from-top-1 duration-200",
                    )}
                  >
                    <ShieldCheck className="size-4 shrink-0 text-[oklch(0.86_0.14_162)]" />
                    <p className="text-xs font-semibold text-[oklch(0.92_0.12_165)]">
                      Mobile verified
                    </p>
                  </div>
                ) : !otpSent ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full rounded-full h-10"
                    onClick={() => void sendOtp()}
                    disabled={sendingOtp || !mobile.trim() || submitting}
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending OTP…
                      </>
                    ) : (
                      "Verify Mobile Number"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <p className="text-muted-foreground">
                        OTP sent to <span className="text-foreground font-medium">{mobile}</span>
                      </p>
                      {otpSecondsLeft > 0 ? (
                        <span className="tabular-nums text-[oklch(0.85_0.16_78)] font-medium">
                          Resend in {formatTimer(otpSecondsLeft)}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="rec-otp">Enter 6-digit OTP</Label>
                      <div className="relative">
                        <Input
                          id="rec-otp"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => handleOtpChange(e.target.value)}
                          placeholder="123456"
                          className={cn(
                            "h-12 rounded-xl bg-white/[0.04] text-center text-lg tracking-[0.4em] font-mono",
                            mobileVerified
                              ? "border-[oklch(0.78_0.16_162/0.5)] ring-1 ring-[oklch(0.78_0.16_162/0.3)]"
                              : "border-white/15",
                          )}
                          autoComplete="one-time-code"
                          disabled={submitting}
                        />
                        {verifyingOtp && (
                          <Loader2 className="size-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full border-white/15"
                      onClick={() => void sendOtp()}
                      disabled={!canResend || sendingOtp || submitting}
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        "Resend OTP"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <p
                  className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Sticky footer with Submit button ── */}
        {!success && (
          <div className="shrink-0 border-t border-white/10 bg-[oklch(0.18_0.035_235/0.85)] backdrop-blur-md p-4">
            <Button
              type="button"
              className={cn(
                "w-full rounded-full h-11 font-semibold",
                "bg-gradient-to-r from-[oklch(0.85_0.16_78)] to-[oklch(0.72_0.15_55)]",
                "text-[oklch(0.18_0.035_235)] hover:opacity-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
              onClick={() => void submit()}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Submit Recommendation
                </>
              )}
            </Button>
            {!canSubmit && !submitting && (
              <p className="mt-2 text-center text-[10.5px] text-muted-foreground">
                {!mobileVerified
                  ? "Verify your mobile to enable submission"
                  : tagsArray.length === 0
                    ? "Pick at least one reason above"
                    : fullName.trim().length < 2
                      ? "Enter your full name"
                      : "Complete all required fields"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SuccessState({ onClose, firstName }: { onClose: () => void; firstName: string }) {
  return (
    <div className="p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div
        className={cn(
          "relative mx-auto inline-flex size-20 items-center justify-center rounded-full",
          "bg-gradient-to-br from-[oklch(0.85_0.16_78)] to-[oklch(0.72_0.15_55)]",
          "shadow-[0_18px_40px_-12px_oklch(0.85_0.16_78/0.55)]",
        )}
      >
        <CheckCircle2 className="size-10 text-[oklch(0.18_0.035_235)]" strokeWidth={2.5} />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-[oklch(0.85_0.16_78/0.4)] animate-ping"
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-bold tracking-tight">Thank you!</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your recommendation for <span className="text-foreground font-medium">{firstName}</span>{" "}
          has been verified and recorded. Your endorsement helps others discover trusted advice.
        </p>
      </div>
      <Button
        onClick={onClose}
        className={cn(
          "mt-2 rounded-full px-10 h-11 font-semibold",
          "bg-gradient-to-r from-[oklch(0.85_0.16_78)] to-[oklch(0.72_0.15_55)]",
          "text-[oklch(0.18_0.035_235)] hover:opacity-95",
        )}
      >
        Done
      </Button>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Headphones, Loader2, MessageSquare, Shield, Upload, Video, X } from "lucide-react";
import { useAuth } from "@/context/AuthUserContext";
import { DUMMY_OTP } from "@/lib/constants";
import { useTestimonialSubmit } from "@/lib/testimonial-submit-store";
import { testimonialTypeFilters } from "@/lib/sections/testimonials-config";
import type { TestimonialService, TestimonialType } from "@/lib/sections/types";
import { StarRatingInput } from "@/components/ui/star-rating-input";
import { useRegisteredTestimonialServices } from "@/hooks/use-registered-testimonial-services";
import {
  formatMediaDuration,
  initialGiveTestimonialDraft,
  validateGiveContent,
  validateGiveDetails,
  validateMobile,
  type GiveTestimonialDraft,
} from "@/lib/testimonials/submit-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const OTP_RESEND_SECONDS = 60;

const typeIcons = {
  text: MessageSquare,
  audio: Headphones,
  video: Video,
} as const;

function readMediaDuration(file: File, kind: "audio" | "video"): Promise<string> {
  return new Promise((resolve) => {
    const el = document.createElement(kind);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const dur = Number.isFinite(el.duration) ? el.duration : 0;
      URL.revokeObjectURL(el.src);
      resolve(formatMediaDuration(dur || 0));
    };
    el.onerror = () => resolve("");
    el.src = URL.createObjectURL(file);
  });
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GiveTestimonialModal() {
  const { giveOpen, closeGiveTestimonial, onPublished } = useTestimonialSubmit();
  const { serviceOptions, loading: servicesLoading } = useRegisteredTestimonialServices("public");
  const { user } = useAuth();
  const isLoggedIn = Boolean(user?.id);
  const [draft, setDraft] = useState<GiveTestimonialDraft>(initialGiveTestimonialDraft);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mediaDuration, setMediaDuration] = useState("");

  const canResend = otpSent && otpSecondsLeft <= 0;

  const reset = useCallback(() => {
    setDraft(initialGiveTestimonialDraft());
    setSuccess(false);
    setError(null);
    setOtp("");
    setOtpSent(false);
    setOtpSecondsLeft(0);
    setMediaDuration("");
  }, []);

  useEffect(() => {
    if (!giveOpen) {
      const t = window.setTimeout(reset, 300);
      return () => window.clearTimeout(t);
    }
  }, [giveOpen, reset]);

  useEffect(() => {
    if (!otpSent || otpSecondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setOtpSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [otpSent, otpSecondsLeft]);

  useEffect(() => {
    if (!giveOpen || servicesLoading || serviceOptions.length === 0) return;
    setDraft((current) => {
      const hasValidService = serviceOptions.some((opt) => opt.value === current.service);
      if (hasValidService) return current;
      return { ...current, service: serviceOptions[0]?.value ?? "" };
    });
  }, [giveOpen, servicesLoading, serviceOptions]);

  useEffect(() => {
    if (!giveOpen || !user) return;
    setDraft((current) => ({
      ...current,
      fullName: current.fullName || user.name?.trim() || "",
      mobile: current.mobile || user.mobile?.trim() || user.phone?.trim() || "",
    }));
  }, [giveOpen, user]);

  if (!giveOpen) return null;

  const patch = (p: Partial<GiveTestimonialDraft>) => {
    setDraft((d) => ({ ...d, ...p }));
    if (p.mobile !== undefined) {
      setOtpSent(false);
      setOtp("");
      setOtpSecondsLeft(0);
    }
  };

  const sendOtp = async () => {
    setError(null);
    if (!validateMobile(draft.mobile)) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch("/api/testimonials/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: draft.mobile }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send OTP.");
        return;
      }
      setOtpSent(true);
      setOtpSecondsLeft(OTP_RESEND_SECONDS);
      setOtp("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const submitTestimonial = async () => {
    setError(null);
    const detailsErr = validateGiveDetails(draft);
    if (detailsErr) {
      setError(detailsErr);
      return;
    }
    const contentErr = validateGiveContent(draft);
    if (contentErr) {
      setError(contentErr);
      return;
    }
    if (!isLoggedIn) {
      if (!otpSent) {
        setError("Please verify your mobile number with OTP first.");
        return;
      }
      if (otp.trim().length < 6) {
        setError("Enter the 6-digit OTP sent to your mobile.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (!isLoggedIn) formData.set("otp", otp.trim());
      formData.set("type", draft.type);
      formData.set("service", draft.service);
      formData.set("rating", String(draft.rating));
      formData.set("fullName", draft.fullName);
      formData.set("mobile", draft.mobile);
      formData.set("profession", draft.profession);
      formData.set("location", draft.location);
      formData.set("quote", draft.quote);
      if (draft.mediaFile) {
        formData.set("media", draft.mediaFile);
        if (draft.type === "audio") formData.set("audioDuration", mediaDuration);
        if (draft.type === "video") formData.set("videoDuration", mediaDuration);
      }

      const res = await fetch("/api/testimonials/submit", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        error?: string;
        data?: import("@/lib/sections/types").TestimonialItem;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not submit testimonial.");
        return;
      }
      if (data.data) onPublished(data.data);
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onMediaPick = async (file: File | null) => {
    patch({ mediaFile: file });
    if (!file) {
      setMediaDuration("");
      return;
    }
    if (draft.type === "audio" || draft.type === "video") {
      const dur = await readMediaDuration(file, draft.type);
      setMediaDuration(dur);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="give-testimonial-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={closeGiveTestimonial}
        aria-label="Close"
      />

      <div className="relative z-10 flex w-full max-h-[94dvh] sm:max-h-[90vh] flex-col sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl">
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0 border-b border-white/10">
          <div>
            <h2 id="give-testimonial-title" className="text-lg sm:text-xl font-bold tracking-tight">
              {success ? "Thank you!" : "Give Testimonial"}
            </h2>
            {!success && (
              <p className="mt-1 text-xs text-muted-foreground">
                Share your experience — verify mobile to submit
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={closeGiveTestimonial}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          {success ? (
            <div className="py-8 text-center animate-in fade-in">
              <CheckCircle2 className="size-14 mx-auto text-[oklch(0.82_0.16_162)] mb-4" />
              <p className="text-lg font-semibold">Thank you!</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                Your feedback has been sent to the advisor. Thank you for sharing!
              </p>
              <Button onClick={closeGiveTestimonial} className="mt-6 rounded-full px-8">
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Testimonial type
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {testimonialTypeFilters
                    .filter((f) => f.id !== "all")
                    .map((f) => {
                      const id = f.id as TestimonialType;
                      const Icon = typeIcons[id];
                      const active = draft.type === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => patch({ type: id, mediaFile: null, quote: "" })}
                          className={cn(
                            "flex-1 min-w-[96px] flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition",
                            active
                              ? "border-primary bg-primary/15 shadow-md shadow-primary/20"
                              : "border-white/12 bg-white/[0.04] text-muted-foreground",
                          )}
                        >
                          <Icon className={cn("size-5", active && "text-[oklch(0.82_0.13_205)]")} />
                          <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight">
                            {f.label.replace(" Testimonial", "")}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="gt-service">
                    Related service <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[oklch(0.82_0.13_205)] pointer-events-none" />
                    <select
                      id="gt-service"
                      value={draft.service}
                      onChange={(e) =>
                        patch({ service: e.target.value as TestimonialService | "" })
                      }
                      disabled={servicesLoading || serviceOptions.length === 0}
                      className={cn(
                        "w-full appearance-none rounded-xl border border-white/15 bg-white/[0.04] py-2.5 pl-10 pr-10 text-sm",
                        "text-foreground focus:outline-none focus:ring-1 focus:ring-[oklch(0.82_0.13_205/0.5)]",
                      )}
                    >
                      {servicesLoading ? (
                        <option value="" className="bg-[oklch(0.18_0.035_235)]">
                          Loading services…
                        </option>
                      ) : serviceOptions.length === 0 ? (
                        <option value="" className="bg-[oklch(0.18_0.035_235)]">
                          No services available yet
                        </option>
                      ) : (
                        serviceOptions.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-[oklch(0.18_0.035_235)]"
                          >
                            {opt.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label>
                    Your rating <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <StarRatingInput
                      value={draft.rating}
                      onChange={(rating) => patch({ rating })}
                    />
                    <p className="text-xs text-muted-foreground">
                      {draft.rating} out of 5 stars — tap to change
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="gt-name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="gt-name"
                    value={draft.fullName}
                    onChange={(e) => patch({ fullName: e.target.value })}
                    placeholder="Enter your name"
                    className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gt-profession">Profession</Label>
                  <Input
                    id="gt-profession"
                    value={draft.profession}
                    onChange={(e) => patch({ profession: e.target.value })}
                    placeholder="Optional"
                    className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gt-location">City / Location</Label>
                  <Input
                    id="gt-location"
                    value={draft.location}
                    onChange={(e) => patch({ location: e.target.value })}
                    placeholder="Optional"
                    className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                  />
                </div>
              </div>

              {draft.type === "text" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="gt-quote">
                    Your testimonial <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="gt-quote"
                    value={draft.quote}
                    onChange={(e) => patch({ quote: e.target.value })}
                    placeholder="Share your experience with the advisor..."
                    rows={4}
                    className="rounded-xl border-white/15 bg-white/[0.04] resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>
                    Upload {draft.type === "audio" ? "audio" : "video"}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15",
                      "bg-white/[0.03] px-4 py-6 cursor-pointer hover:border-[oklch(0.82_0.13_205/0.4)] transition",
                    )}
                  >
                    <Upload className="size-7 text-[oklch(0.82_0.13_205)]" />
                    <span className="text-sm font-medium text-center">
                      {draft.mediaFile ? draft.mediaFile.name : "Tap to upload"}
                    </span>
                    <input
                      type="file"
                      className="sr-only"
                      accept={draft.type === "audio" ? "audio/*" : "video/*"}
                      onChange={(e) => void onMediaPick(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {mediaDuration && (
                    <p className="text-xs text-muted-foreground">Duration: {mediaDuration}</p>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gt-mobile">
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="gt-mobile"
                    type="tel"
                    value={draft.mobile}
                    onChange={(e) => patch({ mobile: e.target.value })}
                    placeholder="+91 00000 00000"
                    className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                    autoComplete="tel"
                    disabled={submitting}
                  />
                </div>

                {isLoggedIn ? (
                  <p className="text-xs text-[oklch(0.82_0.16_162)]">
                    Signed in to YVITY — OTP verification skipped.
                  </p>
                ) : !otpSent ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full rounded-full h-10"
                    onClick={() => void sendOtp()}
                    disabled={sendingOtp || !draft.mobile.trim()}
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending OTP…
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <p className="text-muted-foreground">
                        OTP sent to{" "}
                        <span className="text-foreground font-medium">{draft.mobile}</span>
                      </p>
                      {otpSecondsLeft > 0 ? (
                        <span className="tabular-nums text-[oklch(0.82_0.13_205)] font-medium">
                          Resend in {formatTimer(otpSecondsLeft)}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="gt-otp">Enter OTP</Label>
                      <Input
                        id="gt-otp"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="6-digit code"
                        className="h-12 rounded-xl border-white/15 bg-white/[0.04] text-center text-lg tracking-[0.3em] font-mono"
                        autoComplete="one-time-code"
                      />
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      Demo OTP: <span className="font-mono text-foreground">{DUMMY_OTP}</span>
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full border-white/15"
                      onClick={() => void sendOtp()}
                      disabled={!canResend || sendingOtp}
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
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {!success && (
          <div className="p-4 border-t border-white/10 shrink-0">
            <Button
              type="button"
              className="w-full rounded-full h-11 font-semibold"
              onClick={() => void submitTestimonial()}
              disabled={
                submitting ||
                (!isLoggedIn && (!otpSent || otp.length < 6)) ||
                !draft.service ||
                draft.rating < 1 ||
                serviceOptions.length === 0 ||
                !validateMobile(draft.mobile)
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Testimonial"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

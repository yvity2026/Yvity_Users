"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Headphones,
  Loader2,
  MessageSquare,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthUserContext";
import { StarRatingInput } from "@/components/ui/star-rating-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ReviewType = "text" | "audio" | "video";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillName?: string;
  respondentType?: "advisor" | "customer";
};

const OTP_RESEND_SECONDS = 60;

const TYPE_OPTIONS: { id: ReviewType; label: string; Icon: typeof MessageSquare }[] = [
  { id: "text",  label: "Write",  Icon: MessageSquare },
  { id: "audio", label: "Audio",  Icon: Headphones },
  { id: "video", label: "Video",  Icon: Video },
];

function readMediaDuration(file: File, kind: "audio" | "video"): Promise<string> {
  return new Promise((resolve) => {
    const el = document.createElement(kind);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const dur = Number.isFinite(el.duration) ? el.duration : 0;
      URL.revokeObjectURL(el.src);
      const m = Math.floor(dur / 60);
      const s = Math.floor(dur % 60);
      resolve(dur > 0 ? `${m}:${s.toString().padStart(2, "0")}` : "");
    };
    el.onerror = () => resolve("");
    el.src = URL.createObjectURL(file);
  });
}

function validateMobile(mobile: string): boolean {
  const digits = mobile.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlatformReviewModal({
  open,
  onClose,
  onSuccess,
  prefillName = "",
  respondentType = "customer",
}: Props) {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user?.id);

  const [type, setType]         = useState<ReviewType>("text");
  const [rating, setRating]     = useState(0);
  const [name, setName]         = useState(prefillName);
  const [mobile, setMobile]     = useState("");
  const [profession, setProfession] = useState("");
  const [city, setCity]         = useState("");
  const [content, setContent]   = useState("");
  const [mediaFile, setMediaFile]   = useState<File | null>(null);
  const [mediaDuration, setMediaDuration] = useState("");

  const [otp, setOtp]               = useState("");
  const [otpSent, setOtpSent]       = useState(false);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const canResend = otpSent && otpSecondsLeft <= 0;

  const reset = useCallback(() => {
    setType("text");
    setRating(0);
    setName(prefillName);
    setMobile("");
    setProfession("");
    setCity("");
    setContent("");
    setMediaFile(null);
    setMediaDuration("");
    setOtp("");
    setOtpSent(false);
    setOtpSecondsLeft(0);
    setSuccess(false);
    setError(null);
  }, [prefillName]);

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(reset, 300);
      return () => window.clearTimeout(t);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!otpSent || otpSecondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setOtpSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [otpSent, otpSecondsLeft]);

  useEffect(() => {
    if (open && user) {
      setName((n) => n || user.name?.trim() || "");
      setMobile((m) => m || user.mobile?.trim() || user.phone?.trim() || "");
    }
  }, [open, user]);

  if (!open) return null;

  const onMobileChange = (val: string) => {
    setMobile(val);
    setOtpSent(false);
    setOtp("");
    setOtpSecondsLeft(0);
  };

  const onTypePick = (t: ReviewType) => {
    setType(t);
    setMediaFile(null);
    setMediaDuration("");
    setContent("");
    setError(null);
  };

  const onMediaPick = async (file: File | null) => {
    setMediaFile(file);
    if (!file) { setMediaDuration(""); return; }
    if (type === "audio" || type === "video") {
      const dur = await readMediaDuration(file, type);
      setMediaDuration(dur);
    }
  };

  const sendOtp = async () => {
    setError(null);
    if (!validateMobile(mobile)) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch("/api/platform-testimonials/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setError(data.error ?? "Could not send OTP."); return; }
      setOtpSent(true);
      setOtpSecondsLeft(OTP_RESEND_SECONDS);
      setOtp("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (rating < 1) { setError("Please select a star rating."); return; }
    if (!name.trim() || name.trim().length < 2) { setError("Please enter your name."); return; }
    if (!validateMobile(mobile)) { setError("Enter a valid mobile number."); return; }
    if (type === "text" && !content.trim()) { setError("Please share your experience in writing."); return; }
    if ((type === "audio" || type === "video") && !mediaFile) { setError(`Please upload your ${type} file.`); return; }

    if (!isLoggedIn) {
      if (!otpSent) { setError("Please verify your mobile number with OTP first."); return; }
      if (otp.trim().length < 6) { setError("Enter the 6-digit OTP sent to your mobile."); return; }
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("type", type);
      fd.set("rating", String(rating));
      fd.set("name", name.trim());
      fd.set("mobile", mobile.trim());
      fd.set("profession", profession.trim());
      fd.set("city", city.trim());
      fd.set("content", content.trim());
      fd.set("respondentType", respondentType);
      if (!isLoggedIn) fd.set("otp", otp.trim());
      if (mediaFile) {
        fd.set("media", mediaFile);
        if (type === "audio" && mediaDuration) fd.set("audioDuration", mediaDuration);
        if (type === "video" && mediaDuration) fd.set("videoDuration", mediaDuration);
      }

      const res = await fetch("/api/platform-testimonials", { method: "POST", body: fd });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setError(data.error ?? "Submission failed."); return; }

      setSuccess(true);
      setTimeout(() => onSuccess(), 1800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !submitting &&
    rating >= 1 &&
    name.trim().length >= 2 &&
    validateMobile(mobile) &&
    (type === "text" ? content.trim().length > 0 : !!mediaFile) &&
    (isLoggedIn || (otpSent && otp.length >= 6));

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform-review-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative z-10 flex w-full max-h-[94dvh] sm:max-h-[90vh] flex-col sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0 border-b border-white/10">
          <div>
            <h2 id="platform-review-title" className="text-lg sm:text-xl font-bold tracking-tight">
              {success ? "Thank you!" : "Rate Your YVITY Experience"}
            </h2>
            {!success && (
              <p className="mt-1 text-xs text-muted-foreground">
                Your review helps us build a better platform
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
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
              <p className="text-lg font-semibold">Thank you for your review!</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                Your experience helps us improve YVITY for everyone.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Type picker */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  Review type
                </p>
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map(({ id, label, Icon }) => {
                    const active = type === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onTypePick(id)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition",
                          active
                            ? "border-primary bg-primary/15 shadow-md shadow-primary/20"
                            : "border-white/12 bg-white/[0.04] text-muted-foreground",
                        )}
                      >
                        <Icon className={cn("size-5", active && "text-[oklch(0.82_0.13_205)]")} />
                        <span className="text-[10px] sm:text-xs font-semibold">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Star rating */}
              <div className="space-y-2">
                <Label>
                  Your rating <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap items-center gap-3">
                  <StarRatingInput value={rating} onChange={setRating} />
                  <p className={cn("text-xs", rating === 0 ? "text-[oklch(0.85_0.16_78)] font-medium" : "text-muted-foreground")}>
                    {rating === 0 ? "Please select a star rating" : `${rating} out of 5 — tap to change`}
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="pr-name">
                    Your name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pr-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pr-profession">Profession</Label>
                  <Input
                    id="pr-profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Optional"
                    className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pr-city">City</Label>
                  <Input
                    id="pr-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Optional"
                    className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                  />
                </div>
              </div>

              {/* Content / media */}
              {type === "text" ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="pr-content">
                      Your review <span className="text-destructive">*</span>
                    </Label>
                    <span className={cn("text-[10px] tabular-nums", content.length > 480 ? "text-destructive" : "text-muted-foreground")}>
                      {content.length}/500
                    </span>
                  </div>
                  <Textarea
                    id="pr-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 500))}
                    placeholder="Share your experience with YVITY…"
                    rows={4}
                    maxLength={500}
                    className="rounded-xl border-white/15 bg-white/[0.04] resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>
                    Upload {type} <span className="text-destructive">*</span>
                  </Label>
                  {mediaFile && type === "audio" ? (
                    <div className="rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-4 space-y-2">
                      <audio controls className="w-full h-9 accent-primary" src={URL.createObjectURL(mediaFile)} preload="metadata">
                        <track kind="captions" />
                      </audio>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground truncate">{mediaFile.name}</p>
                        <label className="shrink-0 cursor-pointer text-[11px] text-[oklch(0.82_0.13_205)] hover:underline">
                          Change
                          <input type="file" className="sr-only" accept="audio/*" onChange={(e) => void onMediaPick(e.target.files?.[0] ?? null)} />
                        </label>
                      </div>
                    </div>
                  ) : mediaFile && type === "video" ? (
                    <div className="rounded-2xl border border-white/15 bg-white/[0.03] overflow-hidden space-y-2">
                      <video controls className="w-full max-h-48 object-cover" src={URL.createObjectURL(mediaFile)} preload="metadata">
                        <track kind="captions" />
                      </video>
                      <div className="flex items-center justify-between gap-2 px-4 pb-3">
                        <p className="text-xs text-muted-foreground truncate">{mediaFile.name}</p>
                        <label className="shrink-0 cursor-pointer text-[11px] text-[oklch(0.82_0.13_205)] hover:underline">
                          Change
                          <input type="file" className="sr-only" accept="video/*" onChange={(e) => void onMediaPick(e.target.files?.[0] ?? null)} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] px-4 py-6 cursor-pointer hover:border-[oklch(0.82_0.13_205/0.4)] transition">
                      <Upload className="size-7 text-[oklch(0.82_0.13_205)]" />
                      <span className="text-sm font-medium text-center">Tap to upload</span>
                      <span className="text-xs text-muted-foreground">
                        {type === "audio" ? "MP3, WAV, WebM — up to 10 MB" : "MP4, WebM, MOV — up to 25 MB"}
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        accept={type === "audio" ? "audio/*" : "video/*"}
                        onChange={(e) => void onMediaPick(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Mobile + OTP block */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pr-mobile">
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pr-mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => onMobileChange(e.target.value)}
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
                    disabled={sendingOtp || !mobile.trim()}
                  >
                    {sendingOtp ? (
                      <><Loader2 className="size-4 animate-spin" /> Sending OTP…</>
                    ) : (
                      "Send OTP on WhatsApp"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <p className="text-muted-foreground">
                        OTP sent to <span className="text-foreground font-medium">{mobile}</span>
                      </p>
                      {otpSecondsLeft > 0 && (
                        <span className="tabular-nums text-[oklch(0.82_0.13_205)] font-medium">
                          Resend in {formatTimer(otpSecondsLeft)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pr-otp">Enter OTP</Label>
                      <Input
                        id="pr-otp"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="6-digit code"
                        className="h-12 rounded-xl border-white/15 bg-white/[0.04] text-center text-lg tracking-[0.3em] font-mono"
                        autoComplete="one-time-code"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full border-white/15"
                      onClick={() => void sendOtp()}
                      disabled={!canResend || sendingOtp}
                    >
                      {sendingOtp ? (
                        <><Loader2 className="size-3.5 animate-spin" /> Sending…</>
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
              onClick={() => void handleSubmit()}
              disabled={!canSubmit}
            >
              {submitting ? (
                <><Loader2 className="size-4 animate-spin" /> Submitting…</>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

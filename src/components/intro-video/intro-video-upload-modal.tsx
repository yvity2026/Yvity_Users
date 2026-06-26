"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Play,
  Trash2,
  Upload,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import {
  getEffectiveIntroVideo,
  parseDurationLabelToSeconds,
} from "@/lib/intro-video";
import { isHostedIntroVideoUrl } from "@/lib/media-urls";
import { cn } from "@/lib/utils";

type IntroVideoUploadModalProps = {
  open: boolean;
  onClose: () => void;
};

const ACCEPT_MIME = "video/mp4,video/quicktime,video/webm,video/x-m4v";
const MAX_BYTES = 80 * 1024 * 1024;

function formatDurationFromSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const totalSeconds = Math.round(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * Premium intro-video editor opened from:
 *
 *   • Action Center → "Upload Introduction Video"
 *   • Quick Actions → "Intro Video"
 *
 * Two ways to set the video:
 *
 *   1. Upload from device — `multipart/form-data` POST to
 *      `/api/intro-video/upload`. Accepts MP4, MOV, WebM up to 80 MB.
 *      Auto-detects duration via a hidden `<video>` probe and pre-fills
 *      the duration label.
 *
 * Save persists `{ url, durationLabel }` via the advisor settings store.
 */
export function IntroVideoUploadModal({ open, onClose }: IntroVideoUploadModalProps) {
  const { settings, updateSettings, saving } = useAdvisorSettings();
  const { introVideoMaxSeconds, introVideoEnabled, introVideoHeroPlacement, planId } = usePlanLimits();
  const current = getEffectiveIntroVideo(settings);

  // Draft form state — only committed when the user clicks Save.
  const [url, setUrl] = useState(current.url);
  const [durationLabel, setDurationLabel] = useState(current.durationLabel);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const probeVideoRef = useRef<HTMLVideoElement>(null);

  // Re-sync the draft whenever the modal opens — so reopening after
  // an external change shows the current persisted values.
  useEffect(() => {
    if (!open) return;
    setUrl(current.url);
    setDurationLabel(current.durationLabel);
    setUploadError(null);
    setSaved(false);
    // Intentionally NOT depending on `current.*` — we only re-sync at the
    // moment the modal opens, not on every settings change while it's
    // already on screen (would clobber the user's in-progress edits).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFile = async (file: File) => {
    setUploadError(null);

    if (!ACCEPT_MIME.split(",").includes(file.type)) {
      setUploadError("Please choose an MP4, MOV, or WebM video file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError("Video must be 80 MB or smaller.");
      return;
    }

    const probeUrl = URL.createObjectURL(file);
    const durationSeconds = await new Promise<number>((resolve) => {
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.onloadedmetadata = () => {
        const dur = Number.isFinite(probe.duration) ? probe.duration : 0;
        URL.revokeObjectURL(probeUrl);
        resolve(dur);
      };
      probe.onerror = () => {
        URL.revokeObjectURL(probeUrl);
        resolve(0);
      };
      probe.src = probeUrl;
    });

    if (durationSeconds > introVideoMaxSeconds) {
      setUploadError(
        `Your ${planId.charAt(0).toUpperCase()}${planId.slice(1)} plan allows intro videos up to ${introVideoMaxSeconds} seconds. Upgrade for a longer video.`,
      );
      return;
    }

    setUploading(true);
    try {
      // Step 1: get a signed upload URL from the server (no file body — bypasses Next.js size limit)
      const urlRes = await fetch("/api/intro-video/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ contentType: file.type }),
      });
      const urlText = await urlRes.text();
      let urlJson: { signedUrl?: string; publicUrl?: string; error?: string };
      try {
        urlJson = JSON.parse(urlText) as typeof urlJson;
      } catch {
        throw new Error("Server error — please try again.");
      }
      if (!urlRes.ok || !urlJson.signedUrl || !urlJson.publicUrl) {
        throw new Error(urlJson.error ?? "Could not start upload.");
      }

      // Step 2: upload the file directly to Supabase Storage (no Next.js body limit)
      const uploadRes = await fetch(urlJson.signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) {
        throw new Error("Upload to storage failed — please try again.");
      }

      setUrl(urlJson.publicUrl);
      const label = formatDurationFromSeconds(durationSeconds);
      if (label) setDurationLabel(label);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    setUploadError(null);
    const trimmedUrl = url.trim();
    const trimmedDuration = durationLabel.trim();

    if (trimmedUrl) {
      if (!isHostedIntroVideoUrl(trimmedUrl)) {
        setUploadError("Please upload a video file — external URLs are not supported.");
        return;
      }
      const durationSeconds = parseDurationLabelToSeconds(trimmedDuration);
      if (durationSeconds === null) {
        setUploadError("Please set the video duration (e.g. 0:30) so we can verify your plan limit.");
        return;
      }
      if (durationSeconds > introVideoMaxSeconds) {
        setUploadError(
          `Your ${planId.charAt(0).toUpperCase()}${planId.slice(1)} plan allows intro videos up to ${introVideoMaxSeconds} seconds. Upgrade for a longer video.`,
        );
        return;
      }
    }

    updateSettings({
      introVideo: {
        url: trimmedUrl,
        posterUrl: "",
        durationLabel: trimmedDuration,
      },
    });
    setSaved(true);
    window.setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  const performRemove = () => {
    setUrl("");
    setDurationLabel("");
    updateSettings({
      introVideo: { url: "", posterUrl: "", durationLabel: "" },
    });
  };

  if (!open) return null;

  const hasDraftUrl = url.trim().length > 0;
  const hasChanges =
    url.trim() !== current.url || durationLabel.trim() !== current.durationLabel;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-video-modal-title"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" />

      {/* Sheet (mobile) / Modal (desktop) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-lg",
          "glass-strong border border-white/12 shadow-2xl shadow-black/40",
          "rounded-t-3xl sm:rounded-3xl",
          "max-h-[92dvh] overflow-y-auto",
          "animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in duration-300",
        )}
      >
        {/* Drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <span className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 sm:px-6 pt-3 sm:pt-5 pb-3 border-b border-white/8 bg-background/85 backdrop-blur-xl rounded-t-3xl">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <VideoIcon className="size-3" aria-hidden />
              Introduction video
            </p>
            <h2
              id="intro-video-modal-title"
              className="mt-1 text-base sm:text-lg font-bold tracking-tight"
            >
              {current.url ? "Update your intro video" : "Add your intro video"}
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">
              {introVideoHeroPlacement
                ? "Gold profiles show your video prominently in the hero — up to 2 minutes."
                : "Silver profiles can add a short intro (up to 30 seconds) in the trust strip."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-9 shrink-0 inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] hover:bg-white/[0.08] transition active:scale-95"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="p-5 sm:p-6 space-y-5">
          {!introVideoEnabled ? (
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6 text-center space-y-3">
              <VideoIcon className="size-10 mx-auto text-[oklch(0.85_0.16_78)]" />
              <h3 className="text-base font-bold">Intro video is a Silver feature</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Upgrade to Silver for a short intro video (up to 30 seconds), or Gold for a hero
                placement and up to 2 minutes.
              </p>
              <Button type="button" className="rounded-full" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
          {/* Current preview */}
          {hasDraftUrl && (
            <section className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                Preview
              </p>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black aspect-video">
                <video
                  key={url}
                  className="absolute inset-0 size-full object-contain"
                  src={url}
                  controls
                  playsInline
                />
              </div>
              <button
                type="button"
                onClick={() => setConfirmRemoveOpen(true)}
                disabled={saving}
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-semibold",
                  // Use the theme token so the destructive accent flips
                  // correctly across signature-dark / warm-ivory / clean-white.
                  "text-destructive hover:opacity-80 transition",
                )}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Remove current intro video
              </button>
            </section>
          )}

          {/* Upload */}
          <section className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Upload from device
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_MIME}
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = ""; // allow re-selecting same file
              }}
            />
            <button
              type="button"
              onClick={handlePickFile}
              disabled={uploading || saving}
              className={cn(
                "group w-full flex items-center gap-3 rounded-2xl p-4",
                "border border-dashed border-white/15 bg-white/[0.03]",
                "transition-all duration-200 ease-out",
                "hover:border-primary/40 hover:bg-primary/[0.05]",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "active:scale-[0.99]",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-11 shrink-0 items-center justify-center rounded-xl",
                  "bg-gradient-to-br from-primary/22 via-primary/10 to-transparent",
                  "ring-1 ring-primary/35 text-primary",
                )}
              >
                {uploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Upload className="size-5" />
                )}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold text-foreground">
                  {uploading ? "Uploading…" : "Choose a video file"}
                </span>
                <span className="block text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  MP4, MOV or WebM — up to 80&nbsp;MB, max {introVideoMaxSeconds}s on your plan.
                </span>
              </span>
            </button>

            {uploadError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-destructive/35 bg-destructive/10 p-2.5 text-[12px] text-destructive"
              >
                <AlertCircle className="size-3.5 shrink-0 mt-0.5" aria-hidden />
                <p className="leading-snug">{uploadError}</p>
              </div>
            )}
          </section>

          {/* Duration (auto-filled after upload) */}
          <section className="space-y-2">
            <label
              htmlFor="intro-video-duration"
              className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium"
            >
              Duration
            </label>
            <input
              id="intro-video-duration"
              type="text"
              value={durationLabel}
              onChange={(e) => setDurationLabel(e.target.value)}
              placeholder="0:30"
              className={cn(
                "w-28 rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5",
                "text-sm text-foreground tabular-nums placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40",
                "transition",
              )}
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-[10px] text-muted-foreground leading-snug">
              Filled automatically after upload. Adjust only if the detected length is wrong.
            </p>
          </section>
            </>
          )}
        </div>

        {/* Footer */}
        {introVideoEnabled ? (
        <footer className="sticky bottom-0 z-10 flex items-center justify-end gap-2 px-5 sm:px-6 py-3 border-t border-white/8 bg-background/85 backdrop-blur-xl rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            disabled={saving || uploading}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold",
              "text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition",
              "disabled:opacity-60",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading || !hasChanges}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold",
              "bg-primary text-primary-foreground shadow-md shadow-primary/30",
              "transition active:scale-[0.98]",
              "hover:bg-primary/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="size-3.5" />
                Saved
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                Save intro video
              </>
            )}
          </button>
        </footer>
        ) : null}

        {/* Hidden probe video — used to auto-detect uploaded clip duration */}
        <video ref={probeVideoRef} hidden muted preload="metadata" />
      </div>

      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={setConfirmRemoveOpen}
        title="Remove intro video?"
        description="Your introduction video will be cleared from the public profile immediately. You can always upload a new one later."
        confirmLabel="Remove video"
        tone="destructive"
        onConfirm={performRemove}
      />
    </div>
  );
}

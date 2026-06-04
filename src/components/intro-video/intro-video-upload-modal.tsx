"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Link2,
  Loader2,
  Play,
  Trash2,
  Upload,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { getEffectiveIntroVideo } from "@/lib/intro-video";
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
 *   2. Paste a URL — for direct MP4 / WebM links the advisor already
 *      hosts somewhere. (YouTube/Vimeo page URLs are NOT supported by
 *      the underlying `<video>` tag — the modal warns about this.)
 *
 * Save persists `{ url, posterUrl, durationLabel }` via the advisor
 * settings store. Removal clears those fields and immediately hides the
 * intro video everywhere on the public profile.
 */
export function IntroVideoUploadModal({ open, onClose }: IntroVideoUploadModalProps) {
  const { settings, updateSettings, saving } = useAdvisorSettings();
  const current = getEffectiveIntroVideo(settings);

  // Draft form state — only committed when the user clicks Save.
  const [url, setUrl] = useState(current.url);
  const [posterUrl, setPosterUrl] = useState(current.posterUrl);
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
    setPosterUrl(current.posterUrl);
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

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/intro-video/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Upload failed");
      }
      setUrl(json.url);

      // Best-effort duration probe — pre-fill the duration label so the
      // advisor doesn't have to type it.
      const probeUrl = URL.createObjectURL(file);
      const probe = probeVideoRef.current;
      if (probe) {
        probe.src = probeUrl;
        probe.onloadedmetadata = () => {
          const label = formatDurationFromSeconds(probe.duration);
          if (label) setDurationLabel(label);
          URL.revokeObjectURL(probeUrl);
        };
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    updateSettings({
      introVideo: {
        url: url.trim(),
        posterUrl: posterUrl.trim(),
        durationLabel: durationLabel.trim(),
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
    setPosterUrl("");
    setDurationLabel("");
    updateSettings({
      introVideo: { url: "", posterUrl: "", durationLabel: "" },
    });
  };

  if (!open) return null;

  const hasDraftUrl = url.trim().length > 0;
  const hasChanges =
    url.trim() !== current.url ||
    posterUrl.trim() !== current.posterUrl ||
    durationLabel.trim() !== current.durationLabel;

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
              A short personal video boosts trust before the first call.
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
                  poster={posterUrl || undefined}
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
                  MP4, MOV or WebM — up to 80&nbsp;MB. We recommend 30–60 seconds.
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

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" aria-hidden />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-white/10" aria-hidden />
          </div>

          {/* URL paste */}
          <section className="space-y-2">
            <label
              htmlFor="intro-video-url"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium"
            >
              <Link2 className="size-3" aria-hidden />
              Paste a video URL
            </label>
            <input
              id="intro-video-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yoursite.com/intro.mp4"
              className={cn(
                "w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5",
                "text-sm text-foreground placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40",
                "transition",
              )}
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-[10px] text-muted-foreground leading-snug">
              Direct video links only (MP4 / WebM). YouTube and Vimeo page URLs won&apos;t play
              inline — upload the file instead.
            </p>
          </section>

          {/* Optional poster + duration */}
          <section className="grid sm:grid-cols-[1fr_auto] gap-3">
            <div className="space-y-2 min-w-0">
              <label
                htmlFor="intro-video-poster"
                className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium"
              >
                Poster image (optional)
              </label>
              <input
                id="intro-video-poster"
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://… .jpg"
                className={cn(
                  "w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5",
                  "text-sm text-foreground placeholder:text-muted-foreground/60",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40",
                  "transition",
                )}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="space-y-2">
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
                placeholder="2:30"
                className={cn(
                  "w-24 rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5",
                  "text-sm text-foreground tabular-nums placeholder:text-muted-foreground/60",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40",
                  "transition",
                )}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </section>
        </div>

        {/* Footer */}
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

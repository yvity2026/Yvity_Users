"use client";

import { useEffect, useState } from "react";
import { Check, Copy, MessageCircle, Share2, X } from "lucide-react";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { testimonialShareCopy } from "@/lib/testimonials/social-metadata";
import { useTestimonialSubmit } from "@/lib/testimonial-submit-store";
import {
  buildTestimonialSubmitSharePayload,
  canUseNativeShare,
  invokeNativeShare,
} from "@/lib/social/native-share-payload";
import { testimonialSubmitShareDescription } from "@/lib/social/share-copy";
import {
  buildWhatsAppTestimonialShareMessage,
  getTestimonialSubmitUrl,
  whatsAppShareTextUrl,
} from "@/lib/testimonials/submit-utils";
import { Button } from "@/components/ui/button";
import { YvityLogo } from "@/components/brand/yvity-logo";
import { cn } from "@/lib/utils";

export function RequestTestimonialModal() {
  const { requestOpen, closeRequestTestimonial } = useTestimonialSubmit();
  const advisorProfile = useAdvisorDisplayProfile();
  const [link, setLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && requestOpen && advisorProfile.slug.trim()) {
      setLink(getTestimonialSubmitUrl(window.location.origin, advisorProfile.slug));
    }
  }, [requestOpen, advisorProfile.slug]);

  useEffect(() => {
    if (requestOpen) {
      setNativeShareAvailable(canUseNativeShare());
    }
  }, [requestOpen]);

  useEffect(() => {
    if (!requestOpen) {
      const t = window.setTimeout(() => {
        setError(null);
        setLinkCopied(false);
      }, 300);
      return () => window.clearTimeout(t);
    }
  }, [requestOpen]);

  if (!requestOpen) return null;

  const shareMessage = link
    ? buildWhatsAppTestimonialShareMessage(link, {
        name: advisorProfile.name,
        title: advisorProfile.title,
      })
    : "";

  const copyLink = async () => {
    setError(null);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      setError("Could not copy link. Please copy manually.");
    }
  };

  const sendWhatsApp = () => {
    setError(null);
    if (!link) return;
    window.open(whatsAppShareTextUrl(shareMessage), "_blank", "noopener,noreferrer");
  };

  const shareNative = async () => {
    setError(null);
    if (!link) return;
    try {
      await invokeNativeShare(
        buildTestimonialSubmitSharePayload({
          name: advisorProfile.name,
          designation: advisorProfile.title,
          url: link,
        }),
      );
    } catch {
      setError("Could not open the share sheet. Try WhatsApp or copy the link.");
    }
  };

  const initials = advisorProfile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-testimonial-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={closeRequestTestimonial}
        aria-label="Close"
      />

      <div className="relative z-10 w-full sm:max-w-md glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-white/10">
          <div>
            <h2 id="request-testimonial-title" className="text-lg font-bold tracking-tight">
              Request Testimonial
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Share your link — customers submit on your public profile
            </p>
          </div>
          <button
            type="button"
            onClick={closeRequestTestimonial}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Social preview hint */}
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-white/12",
              "bg-gradient-to-br from-[oklch(0.28_0.055_232)] to-[oklch(0.22_0.04_232)]",
            )}
          >
            <div className="h-1.5 bg-gradient-to-r from-primary via-[oklch(0.82_0.13_205)] to-[oklch(0.82_0.16_162)]" />
            <div className="p-4 flex gap-3">
              <div
                className={cn(
                  "size-14 shrink-0 rounded-xl flex items-center justify-center text-lg font-bold",
                  "bg-gradient-to-br from-primary to-accent text-primary-foreground",
                )}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <YvityLogo
                  size={20}
                  showWordmark
                  wordmarkClassName="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.82_0.13_205)]"
                  className="gap-1.5"
                />
                <p className="text-sm font-semibold text-foreground leading-tight mt-0.5">
                  {testimonialShareCopy.ogTitle}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {testimonialSubmitShareDescription(advisorProfile.name, advisorProfile.title)}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-center text-muted-foreground break-all px-1 font-mono leading-relaxed">
            {link || "…"}
          </p>

          <div className="grid gap-3">
            <Button
              type="button"
              className={cn(
                "h-12 w-full rounded-2xl text-base font-semibold gap-2",
                "bg-[oklch(0.52_0.14_155)] hover:bg-[oklch(0.56_0.15_155)] text-white",
                "shadow-lg shadow-[oklch(0.52_0.14_155/0.35)]",
              )}
              onClick={sendWhatsApp}
              disabled={!link}
            >
              <MessageCircle className="size-5" />
              Send WhatsApp
            </Button>

            {nativeShareAvailable ? (
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-2xl text-base font-semibold gap-2 border-white/15 bg-white/[0.04]"
                onClick={() => void shareNative()}
                disabled={!link}
              >
                <Share2 className="size-5" />
                Share Link
              </Button>
            ) : null}

            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-2xl text-base font-semibold gap-2 border-white/15 bg-white/[0.04]"
              onClick={() => void copyLink()}
              disabled={!link}
            >
              {linkCopied ? (
                <>
                  <Check className="size-5 text-[oklch(0.82_0.16_162)]" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="size-5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
            <Share2 className="size-3" />
            Rich preview on WhatsApp, Telegram, Facebook & LinkedIn
          </p>

          {error && (
            <p className="text-sm text-destructive text-center" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

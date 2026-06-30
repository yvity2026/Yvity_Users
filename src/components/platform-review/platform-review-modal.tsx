"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillName?: string;
  respondentType?: "advisor" | "customer";
};

export function PlatformReviewModal({
  open,
  onClose,
  onSuccess,
  prefillName = "",
  respondentType = "customer",
}: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayed = hovered || rating;

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/platform-testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          rating,
          content: content.trim() || null,
          name: prefillName || null,
          respondentType,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Submission failed.");
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-white/12 glass-strong sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your YVITY experience</DialogTitle>
          <DialogDescription>
            Your honest feedback helps us build a better platform for advisors and clients.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="text-4xl">🙏</span>
            <p className="text-sm font-semibold text-foreground">Thank you for your feedback!</p>
            <p className="text-xs text-muted-foreground">
              Your review will appear after a quick verification.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-1">
            {/* Star picker */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={cn(
                      "size-9 transition-colors duration-100",
                      star <= displayed
                        ? "fill-[#F59E0B] text-[#F59E0B]"
                        : "text-white/20",
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            {/* Optional comment */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Share your experience (optional)…"
              className="w-full resize-none rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[oklch(0.82_0.13_205/0.5)]"
            />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-2.5">
              <Button
                variant="outline"
                className="flex-1 border-white/12 hover:bg-white/[0.06]"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#0A4A4A] text-[#F59E0B] hover:bg-[#0A4A4A]/90"
                onClick={() => void handleSubmit()}
                disabled={submitting || !rating}
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquareReply, Star, X } from "lucide-react";
import { advisorProfile } from "@/lib/advisor-profile";
import type { TestimonialItem } from "@/lib/sections/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AdvisorReplyModalProps = {
  item: TestimonialItem;
  mode: "create" | "edit";
  onClose: () => void;
  onSaved: (item: TestimonialItem) => void;
};

export function AdvisorReplyModal({ item, mode, onClose, onSaved }: AdvisorReplyModalProps) {
  const [text, setText] = useState(item.advisorReply?.text ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setText(item.advisorReply?.text ?? "");
    setError(null);
  }, [item]);

  const submit = async () => {
    setError(null);
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setError("Please write a reply (at least 2 characters).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/testimonials/${item.id}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = (await res.json()) as { error?: string; data?: TestimonialItem };
      if (!res.ok) {
        setError(data.error ?? "Could not save reply.");
        return;
      }
      if (data.data) onSaved(data.data);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advisor-reply-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/85 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative z-10 flex w-full max-h-[94dvh] sm:max-h-[90vh] flex-col sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 shrink-0 border-b border-white/10">
          <div>
            <h2 id="advisor-reply-title" className="text-lg font-bold tracking-tight">
              Reply to Testimonial
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {mode === "edit" ? "Update your official response" : "One reply per testimonial"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Customer testimonial
            </p>
            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i < item.rating
                      ? "fill-[oklch(0.82_0.16_78)] text-[oklch(0.82_0.16_78)]"
                      : "text-white/20",
                  )}
                />
              ))}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{item.quote}&rdquo;</p>
            <p className="mt-3 text-sm font-semibold text-foreground">— {item.name}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advisor-reply-text">Your reply</Label>
            <Textarea
              id="advisor-reply-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Thank you for your valuable feedback, ${item.name.split(" ")[0]}…`}
              rows={5}
              className="rounded-xl border-white/15 bg-white/[0.04] resize-none"
            />
            <p className="text-[10px] text-muted-foreground">
              Posted as {advisorProfile.name} on your public profile
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-white/10 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-white/15"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-full gap-2"
            onClick={() => void submit()}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <MessageSquareReply className="size-4" />
                Submit Reply
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

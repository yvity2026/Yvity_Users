"use client";

import { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { PlatformReviewModal } from "./platform-review-modal";
import { cn } from "@/lib/utils";

const NUDGE_DISMISSED_KEY = "yvity_platform_review_nudge_dismissed";
const REVIEW_DONE_KEY = "yvity_platform_review_done";
const AUTO_SHOWN_KEY = "yvity_platform_review_auto_shown";

type Props = {
  advisorName?: string;
  respondentType?: "advisor" | "customer";
  /** When true, auto-opens the review modal after 12s on first visit */
  autoTrigger?: boolean;
};

export function PlatformReviewNudge({
  advisorName = "",
  respondentType = "advisor",
  autoTrigger = false,
}: Props) {
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const nudgeDismissed = Boolean(localStorage.getItem(NUDGE_DISMISSED_KEY));
    const reviewDone = Boolean(localStorage.getItem(REVIEW_DONE_KEY));

    if (!nudgeDismissed && !reviewDone) {
      setNudgeVisible(true);
    }

    if (autoTrigger && !reviewDone) {
      const autoAlreadyShown = Boolean(localStorage.getItem(AUTO_SHOWN_KEY));
      if (!autoAlreadyShown) {
        const id = setTimeout(() => {
          localStorage.setItem(AUTO_SHOWN_KEY, "1");
          setModalOpen(true);
        }, 12_000);
        return () => clearTimeout(id);
      }
    }
  }, [autoTrigger]);

  const handleDismissNudge = () => {
    localStorage.setItem(NUDGE_DISMISSED_KEY, "1");
    setNudgeVisible(false);
  };

  const handleSuccess = () => {
    localStorage.setItem(REVIEW_DONE_KEY, "1");
    setNudgeVisible(false);
    setModalOpen(false);
  };

  return (
    <>
      {nudgeVisible && (
        <div
          className={cn(
            "relative flex items-center gap-3 rounded-xl px-4 py-3",
            "border border-[oklch(0.85_0.16_78/0.35)] bg-[oklch(0.85_0.16_78/0.07)]",
            "animate-in fade-in slide-in-from-top-1 duration-300",
          )}
        >
          <Star className="size-4 shrink-0 fill-[#F59E0B] text-[#F59E0B]" aria-hidden />
          <p className="flex-1 text-xs leading-snug text-foreground/80">
            Enjoying YVITY?{" "}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="font-semibold text-foreground underline-offset-2 hover:underline"
            >
              Rate your experience
            </button>{" "}
            — it helps us improve.
          </p>
          <button
            type="button"
            onClick={handleDismissNudge}
            className="shrink-0 rounded-md p-0.5 text-muted-foreground transition hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <PlatformReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
        prefillName={advisorName}
        respondentType={respondentType}
      />
    </>
  );
}

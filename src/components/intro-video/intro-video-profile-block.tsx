"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { IntroVideoUploadModal } from "@/components/intro-video/intro-video-upload-modal";
import { SectionCompletionGuidance } from "@/components/advisor/guidance/section-completion-guidance";
import { useProfileHealth } from "@/hooks/use-profile-health";
import { Button } from "@/components/ui/button";

/** Intro video editor + completion guidance for My Career / profile section. */
export function IntroVideoProfileBlock({ className }: { className?: string }) {
  const { isComplete, loading } = useProfileHealth();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) return null;
  const complete = isComplete("intro-video");

  return (
    <div className={className}>
      <SectionCompletionGuidance
        healthId="intro-video"
        icon={Video}
        action={
          <Button type="button" size="sm" className="rounded-xl" onClick={() => setModalOpen(true)}>
            {complete ? "Replace intro video" : "Add intro video"}
          </Button>
        }
      />
      <IntroVideoUploadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

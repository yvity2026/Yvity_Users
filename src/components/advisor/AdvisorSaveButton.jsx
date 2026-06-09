"use client";

import { useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useSavedProfiles } from "@/hooks/useSavedProfiles";

export default function AdvisorSaveButton({
  advisorId,
  advisorName = "",
  className = "",
  size = "md",
}) {
  const { isSaved, isLoading, checkSaveStatus, toggleSaveProfile } = useSavedProfiles();

  useEffect(() => {
    if (!advisorId) return;
    void checkSaveStatus(advisorId);
  }, [advisorId, checkSaveStatus]);

  if (!advisorId) return null;

  const iconSize = size === "sm" ? 16 : 18;

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;

    const wasSaved = isSaved;
    const result = await toggleSaveProfile(advisorId);

    if (!result.success) {
      toast.error(result.error || "Could not update saved profile");
      return;
    }

    toast.success(
      wasSaved
        ? `Removed ${advisorName || "profile"} from saves`
        : `Saved ${advisorName || "profile"}`,
    );
  };

  return (
    <button
      type="button"
      onClick={(event) => void handleClick(event)}
      disabled={isLoading}
      aria-label={isSaved ? "Remove from saved" : "Save profile"}
      aria-pressed={isSaved}
      className={`inline-flex items-center justify-center rounded-full border border-[#E4E2DB] bg-white/95 shadow-sm backdrop-blur-sm transition hover:shadow-md disabled:opacity-60 ${size === "sm" ? "h-8 w-8" : "h-9 w-9"} ${className}`}
    >
      <Heart
        size={iconSize}
        className={isSaved ? "fill-[#EC4899] text-[#EC4899]" : "text-[#6B7280]"}
        strokeWidth={2}
      />
    </button>
  );
}

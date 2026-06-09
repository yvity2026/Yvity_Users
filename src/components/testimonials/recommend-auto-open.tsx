"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { RecommendAdvisorModal } from "@/components/testimonials/recommend-advisor-modal";
import { useIsAdvisorWorkspacePreview } from "@/hooks/use-is-viewing-own-advisor-profile";

/** Opens Recommend Advisor on `/testimonials/recommend` links. */
export function RecommendAutoOpen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isWorkspacePreview = useIsAdvisorWorkspacePreview();
  const [open, setOpen] = useState(false);
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current || isWorkspacePreview) return;
    if (pathname === "/testimonials/recommend") {
      opened.current = true;
      setOpen(true);
    }
  }, [pathname, searchParams, isWorkspacePreview]);

  if (!open) return null;

  return <RecommendAdvisorModal open={open} onClose={() => setOpen(false)} />;
}

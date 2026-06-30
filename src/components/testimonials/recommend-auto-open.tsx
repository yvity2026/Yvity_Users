"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RecommendAdvisorModal } from "@/components/testimonials/recommend-advisor-modal";
import { useIsAdvisorWorkspacePreview } from "@/hooks/use-is-viewing-own-advisor-profile";

/** Opens Recommend Advisor on `/testimonials/recommend` links. */
export function RecommendAutoOpen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isWorkspacePreview = useIsAdvisorWorkspacePreview();
  const [open, setOpen] = useState(false);
  const opened = useRef(false);
  const advisorSlug = searchParams.get("advisor");

  useEffect(() => {
    if (opened.current || isWorkspacePreview) return;
    if (pathname === "/testimonials/recommend") {
      opened.current = true;
      setOpen(true);
    }
  }, [pathname, searchParams, isWorkspacePreview]);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    // After modal closes (cancel or "Done"), send the user to the advisor's
    // full public profile rather than leaving them on the context-less
    // /testimonials/recommend page.
    if (advisorSlug) {
      router.push(`/${advisorSlug}`);
    } else {
      router.back();
    }
  };

  return <RecommendAdvisorModal open={open} onClose={handleClose} />;
}

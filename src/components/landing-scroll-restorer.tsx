"use client";

import { useEffect } from "react";

export const LANDING_SCROLL_KEY = "yvity_landing_scroll";

/**
 * Reads the saved scroll position from sessionStorage on mount and restores it.
 * This makes "View Profile → Back" return the user to exactly where they were
 * on the landing page rather than the top.
 * Renders nothing — pure behaviour component.
 */
export function LandingScrollRestorer() {
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LANDING_SCROLL_KEY);
      if (!saved) return;
      sessionStorage.removeItem(LANDING_SCROLL_KEY);
      const y = parseInt(saved, 10);
      if (!Number.isFinite(y) || y <= 0) return;
      // rAF lets the page finish rendering before we jump
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "instant" });
      });
    } catch {
      // sessionStorage blocked (private mode etc.)
    }
  }, []);

  return null;
}

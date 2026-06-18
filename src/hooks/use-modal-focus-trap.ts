"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type UseModalFocusTrapOptions = {
  isOpen: boolean;
  panelRef: RefObject<HTMLElement | null>;
  onEscape?: () => void;
  /** Re-run initial focus when this changes (e.g. step index). */
  focusKey?: string | number;
};

export function useModalFocusTrap({
  isOpen,
  panelRef,
  onEscape,
  focusKey,
}: UseModalFocusTrapOptions) {
  const previouslyFocusedRef = useRef<Element | null>(null);
  // Keep onEscape in a ref so it never needs to be a dependency — prevents
  // the effect from re-firing (and stealing focus) on every parent re-render.
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current = document.activeElement;

    const panel = panelRef.current;
    const nodes = panel?.querySelectorAll(FOCUSABLE_SELECTOR);
    const first = nodes?.[0] as HTMLElement | undefined;
    if (first) {
      window.setTimeout(() => first.focus(), 0);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscapeRef.current?.();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const focusables = panel.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;

      const list = Array.from(focusables) as HTMLElement[];
      const firstEl = list[0];
      const lastEl = list[list.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
        }
      } else if (document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const prev = previouslyFocusedRef.current;
      if (prev && "focus" in prev && typeof prev.focus === "function") {
        prev.focus();
      }
    };
  }, [isOpen, panelRef, focusKey]); // onEscape intentionally excluded — used via ref above
}

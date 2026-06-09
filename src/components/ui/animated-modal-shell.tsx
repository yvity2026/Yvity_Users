"use client";

import type { MouseEvent, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

/** Canonical Tailwind classes for modal overlay + panel entrance animations. */
export const animatedModalOverlayClass =
  "fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 motion-reduce:animate-none";

export const animatedModalPanelClass =
  "relative z-10 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 motion-reduce:animate-none";

const backdropToneClass = {
  default: "absolute inset-0 bg-background/85 backdrop-blur-md",
  light: "absolute inset-0 bg-background/80 backdrop-blur-md",
  heavy: "absolute inset-0 bg-background/95 backdrop-blur-xl",
} as const;

export type AnimatedModalBackdropTone = keyof typeof backdropToneClass;

export type AnimatedModalShellProps = {
  children: ReactNode;
  onClose: () => void;
  panelRef?: Ref<HTMLDivElement>;
  /** e.g. `z-[120]` — appended to overlay */
  className?: string;
  backdropTone?: AnimatedModalBackdropTone;
  backdropClassName?: string;
  panelClassName?: string;
  closeDisabled?: boolean;
  closeLabel?: string;
  role?: "dialog" | "presentation";
  "aria-modal"?: boolean;
  "aria-labelledby"?: string;
  onPanelClick?: (event: MouseEvent<HTMLDivElement>) => void;
};

/**
 * Shared bottom-sheet / centered modal shell using Tailwind `animate-in`.
 * Use for app modals; auth wizards keep Framer Motion for multi-step transitions.
 */
export function AnimatedModalShell({
  children,
  onClose,
  panelRef,
  className,
  backdropTone = "default",
  backdropClassName,
  panelClassName,
  closeDisabled = false,
  closeLabel = "Close",
  role = "dialog",
  "aria-modal": ariaModal = true,
  "aria-labelledby": ariaLabelledby,
  onPanelClick,
}: AnimatedModalShellProps) {
  return (
    <div
      className={cn(animatedModalOverlayClass, className)}
      role={role}
      aria-modal={ariaModal}
      aria-labelledby={ariaLabelledby}
    >
      <button
        type="button"
        className={cn(backdropToneClass[backdropTone], backdropClassName)}
        onClick={closeDisabled ? undefined : onClose}
        disabled={closeDisabled}
        aria-label={closeLabel}
      />
      <div
        ref={panelRef}
        className={cn(animatedModalPanelClass, panelClassName)}
        onClick={(event) => {
          event.stopPropagation();
          onPanelClick?.(event);
        }}
      >
        {children}
      </div>
    </div>
  );
}

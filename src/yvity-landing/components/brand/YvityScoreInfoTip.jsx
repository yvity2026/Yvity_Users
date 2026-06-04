"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

export const YVITY_SCORE_INFO_COPY =
  "YVITY Score is a credibility rating out of 100. It reflects verified advisor identity, platform activity, professional achievements, client reviews, recommendations, and profile completeness.";

const DEFAULT_BUTTON_CLASS =
  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#0A4A4A]/12 bg-white/50 text-[#0A4A4A] backdrop-blur-sm transition hover:border-[#F59E0B]/40 hover:text-[#F59E0B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/35";

const TIP_WIDTH = 272;
const VIEWPORT_PAD = 12;
const GAP = 10;

function canHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function computeTipPosition(buttonRect, tipHeight) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(TIP_WIDTH, vw - VIEWPORT_PAD * 2);

  let left = buttonRect.left + buttonRect.width / 2 - width / 2;
  left = Math.max(VIEWPORT_PAD, Math.min(left, vw - width - VIEWPORT_PAD));

  const spaceBelow = vh - buttonRect.bottom - GAP;
  const spaceAbove = buttonRect.top - GAP;
  const placeAbove =
    spaceBelow < tipHeight + VIEWPORT_PAD && spaceAbove > spaceBelow;

  let top = placeAbove
    ? buttonRect.top - GAP - tipHeight
    : buttonRect.bottom + GAP;

  top = Math.max(VIEWPORT_PAD, Math.min(top, vh - tipHeight - VIEWPORT_PAD));

  return { top, left, width, placeAbove };
}

export function YvityScoreInfoTip({ buttonClassName = DEFAULT_BUTTON_CLASS }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: TIP_WIDTH,
    placeAbove: false,
  });

  const buttonRef = useRef(null);
  const tipRef = useRef(null);
  const leaveTimerRef = useRef(null);
  const tipId = useId();

  const close = useCallback(() => setOpen(false), []);

  const cancelScheduledClose = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    leaveTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      leaveTimerRef.current = null;
    }, 120);
  }, [cancelScheduledClose]);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    const tip = tipRef.current;
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();
    const tipHeight = tip?.offsetHeight || 120;
    setPosition(computeTipPosition(buttonRect, tipHeight));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => cancelScheduledClose();
  }, [cancelScheduledClose]);

  useLayoutEffect(() => {
    if (!open || !mounted) return undefined;
    updatePosition();
    const tip = tipRef.current;
    if (!tip) return undefined;
    const ro = new ResizeObserver(() => updatePosition());
    ro.observe(tip);
    return () => ro.disconnect();
  }, [open, mounted, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;

    const onScrollOrResize = () => updatePosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      const target = event.target;
      if (
        buttonRef.current?.contains(target) ||
        tipRef.current?.contains(target)
      ) {
        return;
      }
      close();
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const tooltip =
    open && mounted
      ? createPortal(
          <div
            id={tipId}
            ref={tipRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 9999,
            }}
            className="rounded-xl border border-[#0A4A4A]/12 bg-white px-3.5 py-3 text-left shadow-[0_12px_32px_rgba(10,74,74,0.18)] animate-in fade-in zoom-in-95 duration-150"
            onMouseEnter={cancelScheduledClose}
            onMouseLeave={() => {
              if (canHover()) scheduleClose();
            }}
          >
            <p className="font-poppins text-[10px] font-bold uppercase tracking-[0.08em] text-[#0A4A4A]">
              How YVITY Score works
            </p>
            <p className="mt-1.5 font-poppins text-[11px] leading-relaxed text-[#4B5563] sm:text-[12px]">
              {YVITY_SCORE_INFO_COPY}
            </p>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        className="relative inline-flex"
        onMouseEnter={() => {
          if (canHover()) {
            cancelScheduledClose();
            setOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (canHover()) scheduleClose();
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-label="How YVITY Score works"
          aria-expanded={open}
          aria-describedby={open ? tipId : undefined}
          onClick={() => setOpen((value) => !value)}
          className={buttonClassName}
        >
          <Info className="h-3 w-3" strokeWidth={2.1} aria-hidden />
        </button>
      </span>
      {tooltip}
    </>
  );
}

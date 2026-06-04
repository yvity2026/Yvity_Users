"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { SETUP_PROFILE_STEPS } from "@/lib/advisor/setupOnboardingTaxonomy";

export const fieldClass =
  "setup-profile-field w-full rounded-xl border border-[#E4E2DB]/90 bg-gradient-to-b from-white to-[#FAF9F4] px-3.5 py-3 font-poppins text-sm text-[#0A4A4A] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-[border-color,box-shadow,transform] duration-300 placeholder:text-[#9CA3AF] focus:border-[#0A4A4A]/35 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.22)]";

export const selectClass = `${fieldClass} cursor-pointer appearance-none`;

export const labelClass =
  "mb-1.5 block font-poppins text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0A4A4A]/70";

const stepVariants = {
  enter: { opacity: 0, x: 28 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
};

export function SetupProfileLuxuryModal({
  isOpen,
  onClose,
  stepIndex,
  totalSteps,
  title,
  subtitle,
  onBack,
  children,
  footer,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0A1F1F]/55 backdrop-blur-[6px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="setup-profile-title"
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="setup-profile-modal relative flex max-h-[min(92dvh,820px)] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[28px] shadow-[0_24px_80px_rgba(10,74,74,0.35),0_0_0_1px_rgba(245,158,11,0.12)] sm:rounded-[28px]"
          >
            <div className="setup-profile-modal-header relative shrink-0 overflow-hidden px-6 pb-5 pt-6 text-white sm:px-7">
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0A4A4A] via-[#0D5C5C] to-[#083838]"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#F59E0B]/20 blur-2xl"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute -bottom-6 left-1/3 h-24 w-40 rounded-full bg-[#5EEAD4]/10 blur-2xl"
                aria-hidden
              />

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {stepIndex > 0 ? (
                    <button
                      type="button"
                      onClick={onBack}
                      className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-poppins text-[11px] font-semibold text-white/90 transition hover:bg-white/20"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>
                  ) : null}
                  <BrandMark
                    logoSize={36}
                    showName
                    showTagline={false}
                    logoClassName="h-9 w-9 object-contain"
                    nameClassName="font-cormorant text-lg font-bold text-white"
                  />
                  <p className="mt-2 font-poppins text-[10px] font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
                    Setup My Space
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative z-10 mt-4">
                <SetupStepPills stepIndex={stepIndex} />
              </div>

              <div className="relative z-10 mt-5">
                <h2
                  id="setup-profile-title"
                  className="font-cormorant text-[1.65rem] font-bold leading-tight sm:text-[1.85rem]"
                >
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-1.5 font-poppins text-sm leading-relaxed text-white/75">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="setup-profile-modal-body min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-[#FDFCF9] to-[#F3F0E8] px-5 py-5 sm:px-6 sm:py-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={stepIndex}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>

            {footer ? (
              <div className="setup-profile-modal-footer shrink-0 border-t border-[#E4E2DB]/80 bg-white/90 px-5 py-4 backdrop-blur-md sm:px-6">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function SetupStepPills({ stepIndex }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {SETUP_PROFILE_STEPS.map((step, index) => {
        const active = index === stepIndex;
        const done = index < stepIndex;
        return (
          <span
            key={step.id}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              active
                ? "bg-gradient-to-r from-[#F59E0B] to-[#FCD34D] shadow-[0_0_12px_rgba(245,158,11,0.45)]"
                : done
                  ? "bg-[#5EEAD4]/80"
                  : "bg-white/20"
            }`}
          />
        );
      })}
    </div>
  );
}

export function SetupModalProgress({ stepIndex, totalSteps }) {
  const percent = Math.round(((stepIndex + 1) / totalSteps) * 100);

  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center justify-between font-poppins text-[11px] font-semibold text-[#64748B]">
        <span>Your progress</span>
        <span className="text-[#0A4A4A]">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#E4E2DB]/80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#0A4A4A] via-[#0D6060] to-[#F59E0B]"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function PrimaryContinueButton({
  label = "Continue",
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
}) {
  const isGold = variant === "gold";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 font-poppins text-sm font-bold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
        isGold
          ? "bg-gradient-to-r from-[#F59E0B] via-[#FFAE26] to-[#D97706] text-white shadow-[0_8px_24px_rgba(217,119,6,0.35)]"
          : "bg-gradient-to-r from-[#0A4A4A] to-[#0D6060] text-[#F59E0B] shadow-[0_8px_24px_rgba(10,74,74,0.28)]"
      }`}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
      <span className="relative z-10">
        {loading ? "Please wait..." : label}
      </span>
      {!loading ? (
        <ChevronRight size={18} className="relative z-10 shrink-0" />
      ) : null}
    </button>
  );
}

export function InfoNotice({ children }) {
  return (
    <div className="mt-4 rounded-xl border border-[#0A4A4A]/10 bg-[#F0FAFA]/80 px-4 py-3 font-poppins text-xs leading-relaxed text-[#0A4A4A]/80 backdrop-blur-sm">
      {children}
    </div>
  );
}

export function ServiceSelectChip({
  label,
  icon: Icon,
  selected = false,
  onClick,
}) {
  const shortLabel = label.replace(" Insurance", "");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative shrink-0 touch-manipulation transition-all duration-300 active:scale-[0.98] ${
        selected
          ? "border-[#0A4A4A] shadow-[0_4px_16px_rgba(10,74,74,0.12),0_0_0_1px_rgba(245,158,11,0.2)]"
          : "border-[#E4E2DB]/90 hover:border-[#0A4A4A]/25"
      } flex items-center gap-2 rounded-full border bg-white/90 px-3.5 py-2.5 sm:min-h-[88px] sm:w-full sm:flex-col sm:gap-2 sm:rounded-2xl sm:bg-gradient-to-br sm:px-3 sm:py-4 sm:text-center ${
        selected
          ? "sm:from-[#F0FAFA] sm:to-white sm:shadow-[0_8px_24px_rgba(10,74,74,0.14)]"
          : "sm:bg-white/80 sm:hover:shadow-[0_4px_16px_rgba(10,74,74,0.08)]"
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full transition-colors sm:rounded-xl ${
          selected
            ? "bg-[#0A4A4A] text-[#F59E0B]"
            : "bg-[#F8F6F1] text-[#0A4A4A] group-hover:bg-[#E8F4F4]"
        } h-8 w-8 sm:h-11 sm:w-11`}
      >
        {Icon ? <Icon size={18} strokeWidth={2} /> : null}
      </span>
      <span className="whitespace-nowrap font-poppins text-xs font-semibold text-[#0A4A4A] sm:whitespace-normal sm:text-[13px] sm:leading-tight">
        <span className="sm:hidden">{shortLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
      {selected ? (
        <span className="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-[#0A4A4A] sm:absolute sm:right-2 sm:top-2 sm:h-5 sm:w-5 sm:ml-0">
          <Check size={10} strokeWidth={3} className="sm:h-3 sm:w-3" />
        </span>
      ) : null}
    </button>
  );
}

export function LuxuryChip({ label, onRemove, badge }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0A4A4A]/15 bg-white/90 px-3 py-1.5 font-poppins text-xs font-semibold text-[#0A4A4A] shadow-[0_2px_8px_rgba(10,74,74,0.06)]">
      {label}
      {badge ? (
        <span className="rounded-full bg-[#16A34A]/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#16A34A]">
          {badge}
        </span>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="text-[#94A3B8] transition hover:text-[#0A4A4A]"
          aria-label={`Remove ${label}`}
        >
          <X size={13} />
        </button>
      ) : null}
    </span>
  );
}

export function AccordionSection({
  title,
  badge,
  expanded,
  onToggle,
  children,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E2DB]/90 bg-white/80 shadow-[0_4px_20px_rgba(10,74,74,0.06)] backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition hover:bg-[#F8F6F1]/80"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="font-poppins text-sm font-semibold text-[#0A4A4A]">
            {title}
          </span>
          {badge ? (
            <span className="shrink-0 rounded-full bg-[#16A34A]/12 px-2 py-0.5 font-poppins text-[10px] font-bold uppercase tracking-wide text-[#16A34A]">
              {badge}
            </span>
          ) : null}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.28 }}
          className="text-[#94A3B8]"
        >
          <ChevronRight size={18} className="rotate-90" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-[#E4E2DB]/80 px-4 py-4">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

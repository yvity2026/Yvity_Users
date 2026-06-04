"use client";

import { Check } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";

export const PROGRESS_STEPS = [
  "Mobile",
  "Email",
  "Profile",
  "Selfie",
  "Done",
];

export function RegistrationLogo({ className = "h-9 w-9" }) {
  return (
    <BrandMark
      logoSize={36}
      showName
      logoClassName={className}
      nameClassName="font-cormorant text-sm font-bold leading-none text-[#0A4A4A]"
    />
  );
}

export function RegistrationHeader({ title, subtitle }) {
  return (
    <div className="relative shrink-0 bg-[#0f4f4f] px-4 pb-4 pt-5 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#0A4A4A] before:via-[#F59E0B] before:to-[#0A4A4A]">
      <div className="flex items-start justify-between gap-3 pr-8">
        <div className="min-w-0 text-left text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F59E0B]">
            Join YVITY
          </p>
          <h2 className="mt-0.5 font-cormorant text-[22px] font-semibold leading-tight tracking-wide">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-[11px] leading-snug text-white/75">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 rounded-lg bg-white p-1 shadow-sm">
          <BrandMark
            logoSize={44}
            showName
            layout="stack"
            className="items-center"
            logoClassName="h-10 w-10 object-contain"
            nameClassName="font-cormorant text-[11px] font-bold leading-none text-[#0A4A4A]"
          />
        </div>
      </div>
    </div>
  );
}

export function RegistrationProgress({ activeIndex, completedThrough }) {
  return (
    <div className="relative mb-4 flex items-start justify-between px-0.5">
      <div
        className="absolute left-[10%] right-[10%] top-[13px] h-px bg-gradient-to-r from-[#0A4A4A]/10 via-[#F59E0B]/45 to-[#0A4A4A]/10"
        aria-hidden
      />
      {PROGRESS_STEPS.map((label, i) => {
        const num = i + 1;
        const done = num < activeIndex || num <= completedThrough;
        const active = num === activeIndex;
        return (
          <div
            key={label}
            className="relative z-[1] flex flex-col items-center gap-1"
          >
            <div
              className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                done
                  ? "bg-[#0A4A4A] text-[#F59E0B] shadow-sm"
                  : active
                    ? "bg-[#0A4A4A] text-[#F59E0B] ring-2 ring-[#F59E0B]/40"
                    : "border border-stone-200 bg-[#F8F6F1] text-stone-400"
              }`}
            >
              {done && !active ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                num
              )}
            </div>
            <span
              className={`max-w-[2.75rem] text-center text-[9px] font-semibold leading-tight ${
                active
                  ? "text-[#0A4A4A]"
                  : done
                    ? "text-[#0A4A4A]/80"
                    : "text-stone-400"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StepHero({ icon: Icon, title, subtitle, why }) {
  return (
    <div className="mb-4 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F59E0B]/35 bg-[#F8F6F1] text-[#0A4A4A] shadow-[0_2px_10px_rgba(245,158,11,0.12)]">
        <Icon className="h-6 w-6 text-[#0A4A4A]" strokeWidth={1.75} aria-hidden />
      </div>
      {title ? (
        <h3 className="text-[15px] font-bold text-[#0A4A4A]">{title}</h3>
      ) : null}
      {subtitle ? (
        <p className="mx-auto mt-1 max-w-[300px] text-[11px] leading-snug text-[#6B7280]">
          {subtitle}
        </p>
      ) : null}
      {why ? <StepWhy className="mx-auto mt-3 max-w-[320px] text-left">{why}</StepWhy> : null}
    </div>
  );
}

export function StepWhy({ children, title = "Why we ask", className = "" }) {
  return (
    <div
      className={`rounded-xl border border-[#F59E0B]/30 bg-[#FFFBEB] px-3 py-2.5 ${className}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#F59E0B]">
        {title}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-[#78350F]">{children}</p>
    </div>
  );
}

export function FieldHint({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1 text-[10px] leading-snug text-[#6B7280]">{children}</p>
  );
}

export function FieldLabel({ htmlFor, children, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-[11px] font-semibold text-[#374151]"
    >
      {children}
      {required ? <span className="text-[#F59E0B]"> *</span> : null}
    </label>
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-start gap-1 text-[11px] text-red-600">
      <span aria-hidden>ⓘ</span>
      <span>{message}</span>
    </p>
  );
}

const inputBase =
  "w-full rounded-xl border bg-[#F8F6F1] px-3 py-2.5 text-[13px] text-[#374151] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20";

export function TextInput({ className = "", error, ...props }) {
  return (
    <input
      className={`${inputBase} ${error ? "border-red-300" : "border-[#E6E6E6]"} ${className}`}
      {...props}
    />
  );
}

export function IconInput({ icon: Icon, error, className = "", ...props }) {
  return (
    <div
      className={`flex overflow-hidden rounded-xl border bg-[#F8F6F1] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/20 ${
        error ? "border-red-300" : "border-[#E6E6E6]"
      } ${className}`}
    >
      <span className="flex items-center pl-3 text-[#0A4A4A]/55">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <input
        className="min-h-[42px] flex-1 bg-transparent px-2 py-2 text-[13px] text-[#374151] outline-none placeholder:text-[#9CA3AF]"
        {...props}
      />
    </div>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
  variant = "teal",
}) {
  const styles =
    variant === "amber"
      ? "bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#EA580C] text-white shadow-amber-900/15"
      : "bg-[#0A4A4A] text-[#F59E0B] shadow-teal-900/20 ring-1 ring-[#F59E0B]/35 hover:bg-[#0D6060]";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 text-[13px] font-bold shadow-md transition disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none disabled:ring-0 ${styles}`}
    >
      {children}
    </button>
  );
}

export function LinkButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`text-[11px] font-semibold text-[#F59E0B] underline-offset-2 transition hover:text-[#D97706] hover:underline disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function OtpInputs({
  digits,
  onChange,
  onKeyDown,
  onPaste,
  inputRefs,
  idPrefix,
  hint,
}) {
  return (
    <>
      <p
        id={`${idPrefix}-hint`}
        className="mb-2 text-center text-[11px] font-semibold text-[#0f4f4f]"
      >
        {hint}
      </p>
      <div
        className="flex justify-center gap-1.5 sm:gap-2"
        role="group"
        aria-labelledby={`${idPrefix}-hint`}
      >
        {digits.map((digit, idx) => (
          <input
            key={`${idPrefix}-${idx}`}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={1}
            aria-label={`Digit ${idx + 1} of 6`}
            className="h-10 w-9 rounded-[10px] border-2 bg-[#F8F6F1] text-center text-sm font-bold text-[#374151] outline-none transition focus:border-[#F49F0F] focus:ring-1 focus:ring-[#F49F0F] sm:h-12 sm:w-11 sm:text-base"
            value={digit}
            onChange={(e) => onChange(idx, e.target.value)}
            onKeyDown={(e) => onKeyDown(idx, e)}
            onPaste={onPaste}
            style={{
              borderColor: digit ? "#F49F0F" : "#B7B7B7",
              boxShadow: digit
                ? "0 0 4px 2px rgba(245, 158, 11, 0.25)"
                : "none",
              background: digit ? "#FFFFFF" : "#F7F4ED",
            }}
          />
        ))}
      </div>
    </>
  );
}

export function ExistingAccountNotice({
  message,
  actionLabel = "Log in with this number",
  onLogin,
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mt-2 rounded-xl border border-[#F59E0B]/40 bg-[#FFFBEB] px-3 py-2.5"
    >
      <p className="text-[12px] leading-snug text-[#78350F]">{message}</p>
      {onLogin ? (
        <button
          type="button"
          onClick={onLogin}
          className="mt-2 text-[12px] font-semibold text-[#0A4A4A] underline-offset-2 hover:text-[#F59E0B] hover:underline"
        >
          {actionLabel} →
        </button>
      ) : null}
    </div>
  );
}

export function ComplianceFooter() {
  return (
    <p className="mt-3 shrink-0 text-center text-[10px] leading-snug text-[#9CA3AF]">
      Your data is encrypted and never sold. IRDAI compliant · Secure · For your
      protection
    </p>
  );
}

"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectionCardProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  idleClassName?: string;
  leading?: ReactNode;
};

export function SelectionCard({
  label,
  selected,
  onClick,
  disabled,
  className,
  activeClassName,
  idleClassName,
  leading,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative w-full text-left rounded-xl border px-3 py-3 min-h-[48px]",
        "text-sm font-medium transition-all duration-200",
        "active:scale-[0.98]",
        selected
          ? cn(
              "border-primary bg-primary/20 text-foreground shadow-md shadow-primary/25 ring-2 ring-primary/40",
              activeClassName,
            )
          : cn(
              "border-white/12 bg-white/[0.03] text-foreground/90 hover:bg-white/[0.06] hover:border-white/20",
              idleClassName,
            ),
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <span className="flex items-center gap-2 pr-6">
        {leading}
        <span className="leading-snug">{label}</span>
      </span>
      {selected && (
        <span
          className={cn(
            "absolute top-2 right-2 inline-flex size-5 items-center justify-center",
            "rounded-full bg-primary text-primary-foreground shadow-sm",
          )}
        >
          <Check className="size-3 stroke-[3]" />
        </span>
      )}
    </button>
  );
}

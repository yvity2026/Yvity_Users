"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * Settings group card. On `md+` it renders as the original card with the
 * header always above the rows. On mobile (`max-md`) the header acts as a
 * Career-style accordion trigger: tap to expand/collapse the toggles
 * underneath, with a smooth grid-rows transition.
 */
export function SettingsGroup({
  title,
  description,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  /** Start expanded on mobile (default `false`). Ignored on desktop. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "md:hidden flex items-start gap-3 w-full px-4 py-4 text-left",
          "transition-all duration-200 ease-out motion-reduce:transition-none",
          "hover:bg-white/[0.03] active:bg-white/[0.06] active:scale-[0.995]",
        )}
        aria-expanded={open}
      >
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold tracking-tight">{title}</span>
          {description && (
            <span className="mt-1 block text-xs text-muted-foreground leading-relaxed">
              {description}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 mt-2.5 text-[oklch(0.82_0.13_205)] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <div className="hidden md:flex px-4 md:px-5 py-4 border-b border-white/10 bg-white/[0.02] items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          "md:!grid-rows-[1fr]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-white/10 px-4 md:px-5 max-md:border-t max-md:border-white/10">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SettingsToggleRow({
  label,
  description,
  disabledHint,
  checked,
  disabled,
  onCheckedChange,
  emphasis,
}: {
  label: string;
  description?: string;
  /** Short note shown below description when the row is disabled, explaining why. */
  disabledHint?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  emphasis?: "warning";
}) {
  return (
    <div
      className={cn(
        "relative flex items-start justify-between gap-4 py-4",
        // When the master toggle is off, emphasise the row so the
        // affected setting is impossible to miss. 6% tint was too
        // quiet — bumped to 12% + a left accent bar.
        emphasis === "warning" &&
          !checked &&
          cn(
            "bg-[oklch(0.85_0.16_78/0.12)] -mx-4 md:-mx-5 px-4 md:px-5",
            "before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px]",
            "before:rounded-r-full before:bg-[oklch(0.85_0.16_78)] before:content-['']",
          ),
      )}
    >
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-sm font-medium leading-snug">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
        )}
        {disabled && disabledHint && (
          <p className="mt-1 text-[11px] text-[oklch(0.85_0.16_78/0.8)] leading-snug">
            {disabledHint}
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="mt-0.5 data-[state=checked]:bg-primary"
        aria-label={label}
      />
    </div>
  );
}

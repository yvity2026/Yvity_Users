"use client";

import { useId, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

/**
 * Mobile-only accordion shell. Mirrors the visuals, spacing and animation of
 * the Career sections accordion ({@link CareerSectionsAccordion}) so the rest
 * of the platform uses the same expand/collapse pattern on phones.
 *
 * On `md` and up the children are rendered as-is, so desktop layouts are
 * untouched.
 */

export type MobileAccordionSection = {
  id: string;
  /** Trigger header content (icon + title) — kept compact for tap targets. */
  trigger: ReactNode;
  /** Section body. Rendered lazily on mobile (only when expanded). */
  content: ReactNode;
};

export const mobileAccordionCardClass =
  "glass-strong rounded-2xl border border-white/10 overflow-hidden";

export const mobileAccordionTriggerClass = cn(
  "group gap-3 px-4 py-4",
  "hover:no-underline hover:bg-white/[0.03]",
  "active:bg-white/[0.06]",
  "transition-all duration-200 ease-out motion-reduce:transition-none",
  "[&>svg]:ml-2 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-[oklch(0.82_0.13_205)]",
  "[&>svg]:transition-transform [&>svg]:duration-300",
);

export const mobileAccordionContentClass = "px-4 pb-5";

/**
 * Renders `sections` as a vertical accordion on mobile and as the supplied
 * `desktop` content on `md+`. The desktop slot lets callers preserve their
 * existing layout (tabs, grids, etc.) without duplicating heavy components.
 *
 * Defaults to `multiple` so users can keep several sections open at once.
 * Pass `mode="single"` to opt into the single-open Radix behaviour.
 */
export function MobileAccordionShell({
  sections,
  desktop,
  defaultOpen,
  className,
  mode = "multiple",
}: {
  sections: MobileAccordionSection[];
  /** Markup that should render on `md` and up (the existing desktop layout). */
  desktop: ReactNode;
  /** Section id(s) to expand initially. Pass an array in `multiple` mode. */
  defaultOpen?: string | string[];
  className?: string;
  /** "multiple" (default) lets all sections stay open independently. */
  mode?: "multiple" | "single";
}) {
  const generatedId = useId();
  const accordionId = `mobile-accordion-${generatedId}`;

  const accordionProps =
    mode === "single"
      ? {
          type: "single" as const,
          collapsible: true,
          defaultValue: typeof defaultOpen === "string" ? defaultOpen : undefined,
        }
      : {
          type: "multiple" as const,
          defaultValue: Array.isArray(defaultOpen)
            ? defaultOpen
            : defaultOpen
              ? [defaultOpen]
              : undefined,
        };

  return (
    <>
      <div className={cn("hidden md:block", className)}>{desktop}</div>

      <Accordion
        id={accordionId}
        {...accordionProps}
        className={cn("md:hidden space-y-3", className)}
      >
        {sections.map((section) => (
          <AccordionItem key={section.id} value={section.id} className={mobileAccordionCardClass}>
            <AccordionTrigger className={mobileAccordionTriggerClass}>
              {section.trigger}
            </AccordionTrigger>
            <AccordionContent className={mobileAccordionContentClass}>
              {section.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}

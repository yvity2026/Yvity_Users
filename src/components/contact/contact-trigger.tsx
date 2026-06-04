"use client";

import type { ComponentProps } from "react";
import { useContact } from "@/lib/contact-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContactTriggerProps = ComponentProps<typeof Button>;

/** Opens the global contact sheet. Also works via `data-open-contact` on any element. */
export function ContactTrigger({ className, onClick, children, ...props }: ContactTriggerProps) {
  const { openContact } = useContact();

  return (
    <Button
      type="button"
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) openContact();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

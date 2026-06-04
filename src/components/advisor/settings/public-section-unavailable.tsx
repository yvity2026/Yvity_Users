"use client";

import { EyeOff } from "lucide-react";

export function PublicSectionUnavailable({
  title = "Section unavailable",
  description = "This section is not visible on the public profile right now.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="glass-strong rounded-3xl border border-dashed border-white/15 p-10 md:p-14 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground mb-4">
        <EyeOff className="size-7" />
      </span>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}

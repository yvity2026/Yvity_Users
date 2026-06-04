"use client";

import { BadgeCheck, FileText, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const trustSignals = [
  { icon: BadgeCheck, label: "100% Verified" },
  { icon: FileText, label: "Authentic Records" },
  { icon: Globe, label: "Recognised Globally" },
] as const;

export function AchievementsVerificationFooter({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "glass-strong rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-6 md:p-8",
        "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8",
        className,
      )}
    >
      <div className="flex gap-4 min-w-0">
        <span className="inline-flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl glass ring-glow-cyan">
          <Shield className="size-6 text-[oklch(0.82_0.13_205)]" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            All achievements are 100% Verified
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            Every award listed is verified through official records and recognised sources to ensure
            authenticity.
          </p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-4 sm:gap-6 lg:shrink-0">
        {trustSignals.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
          >
            <Icon className="size-4 text-[oklch(0.82_0.13_205)]" />
            <span className="font-medium text-foreground/90">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

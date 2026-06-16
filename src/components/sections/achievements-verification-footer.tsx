"use client";

import { BadgeCheck, FileText, Globe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const verifiedTrustSignals = [
  { icon: BadgeCheck, label: "YVITY Verified" },
  { icon: FileText, label: "Authentic Records" },
  { icon: Globe, label: "Recognised Globally" },
] as const;

export function AchievementsVerificationFooter({
  verifiedCount = 0,
  className,
}: {
  verifiedCount?: number;
  className?: string;
}) {
  const hasVerified = verifiedCount > 0;

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
            {hasVerified
              ? `${verifiedCount} ${verifiedCount === 1 ? "achievement" : "achievements"} verified by YVITY`
              : "Submit your achievements for YVITY verification"}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            {hasVerified
              ? "Each verified award is confirmed through official records and recognised sources, stamped with a YVITY badge on your public profile."
              : "Upload supporting documents on any achievement card to request a YVITY verification badge — it adds credibility and trust for prospective clients."}
          </p>
        </div>
      </div>

      {hasVerified && (
        <ul className="flex flex-wrap gap-4 sm:gap-6 lg:shrink-0">
          {verifiedTrustSignals.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
            >
              <Icon className="size-4 text-[oklch(0.82_0.13_205)]" />
              <span className="font-medium text-foreground/90">{label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

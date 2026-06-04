import { BadgeCheck, Quote } from "lucide-react";
import { advisorProfile } from "@/lib/advisor-profile";
import type { TestimonialAdvisorReply } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

export function TestimonialAdvisorResponse({
  reply,
  className,
}: {
  reply: TestimonialAdvisorReply;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-4 rounded-xl border border-[oklch(0.82_0.16_78/0.28)]",
        "bg-gradient-to-br from-[oklch(0.82_0.16_78/0.1)] to-[oklch(0.82_0.13_205/0.08)]",
        "p-3.5 sm:p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[oklch(0.82_0.16_78/0.2)] ring-1 ring-[oklch(0.82_0.16_78/0.35)]">
          <BadgeCheck className="size-4 text-[oklch(0.88_0.14_78)]" />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.88_0.14_78)]">
            Advisor Response
          </p>
          <p className="text-xs font-semibold text-foreground">{advisorProfile.name}</p>
        </div>
      </div>
      <Quote className="size-4 text-[oklch(0.82_0.16_78/0.7)] mb-1.5" />
      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
        &ldquo;{reply.text}&rdquo;
      </p>
      {reply.repliedOn && (
        <p className="mt-2 text-[10px] text-muted-foreground">Replied · {reply.repliedOn}</p>
      )}
    </div>
  );
}

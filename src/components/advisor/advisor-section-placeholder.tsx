import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdvisorSectionPlaceholderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

/** Reserved shell for modules not built yet — navigation only for now. */
export function AdvisorSectionPlaceholder({
  icon: Icon,
  title,
  description,
  className,
}: AdvisorSectionPlaceholderProps) {
  return (
    <div
      className={cn(
        "glass-strong rounded-3xl border border-dashed border-white/15 p-10 md:p-14 text-center",
        "animate-in fade-in slide-in-from-bottom-2 duration-500",
        className,
      )}
    >
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/50 to-accent/40 ring-1 ring-white/15 mb-5">
        <Icon className="size-7 text-foreground" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
        Module in development
      </p>
    </div>
  );
}

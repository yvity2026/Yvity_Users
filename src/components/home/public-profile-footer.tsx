import { YvityLogo } from "@/components/brand/yvity-logo";

export function PublicProfileFooter() {
  return (
    <footer className="w-full border-t border-white/10 pt-6 sm:pt-8 pb-2">
      <div className="flex flex-col items-center gap-3">
        <YvityLogo
          size={28}
          showTagline
          taglineClassName="text-[9px] text-muted-foreground"
          wordmarkClassName="text-xs text-foreground/80"
        />
        <p className="text-center text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          Connecting people with trusted advisors.
        </p>
      </div>
    </footer>
  );
}

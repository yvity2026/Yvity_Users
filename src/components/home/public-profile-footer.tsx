import { YvityLogo } from "@/components/brand/yvity-logo";

export function PublicProfileFooter() {
  return (
    <footer className="w-full border-t border-white/10 pt-4 sm:pt-5 lg:pt-4 pb-1">
      <div className="flex flex-col items-center gap-2 sm:gap-2.5">
        {/* Ivory pill keeps the dark logo + brand name readable on any background */}
        <div className="inline-flex items-center rounded-full bg-[#f8f6f1] px-3.5 py-1.5 shadow-sm ring-1 ring-black/8">
          <YvityLogo
            size={26}
            showTagline
            taglineClassName="text-[9px] text-[#6b7280]"
            wordmarkClassName="text-xs font-bold text-[#0A4A4A]"
          />
        </div>
        <p className="text-center text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          Connecting people with trusted advisors.
        </p>
      </div>
    </footer>
  );
}

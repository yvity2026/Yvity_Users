import Image from "next/image";
import { COMPANY_LOGO_ALT, COMPANY_LOGO_PATH, COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

type YvityLogoProps = {
  className?: string;
  /** Logo mark size (width & height). */
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
  wordmarkClassName?: string;
  taglineClassName?: string;
  imageClassName?: string;
};

export function YvityLogo({
  className,
  size = 36,
  showWordmark = true,
  showTagline = false,
  wordmarkClassName,
  taglineClassName,
  imageClassName,
}: YvityLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 min-w-0", className)}>
      <Image
        src={COMPANY_LOGO_PATH}
        alt={COMPANY_LOGO_ALT}
        width={size}
        height={size}
        className={cn("shrink-0 object-contain", imageClassName)}
        style={{ width: size, height: "auto" }}
        priority
      />
      {(showWordmark || showTagline) && (
        <span className="flex min-w-0 flex-col leading-tight">
          {showWordmark && (
            <span
              className={cn(
                "font-semibold tracking-[0.18em] text-foreground truncate",
                wordmarkClassName,
              )}
            >
              {COMPANY_NAME}
            </span>
          )}
          {showTagline && (
            <span
              className={cn(
                "text-[10px] sm:text-xs text-muted-foreground tracking-wide truncate",
                taglineClassName,
              )}
            >
              {COMPANY_TAGLINE}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

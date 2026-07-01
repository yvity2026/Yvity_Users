import Image from "next/image";
import { BRAND_LOGO, BRAND_NAME, BRAND_TAGLINE } from "@/yvity-landing/lib/brand/constants";

/**
 * Shared YVITY logo + optional name/tagline.
 */
export default function BrandMark({
  logoSize = 48,
  showName = false,
  showTagline = false,
  className = "",
  logoClassName = "object-contain",
  nameClassName = "font-cormorant text-lg font-bold leading-none text-[#0A4A4A]",
  taglineClassName = "font-poppins text-[10px] font-semibold leading-tight text-[#F59E0B] sm:text-[11px]",
  layout = "row",
}) {
  const stack = layout === "stack";

  return (
    <div
      className={`flex ${stack ? "flex-col items-center gap-0.5" : "flex-row items-center gap-2"} ${className}`}
    >
      <Image
        src={BRAND_LOGO}
        alt={`${BRAND_NAME} logo`}
        width={logoSize}
        height={logoSize}
        priority
        className={logoClassName}
        style={{ width: logoSize, height: "auto" }}
      />
      {(showName || showTagline) && (
        <div className={`flex flex-col ${stack ? "items-center text-center" : "items-start"}`}>
          {showName && (
            <span className={nameClassName}>
              <span className="text-[#F59E0B]">Y</span>VITY
            </span>
          )}
          {showTagline && <span className={taglineClassName}>{BRAND_TAGLINE}</span>}
        </div>
      )}
    </div>
  );
}

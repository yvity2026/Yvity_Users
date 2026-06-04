"use client";

import LandingSectionHeader from "./LandingSectionHeader";

/**
 * Mobile-only section frame: header + body always visible (no accordion).
 * Used inside mobile section panels where navigation replaces expand/collapse.
 */
export default function LandingMobileSectionShell({
  eyebrow,
  accent,
  title,
  description,
  dark = false,
  children,
  className = "",
  bodyOnly = false,
}) {
  if (bodyOnly) {
    return <div className={`w-full lg:hidden ${className}`}>{children}</div>;
  }

  const shell = dark
    ? "border-[#0AE0E0]/25 bg-[#164848] shadow-[0_8px_28px_rgba(0,0,0,0.18)]"
    : "border-[#0D6060]/12 bg-white shadow-[0_4px_20px_rgba(10,74,74,0.07)]";

  return (
    <div className={`w-full lg:hidden ${className}`}>
      <div className={`overflow-hidden rounded-2xl border ${shell}`}>
        <div className="px-4 pt-4 sm:px-5">
          <LandingSectionHeader
            className="!gap-2"
            eyebrow={eyebrow}
            accent={accent}
            title={title}
            description={description}
            dark={dark}
          />
        </div>
        <div
          className={`border-t px-3 pb-4 pt-2 sm:px-4 ${
            dark
              ? "border-[#186E6E] bg-[#123D3D]/50"
              : "border-[#0D6060]/10 bg-[#F8F6F1]/70"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

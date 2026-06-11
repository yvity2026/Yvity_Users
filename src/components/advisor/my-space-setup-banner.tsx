"use client";

import { ArrowRight, BriefcaseBusiness, Clock } from "lucide-react";

type MySpaceSetupBannerProps = {
  variant: "setup" | "review";
  onSetup?: () => void;
};

export function MySpaceSetupBanner({ variant, onSetup }: MySpaceSetupBannerProps) {
  if (variant === "review") {
    return (
      <section
        className="mx-auto mb-4 w-full max-w-[1600px] px-4 sm:px-6 md:px-8"
        aria-live="polite"
      >
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#fcfaf6] to-[#E8F4F4] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
              <Clock className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#0A4A4A]">IRDAI license under review</p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280] sm:text-sm">
                My Space setup is complete — we received your IRDAI certificate and are verifying
                your license. This usually takes{" "}
                <span className="font-semibold text-[#0A4A4A]">24–48 hours</span>. You can keep
                building your journey, achievements, and gallery. Your YVITY Score, public profile,
                and share points unlock after admin approval.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mb-4 w-full max-w-[1600px] px-4 sm:px-6 md:px-8">
      <div className="yvity-on-dark rounded-2xl border border-[#F59E0B]/30 bg-gradient-to-br from-[#0A4A4A] via-[#0D5C5C] to-[#083838] px-4 py-4 text-white shadow-[0_8px_32px_rgba(10,74,74,0.35)] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/20 text-[#F59E0B]">
              <BriefcaseBusiness className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-cormorant text-xl font-bold sm:text-2xl">Setup My Space</p>
              <p className="mt-1 font-poppins text-xs leading-relaxed text-white/75 sm:text-sm">
                Add your insurance services and upload your IRDAI license certificate. Once verified
                by our team, your public profile goes live and your full YVITY Score is calculated.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSetup}
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-5 py-3 font-poppins text-sm font-semibold text-[#0A4A4A] transition hover:bg-[#fbbf24] active:scale-[0.98]"
          >
            Setup My Space
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

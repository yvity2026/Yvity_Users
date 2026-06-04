"use client";



import { AnimatePresence, motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/yvity-landing/hooks/usePrefersReducedMotion";



/** Bottom-centered down/up chevron for large section heading cards */

export function SectionExpandChevron({ open, dark = false, size = "md" }) {

  const dim = size === "sm" ? "h-6 w-6" : "h-7 w-7";

  const icon = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";



  return (

    <span

      className={`flex items-center justify-center rounded-full border transition-[transform,colors] duration-300 ${dim} ${

        open ? "rotate-180" : ""

      } ${

        dark

          ? "border-[#0AE0E0]/35 bg-[#195A5A]"

          : "border-[#0a4d46] bg-white"

      }`}

      aria-hidden

    >

      <svg

        className={icon}

        fill="none"

        viewBox="0 0 24 24"

        stroke={dark ? "#F59E0B" : "#0a4d46"}

        strokeWidth={2.25}

      >

        <path

          strokeLinecap="round"

          strokeLinejoin="round"

          d="M6 9l6 6 6-6"

        />

      </svg>

    </span>

  );

}



/** @deprecated Use SectionExpandChevron — kept for any legacy imports */

export function AccordionChevron({ open, size = "md" }) {

  return <SectionExpandChevron open={open} size={size} />;

}



function AccordionPanel({ isOpen, children, variant, reducedMotion }) {

  if (reducedMotion) {

    return isOpen ? (

      <div

        className={`border-t px-3 py-3 ${

          variant === "teal"

            ? "border-[#186E6E] bg-[#164848]/50"

            : "border-gray-200 bg-white/70"

        }`}

      >

        {children}

      </div>

    ) : null;

  }



  return (

    <AnimatePresence initial={false}>

      {isOpen && (

        <motion.div

          initial={{ height: 0, opacity: 0 }}

          animate={{ height: "auto", opacity: 1 }}

          exit={{ height: 0, opacity: 0 }}

          transition={{ duration: 0.28, ease: "easeInOut" }}

          className="overflow-hidden"

        >

          <div

            className={`border-t px-3 py-3 ${

              variant === "teal"

                ? "border-[#186E6E] bg-[#164848]/50"

                : "border-gray-200 bg-white/70"

            }`}

          >

            {children}

          </div>

        </motion.div>

      )}

    </AnimatePresence>

  );

}



/** Section panel (e.g. For Advisors, Free plan) — bottom expand chevron */

export function LandingSectionAccordion({

  title,

  subtitle,

  isOpen,

  onToggle,

  children,

  variant = "pearl",

}) {

  const reducedMotion = usePrefersReducedMotion();

  const shell =

    variant === "teal"

      ? "border-[#186E6E]/40 bg-[#195A5A]"

      : "border-[#0D6060]/20 bg-[#F8F6F1]";

  const titleClass =

    variant === "teal" ? "text-[#F8F6F1]" : "text-[#0A4A4A]";

  const subClass =

    variant === "teal" ? "text-[#C0C0C0]" : "text-[#6B7280]";

  const borderClass =

    variant === "teal" ? "border-[#186E6E]/50" : "border-[#0D6060]/8";



  return (

    <div className={`overflow-hidden rounded-2xl border shadow-sm ${shell}`}>

      <button

        type="button"

        onClick={onToggle}

        aria-expanded={isOpen}

        className="flex w-full flex-col text-left"

      >

        <div className="px-4 py-3.5">

          <span className="flex min-w-0 flex-col gap-0.5">

            <span

              className={`font-poppins text-[15px] font-semibold ${titleClass}`}

            >

              {title}

            </span>

            {subtitle ? (

              <span className={`font-poppins text-[12px] leading-snug ${subClass}`}>

                {subtitle}

              </span>

            ) : null}

          </span>

        </div>

        <div

          className={`flex justify-center border-t px-4 py-1.5 ${borderClass}`}

        >

          <SectionExpandChevron open={isOpen} dark={variant === "teal"} />

        </div>

      </button>

      <AccordionPanel

        isOpen={isOpen}

        variant={variant}

        reducedMotion={reducedMotion}

      >

        {children}

      </AccordionPanel>

    </div>

  );

}



/** Nested row (e.g. FAQ question) — bottom expand chevron */

export function LandingItemAccordion({

  title,

  isOpen,

  onToggle,

  children,

  meta,

}) {

  const reducedMotion = usePrefersReducedMotion();



  return (

    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

      <button

        type="button"

        onClick={onToggle}

        aria-expanded={isOpen}

        className="flex w-full flex-col text-left"

      >

        <div className="flex min-w-0 items-start gap-2 px-4 py-3">

          {meta ? (

            <span className="mt-0.5 shrink-0 font-nunito text-[11px] font-bold text-[#0a4d46]">

              {meta}

            </span>

          ) : null}

          <span className="font-nunito text-[14px] font-semibold leading-snug text-[#0A4A4A]">

            {title}

          </span>

        </div>

        <div className="flex justify-center border-t border-[#0D6060]/8 px-4 py-1.5">

          <SectionExpandChevron open={isOpen} size="sm" />

        </div>

      </button>

      {reducedMotion ? (

        isOpen ? (

          <div className="border-t border-gray-100 px-4 pb-4 pt-1 text-[13px] leading-relaxed text-[#374151]">

            {children}

          </div>

        ) : null

      ) : (

        <AnimatePresence initial={false}>

          {isOpen && (

            <motion.div

              initial={{ height: 0, opacity: 0 }}

              animate={{ height: "auto", opacity: 1 }}

              exit={{ height: 0, opacity: 0 }}

              transition={{ duration: 0.22, ease: "easeInOut" }}

              className="overflow-hidden"

            >

              <div className="border-t border-gray-100 px-4 pb-4 pt-1 text-[13px] leading-relaxed text-[#374151]">

                {children}

              </div>

            </motion.div>

          )}

        </AnimatePresence>

      )}

    </div>

  );

}


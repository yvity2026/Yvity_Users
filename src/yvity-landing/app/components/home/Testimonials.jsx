"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LandingSectionHeader from "./LandingSectionHeader";
import LandingSnapScroll, { LandingSnapItem } from "./LandingSnapScroll";
import { usePrefersReducedMotion } from "@/yvity-landing/hooks/usePrefersReducedMotion";
import {
  LANDING_INNER,
  LANDING_SECTION_ANCHOR,
  LANDING_SECTION_PY,
} from "./landingLayout";

const testimonialsData = [
  {
    id: 1,
    name: "Krishna Mohan",
    role: "LIC Advisor • Nellore",
    type: "Advisor",
    text: '"YVITY transformed how my clients perceive me. My verified profile speaks before I even meet them — 3x more inquiries in 2 months!"',
    rating: 5,
    status: "Verified",
    hasAudio: false,
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Customer • Hyderabad",
    type: "Customer",
    text: '"I could compare advisors by score and reviews in one place. It made choosing someone I trust much easier."',
    rating: 5,
    status: "OTP Verified",
    hasAudio: true,
    audioDuration: "1:12",
  },
  {
    id: 3,
    name: "Anitha Reddy",
    role: "Health Advisor • Bengaluru",
    type: "Advisor",
    text: '"Clients now see my achievements and verified reviews upfront. My profile does the talking before the first call."',
    rating: 5,
    status: "Verified",
    hasAudio: false,
  },
];

const waveHeights = [40, 70, 30, 90, 50, 100, 60, 40, 80, 30, 70, 50, 90, 40];

const isApprovedTestimonial = (testimonial) =>
  String(testimonial?.status ?? "").trim().toLowerCase() === "approved";

const getSortedTestimonials = (testimonialList) => {
  if (!Array.isArray(testimonialList)) return [];

  const approved = testimonialList.filter(isApprovedTestimonial);
  const source = approved.length > 0 ? approved : testimonialList;

  return [...source]
    .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
    .slice(0, 6);
};

const renderAvatar = (testimonial) => {
  if (testimonial.avatarUrl) {
    return (
      <img
        src={testimonial.avatarUrl}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-[#0a4d46] text-white flex items-center justify-center font-poppins font-bold text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] flex-shrink-0">
      {testimonial.name
        .split(" ")
        .map((n) => n[0])
        .join("")}
    </div>
  );
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(testimonialsData);
  const visibleTestimonials = getSortedTestimonials(testimonials);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials");
        const result = await response.json();
        if (result?.success && Array.isArray(result.data)) {
          setTestimonials(result.data);
        }
      } catch (error) {
        console.error("Failed to load testimonials:", error);
      }
    };

    fetchTestimonials();
  }, []);

  const renderReplySection = (testimonial) => {
    if (!testimonial.replyText) return null;

    return (
      <div className="mb-4 rounded-2xl border border-[#D8E6E3] bg-[#F6FBFA] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0A4A4A]">
          YVITY
        </p>
        <p className="mt-2 text-[13px] leading-5 text-[#37514D]">
          {testimonial.replyText}
        </p>
      </div>
    );
  };

  const renderTestimonialCard = (testimonial) => (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#0D6060] bg-[#F8F6F1] p-6 transition-all duration-300 md:p-4 lg:p-7 hover:border-transparent hover:shadow-[0_0_4px_2px_rgba(13,96,96,0.25)]">
      <span className="absolute left-0 top-0 h-full w-[5px] origin-center scale-y-0 bg-[#0D6060] transition-transform duration-500 ease-in-out group-hover:scale-y-100" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-2">
          {renderAvatar(testimonial)}
          <div>
            <h4 className="font-poppins text-[12px] font-bold text-[#0A4A4A] sm:text-[13px] md:text-[12px] lg:text-[16px]">
              {testimonial.name}
            </h4>
            <p className="font-poppins text-xs text-gray-500">
              {testimonial.role}
            </p>
          </div>
        </div>

        {testimonial.type === "Advisor" ? (
          <span className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-blue-50 px-3 py-1 font-poppins text-xs font-medium text-blue-600">
            <img
              src="/svgs/fluent-emoji-flat_shield.svg"
              alt="Advisor"
              className="h-3 w-3"
            />
            Advisor
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-green-50 px-3 py-1 font-poppins text-xs font-medium text-green-600">
            <img
              src="/svgs/clarity_user-solid.svg"
              alt="Customer"
              className="h-3 w-3"
            />
            Customer
          </span>
        )}
      </div>

      {testimonial.hasAudio && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#0a4d46] text-white"
          >
            <img src="/svgs/line-md_play-filled.svg" alt="Play Audio" />
          </button>
          <div className="flex h-6 flex-1 items-center gap-[3px]">
            {waveHeights.map((height, i) => {
              const isActive = i < 5;
              return (
                <div
                  key={i}
                  className={`w-[2px] rounded-full transition-all duration-300 ${
                    isActive ? "bg-[#0a4d46]" : "bg-gray-300"
                  }`}
                  style={{
                    height: `${height}%`,
                    opacity: isActive ? 1 : 0.6,
                  }}
                />
              );
            })}
          </div>
          <span className="w-8 text-right text-xs font-medium text-gray-500">
            {testimonial.audioDuration}
          </span>
        </div>
      )}

      {(testimonial.hasAudio ||
        testimonial.hasVideo ||
        testimonial.hasMedia) &&
        renderReplySection(testimonial)}

      <p
        className={`mb-5 font-nunito text-[12px] leading-relaxed italic text-gray-600 lg:text-[14px] ${testimonial.hasAudio ? "line-clamp-3" : ""}`}
      >
        {testimonial.text}
      </p>

      {!testimonial.hasAudio &&
        !testimonial.hasVideo &&
        !testimonial.hasMedia &&
        renderReplySection(testimonial)}

      <div className="mt-auto flex items-center justify-between">
        <div className="flex gap-1 text-amber-400">
          {[...Array(testimonial.rating)].map((_, i) => (
            <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="flex items-center gap-1 font-poppins text-xs font-semibold text-[#0a4d46]">
          <img
            src={
              testimonial.status === "Verified"
                ? "/svgs/mdi_shield-tick.svg"
                : "/svgs/mdi_tick.svg"
            }
            alt="Status"
            className="h-4 w-4"
          />
          {testimonial.status}
        </span>
      </div>
    </div>
  );

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: -60 },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: { duration: 0.6, ease: "easeOut" },
      };

  return (
    <section
      id="testimonials"
      className={`w-full bg-white ${LANDING_SECTION_PY} ${LANDING_SECTION_ANCHOR}`}
    >
      <div className={LANDING_INNER}>
        <motion.div {...motionProps} className="mb-8 lg:mb-12">
          <LandingSectionHeader
            eyebrow="Reviews"
            title={
              <>
                Real Stories.{" "}
                <span className="text-[#F59E0B]">Real Trust.</span>
              </>
            }
            description="See how YVITY is helping advisors build credibility and customers find trusted professionals."
          />
        </motion.div>

        <LandingSnapScroll ariaLabel="Reviews" className="lg:hidden">
          {visibleTestimonials.map((testimonial) => (
            <LandingSnapItem
              key={`snap-${testimonial.id}`}
              className="w-[88vw] max-w-[400px] py-3"
            >
              {renderTestimonialCard(testimonial)}
            </LandingSnapItem>
          ))}
        </LandingSnapScroll>
        {visibleTestimonials.length > 1 ? (
          <p className="mt-1 text-center font-poppins text-[10px] text-[#6B7280] lg:hidden">
            Swipe for more stories
          </p>
        ) : null}

        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
          {visibleTestimonials.map((testimonial) => (
            <div key={`grid-${testimonial.id}`} className="py-3">
              {renderTestimonialCard(testimonial)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

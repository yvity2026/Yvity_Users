"use client";
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import React, { useState } from "react";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { openRegistrationModal } from "@/yvity-landing/lib/ui/openRegistrationModal";
import { scrollToSection } from "@/yvity-landing/lib/landing/scrollToSection";
import { LandingSectionAccordion } from "./home/LandingAccordion";
import LandingSectionHeader from "./home/LandingSectionHeader";
import LandingMobileSectionShell from "./home/LandingMobileSectionShell";
import { LANDING_INNER, LANDING_SECTION_ANCHOR, LANDING_SECTION_PY } from "./home/landingLayout";

const GetStartedData = [
  {
    id: "advisors",
    title: "For Insurance Advisors",
    imagePath: "/svgs/fluent-emoji-flat_shield.svg",
    description:
      "Your clients are searching for someone they can trust. Be the one they find.",
    checkpoints: [
      "Build your verified profile",
      "Showcase your achievements",
      "Connect with clients who value trust",
    ],
    buttonText: "Start building your Profile",
    buttonStyle:
      "flex justify-center items-center gap-2 rounded-[30px] bg-gradient-to-r from-[rgba(217,119,6,0.9)] to-[rgba(255,169,70,0.9)] hover:shadow-[0_4px_4px_2px_rgba(217,119,6,0.25)] transition-all duration-300",
    scrollTarget: null,
  },
  {
    id: "customers",
    title: "Looking for an Advisor?",
    imagePath: "/svgs/home/glyphs-poly_search.svg",
    description:
      "Don't just take someone's word for it. Find advisors who've already proven their credibility.",
    checkpoints: [
      "Discover verified advisors",
      "Read authentic reviews",
      "Make informed decisions with confidence",
    ],
    buttonText: "Find a trusted Advisor",
    buttonStyle:
      "flex justify-center items-center gap-2 rounded-[30px] bg-gradient-to-r from-[rgba(217,119,6,0.9)] to-[rgba(255,169,70,0.9)] hover:shadow-[0_4px_4px_2px_rgba(217,119,6,0.25)] transition-all duration-300",
    scrollTarget: "find-advisors",
  },
];

function GetStartedCardContent({ item, onAction }) {
  return (
    <div className="flex flex-col gap-3">
      <Image src={item.imagePath} alt="" width={40} height={40} />
      <p className="text-[#C6C6C6] font-poppins text-sm italic font-normal leading-relaxed">
        {item.description}
      </p>
      <ul className="text-[#C6C6C6] font-poppins text-[12px] font-normal space-y-2.5">
        {item.checkpoints.map((checkpoint, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <FaCheck className="text-[#F59E0B] shrink-0 mt-0.5" />
            {checkpoint}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAction}
        className={`${item.buttonStyle} text-[12px] w-full p-3 text-white cursor-pointer mt-1`}
      >
        {item.buttonText} <FaArrowRight />
      </button>
    </div>
  );
}

function GetStartedMobile() {
  const [openId, setOpenId] = useState("advisors");

  const handleCta = (item) => {
    if (item.scrollTarget) {
      scrollToSection(item.scrollTarget);
      return;
    }
    openRegistrationModal();
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {GetStartedData.map((item) => (
        <LandingSectionAccordion
          key={item.id}
          variant="teal"
          title={item.title}
          subtitle={item.checkpoints[0]}
          isOpen={openId === item.id}
          onToggle={() =>
            setOpenId((prev) => (prev === item.id ? null : item.id))
          }
        >
          <GetStartedCardContent
            item={item}
            onAction={() => handleCta(item)}
          />
        </LandingSectionAccordion>
      ))}
    </div>
  );
}

const Getstarted = () => {
  return (
    <section
      id="get-started"
      className={`flex w-full justify-center overflow-x-hidden bg-[linear-gradient(104deg,#073232_12.09%,#0E7B7B_97.27%)] ${LANDING_SECTION_PY} ${LANDING_SECTION_ANCHOR} lg:py-20`}
    >
      <div
        className={`${LANDING_INNER} flex flex-col items-start gap-8 md:gap-10`}
      >
        <LandingSectionHeader
          className="hidden w-full lg:block"
          dark
          eyebrow="Get Started"
          accent="Your Credibility"
          title="Journey Starts Here"
          description="Whether you're an advisor building your presence or a client looking for someone you can trust — YVITY is your starting point."
        />

        <LandingMobileSectionShell
          dark
          eyebrow="Get Started"
          accent="Your Credibility"
          title="Journey Starts Here"
          description="Whether you're an advisor building your presence or a client looking for someone you can trust — YVITY is your starting point."
        >
          <GetStartedMobile />
        </LandingMobileSectionShell>

        <div className="hidden lg:grid grid-cols-2 gap-6 lg:gap-8 xl:gap-12 w-full">
          {GetStartedData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="h-full md:max-h-[339px] w-full rounded-2xl flex flex-col space-y-3 items-start md:space-y-3 place-self-center p-5 md:p-6 lg:p-8 md:rounded-[16px] border border-[#186E6E] bg-[#195A5A] hover:border-[#0AE0E0] hover:shadow-[0_0_4px_2px_rgba(13,96,96,0.25)] transition-all duration-500 ease-in-out"
            >
              <Image
                src={item.imagePath}
                alt={item.title}
                width={40}
                height={40}
              />
              <p className="text-[#F8F6F1] font-poppins text-base sm:text-lg md:text-xl font-bold">
                {item.title}
              </p>
              <p className="text-[#C6C6C6] font-poppins text-sm md:text-xs italic font-normal">
                &ldquo;{item.description}&rdquo;
              </p>
              <ul className="text-[#C6C6C6] font-poppins text-[12px] md:text-xs font-normal space-y-3">
                {item.checkpoints.map((checkpoint, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <FaCheck className="text-[#F59E0B]" />
                    {checkpoint}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  item.scrollTarget
                    ? scrollToSection(item.scrollTarget)
                    : openRegistrationModal()
                }
                className={`${item.buttonStyle} text-[10px] w-full sm:w-auto p-3 sm:px-6 md:py-[14px] text-white hover:rounded-3xl cursor-pointer mt-2`}
              >
                {item.buttonText} <FaArrowRight />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Getstarted;

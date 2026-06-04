"use client";
import { Check } from "lucide-react";
import React from "react";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { motion } from "framer-motion";
import { openLoginModal } from "@/yvity-landing/lib/ui/openLoginModal";
import LandingSectionHeader from "./home/LandingSectionHeader";
import LandingMobileSectionShell from "./home/LandingMobileSectionShell";
import {
  LANDING_INNER,
  LANDING_SECTION_ANCHOR,
  LANDING_SECTION_PY,
  LANDING_MOBILE_HEADER_MB,
} from "./home/landingLayout";

function PricingCard({ item }) {
  return (
    <div
      className={`${item.cardStyle} relative h-auto min-h-0 md:min-h-[520px] w-full md:max-w-[450px] p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-2 items-center sm:items-start text-center sm:text-left rounded-2xl hover:transition-all hover:duration-300 hover:bg-[#FFF] hover:ease-in-out transition-all duration-300 ease-in-out`}
    >
      <p className="text-sm font-semibold tracking-[1.4px] text-(--ct-as-badges-accents,#F59E0B) uppercase font-poppins leading-none">
        {item.title}
      </p>
      <p
        className={`text-3xl font-bold font-poppins text-[#0A4A4A] ${
          Number(item.price?.split("/")[0] || 0) === 0 ? "invisible" : ""
        }`}
      >
        ₹{Number(item.price?.split("/")[0] || 0)}
        <span className="text-gray-400 text-base font-bold">{item.period}</span>
      </p>
      {item.message ? (
        <p className="text-[14px] md:text-[11px] lg:text-[13px] xl:text-[16px] font-normal leading-[22px] md:leading-[26px] text-[var(--Body-content,#374151)] font-poppins">
          {item.message}
        </p>
      ) : (
        <p className="invisible">placeholder</p>
      )}
      <div className="h-0.5 w-full bg-gray-300" />
      <div className="flex flex-col justify-between min-h-72 md:min-h-86 md:gap-8 w-full">
        <ul className="flex flex-col justify-start items-start gap-2.5 md:gap-2 mt-2 md:pt-6">
          {item.features.map((feature, idx) => (
            <li
              key={`feature-${idx}`}
              className="lg:text-base md:text-sm text-sm xl:font-normal md:leading-[26px] text-slate-700 font-poppins flex items-center gap-3 md:gap-4"
            >
              <FaCheck className="text-[#065F46] shrink-0" />
              {feature}
            </li>
          ))}
          {item.nonFeatures?.map((nonFeature, idx) => (
            <li
              key={`non-feature-${idx}`}
              className="lg:text-base md:text-sm text-sm font-normal md:leading-[26px] text-slate-700 font-poppins flex md:items-center gap-3 md:gap-4"
            >
              <RxCross2 className="shrink-0" />
              {nonFeature}
            </li>
          ))}
        </ul>
        <button
          onClick={openLoginModal}
          className={`w-full text-sm font-semibold flex items-center justify-center gap-2 rounded-full transition-all duration-500 ease-in-out ${item.buttonStyle}`}
        >
          {item.buttonText}
          <FaArrowRight />
        </button>
      </div>
      {item.cover && (
        <span
          className={`${item.coverStyle} flex items-center text-[10px] whitespace-nowrap px-3 py-1 gap-1 font-poppins font-semibold md:gap-2 mb-1`}
        >
          <Check size={16} />
          {item.cover}
        </span>
      )}
    </div>
  );
}

const Pricing = () => {
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0,
      },
    },
  };

  const itemstyle = {
    hidden: { opacity: 0, x: -85 },
    show: { opacity: 1, x: 0 },
  };

  const pricingData = [
    {
      title: "Free",
      price: "0",
      period: "",
      message: "Free forever, no credit card required",
      features: [
        "Appears in Search",
        "Identity Verified Badge",
        "Up to 5 Text Reviews",
      ],
      nonFeatures: [
        "IRDAI License Verified",
        "Audio Reviews",
        "Video Reviews",
        "Recommendations",
        "Intro Video",
        "QR Code Download",
        "Founding Advisor Badge",
        "Priority Directory Listing",
      ],
      cardStyle:
        "hover:rounded-[16px] hover:border border-transparent hover:border-[#0D6060] bg-white hover:shadow-[0_0_4px_2px_rgba(13,96,96,0.25)]",
      buttonText: "Start Free",
      buttonStyle:
        "flex items-center justify-center gap-2 w-full lg:min-h-[44px] rounded-full text-sm md:text-base px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 border-2 border-transparent bg-[#F8F6F1] hover:border-[#0D6060] hover:bg-[#F8F6F1] transition-all duration-500 active:scale-[0.98] cursor-pointer text-[var(--labels-secondary-info,#6B7280)]",
    },
    {
      title: "Silver",
      price: "999",
      period: "/year",
      features: [
        "Appears in Search",
        "Identity Verified Badge",
        "IRDAI License Verified",
        "Unlimited Text Reviews",
        "Audio Reviews",
        "Recommendations",
      ],
      nonFeatures: [
        "Video Reviews",
        "Intro Video",
        "QR Code Download",
        "Founding Advisor Badge",
        "Priority Directory Listing",
      ],
      cardStyle:
        "hover:rounded-[16px] hover:border border-transparent hover:border-[#0D6060] bg-white hover:shadow-[0_0_4px_2px_rgba(13,96,96,0.25)]",
      buttonText: "Get Silver",
      buttonStyle:
        "flex items-center justify-center gap-2 w-full xl:min-h-[44px] rounded-full text-sm  md:text-base px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-(--primary-900,#0A4A4A) text-(--ct-as-badges-accents,#F59E0B) hover:bg-(--Primary-800,#076868) hover:text-(--ct-as-badges-accents,#F59E0B) hover:shadow-[0_4px_12px_rgba(13,96,96,0.25)] transition-all duration-500 active:scale-[0.98] cursor-pointer text-[ var(--ct-as-badges-accents,#F59E0B)]",
    },
    {
      title: "Gold",
      price: "2999",
      period: "/year",
      features: [
        "Priority Search Listing",
        "Identity Verified Badge",
        "IRDAI License Verified",
        "Unlimited Text Reviews",
        "Audio Reviews",
        "Video Reviews",
        "Recommendations",
        "Intro Video",
        "QR Code Download",
        "Founding Advisor Badge",
        "Priority Directory Listing",
        "Most Popular Badge",
      ],
      cardStyle:
        "hover:rounded-[16px] border border-[#F59E0B] bg-white hover:shadow-[0_0_4px_2px_rgba(217,119,6,0.25)]",
      buttonText: "Get Gold",
      buttonStyle:
        "flex items-center justify-center gap-2 w-full xl:min-h-[44px] rounded-full text-xs sm:text-sm md:text-base px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-[rgba(217,119,6,0.9)] to-[rgba(255,169,70,0.9)] hover:shadow-[0_4px_12px_rgba(217,119,6,0.25)] transition-all duration-500 active:scale-[0.98] cursor-pointer text-[var(--Pearl-Whitepage-background,#F8F6F1)]",
      cover: "most popular",
      coverStyle:
        "absolute top-0  left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-(--primary-900,#0A4A4A) text-[var(--Pearl-Whitepage-background,#F8F6F1)] rounded-[16px] bg-gradient-to-r from-[#D97706] to-[#FF8900] rounded-full",
    },
  ];

  return (
    <section
      id="pricing"
      className={`flex flex-col items-center overflow-x-hidden bg-(--Pearl-Whitepage-background,#F8F6F1) ${LANDING_SECTION_PY} ${LANDING_SECTION_ANCHOR} lg:py-[71px]`}
    >
      <div className={`flex w-full flex-col ${LANDING_INNER}`}>
        <LandingSectionHeader
          className={`${LANDING_MOBILE_HEADER_MB} lg:mb-8`}
          eyebrow="Pricing"
          accent="Simple, Transparent"
          title="Pricing"
          description="Start free and upgrade when you're ready. No hidden charges."
        />

        <LandingMobileSectionShell bodyOnly className="mb-2">
          <div className="flex w-full flex-col gap-4">
            {pricingData.map((item) => (
              <PricingCard key={item.title} item={item} />
            ))}
          </div>
        </LandingMobileSectionShell>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="my-4 hidden w-full place-items-center gap-6 lg:mt-[37px] lg:grid lg:grid-cols-3 lg:gap-8"
        >
          {pricingData.map((item, index) => (
            <motion.div key={index} variants={itemstyle} className="w-full">
              <PricingCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;

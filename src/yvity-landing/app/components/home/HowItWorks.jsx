"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ValueCard from "../home-features/value-card";
import HowItWorksMobile from "./HowItWorksMobile";
import LandingSectionHeader from "./LandingSectionHeader";
import LandingMobileSectionShell from "./LandingMobileSectionShell";
import { LANDING_INNER, LANDING_SECTION_ANCHOR, LANDING_SECTION_PY, LANDING_MOBILE_HEADER_MB } from "./landingLayout";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("advisors");

  const advisorSteps = [
    {
      number: "01",
      title: "Create Free Profile",
      description:
        "Build your complete professional advisor profile in minutes.",
      icon: "/svgs/home/fluent_form-multiple-48-filled.svg",
    },
    {
      number: "02",
      title: "Verify Your Identity",
      description:
        "Add selfie, IRDAI license, and get your identity Verified badge.",
      icon: "/svgs/home/mdi_shield-tick.svg",
    },
    {
      number: "03",
      title: "Collect Testimonials",
      description:
        "Request OTP - verified reviews from clients - text, audio or video.",
      icon: "/svgs/home/humbleicons_chat.svg",
    },
    {
      number: "04",
      title: "Share and Grow",
      description:
        "Request your profile link, qr code and watch your credibility score grow.",
      icon: "/svgs/home/noto_link.svg",
    },
  ];

  const customerSteps = [
    {
      number: "01",
      title: "Search Advisors",
      description: "Find advisors by city, state, name or insurance type.",
      icon: "/svgs/home/glyphs-poly_search.svg",
    },
    {
      number: "02",
      title: "Check Profile & Score",
      description:
        "Review advisor's YVITY Score, verified reviews and achievements.",
      icon: "/svgs/home/profile_score.svg",
    },
    {
      number: "03",
      title: "Verify Credentials",
      description:
        "Check IRDAI license, identity badge and client testimonials.",
      icon: "/svgs/home/fluent-color_building-home-32.svg",
    },
    {
      number: "04",
      title: "Connect with Confidence",
      description:
        "Call, WhatsApp or email the advisor directly from their profile.",
      icon: "/svgs/home/fluent-emoji-flat_handshake.svg",
    },
  ];

  const valueCards = [
    {
      title: "Identity",
      description:
        "Verify who you are. Selfie verification, mobile OTP, and IRDAI license validation - so clients know you are real and trustworthy.",
      icon: "/svgs/identity.svg",
      titleColor: "text-[#0A4A4A]",
    },
    {
      title: "Visibility",
      description:
        "Get discovered. A complete Shareable profile with QR code, directory listing, and intro video - so the right clients find you first.",
      icon: "/svgs/eye.svg",
      titleColor: "text-[#0A4A4A]",
    },
    {
      title: "Trust",
      description:
        "Prove your worth. OTP-verified testimonials, client recommendations, MDRT achievements - all in one scored, trusted profile.",
      icon: "/svgs/trophy.svg",
      titleColor: "text-[#0A4A4A]",
    },
  ];

  const currentSteps = activeTab === "advisors" ? advisorSteps : customerSteps;

  return (
    <section
      id="how-it-works"
      className={`w-full bg-white ${LANDING_SECTION_PY} ${LANDING_SECTION_ANCHOR}`}
    >
      <div className={LANDING_INNER}>
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 hidden md:mb-12 lg:block"
        >
          <LandingSectionHeader
            eyebrow="How it works"
            accent="Built on"
            title={
              <>
                Identity, <br className="sm:hidden" />
                Visibility & Trust
              </>
            }
            description="YVITY helps advisors build professional credibility and helps customers find trusted advisors with complete confidence."
          />
        </motion.div>

        <LandingSectionHeader
          className={`${LANDING_MOBILE_HEADER_MB} lg:hidden`}
          eyebrow="How it works"
          accent="Built on"
          title={
            <>
              Identity, <br />
              Visibility & Trust
            </>
          }
          description="YVITY helps advisors build professional credibility and helps customers find trusted advisors with complete confidence."
        />

        <LandingMobileSectionShell bodyOnly>
          <HowItWorksMobile
            valueCards={valueCards}
            advisorSteps={advisorSteps}
            customerSteps={customerSteps}
          />
        </LandingMobileSectionShell>

        {/* Desktop — unchanged */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
          className="hidden lg:grid lg:grid-cols-3 gap-6 lg:gap-4 mb-16"
        >
          {valueCards.map((card, index) => (
            <ValueCard key={index} {...card} index={index} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col items-center"
        >
          <div className="bg-[#F8F6F1] p-2 sm:p-3 rounded-full inline-flex w-full sm:w-auto mb-16 relative z-20 font-poppins gap-2 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setActiveTab("advisors")}
              className="relative flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold cursor-pointer text-center"
            >
              {activeTab === "advisors" && (
                <motion.div
                  layoutId="pill"
                  className="absolute inset-0 bg-[#0A4A4A] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-300 ${
                  activeTab === "advisors" ? "text-[#F59E0B]" : "text-gray-500"
                }`}
              >
                For Advisors
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setActiveTab("customers")}
              className="relative flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold cursor-pointer text-center"
            >
              {activeTab === "customers" && (
                <motion.div
                  layoutId="pill"
                  className="absolute inset-0 bg-[#0A4A4A] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-300 ${
                  activeTab === "customers" ? "text-[#F59E0B]" : "text-gray-500"
                }`}
              >
                For Customers
              </span>
            </motion.button>
          </div>

          <div className="w-full relative px-4 md:px-1">
            <div className="absolute top-[20px] left-[12.5%] right-[12.5%] h-[2px] bg-[#0a4d46] z-0" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-4 gap-4 relative text-center z-10"
              >
                {currentSteps.map((step, index) => (
                  <motion.div
                    key={`${activeTab}-${index}`}
                    whileHover={{ scale: 1.03 }}
                    className="flex flex-col items-center relative group cursor-pointer"
                  >
                    <div className="font-poppins w-10 h-10 rounded-full bg-[#e8f6f3] text-[#0a4d46] flex items-center justify-center font-bold mb-5 transition-colors duration-300 group-hover:bg-[#0A4A4A] group-hover:text-[#F59E0B] relative z-20">
                      {step.number}
                    </div>
                    <img
                      src={step.icon}
                      alt={step.title}
                      className="relative z-10"
                    />
                    <h4 className="font-bold text-[#0A4A4A] mb-2 text-sm font-poppins relative z-10">
                      {step.title}
                    </h4>
                    <p className="text-[#374151] text-xs max-w-[250px] leading-relaxed font-poppins relative z-10">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

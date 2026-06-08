"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingSectionHeader from "./LandingSectionHeader";
import LandingMobileSectionShell from "./LandingMobileSectionShell";
import { LANDING_INNER, LANDING_SECTION_ANCHOR, LANDING_SECTION_PY, LANDING_MOBILE_HEADER_MB } from "./landingLayout";

const advisorFaqs = [
  {
    question: "What is YVITY?",
    answer:
      "India's first credibility platform for insurance advisors. Build a verified, scored, and shareable profile that proves your Identity, Visibility, and Trust to every client.",
  },
  {
    question: "Who can join YVITY?",
    answer:
      "Any full-time, IRDAI-licensed insurance advisor in India — LIC, HDFC Life, SBI Life, ICICI Pru, Max Life, Tata AIA, Star Health, and all registered companies.",
  },
  {
    question: "Is YVITY free?",
    answer:
      "Yes. The Free plan includes a public profile, identity verification, text testimonials, and more. Silver (₹1,499/yr) adds service verification, short intro video, and higher limits. Gold (₹2,999/yr) adds hero intro video, search visibility, profile analytics, and featured eligibility.",
  },
  {
    question: "What is the YVITY Score?",
    answer:
      "A score out of 100 built on Identity (30 pts) + Visibility (30 pts) + Trust (40 pts). The higher your score, the more credible your profile appears to clients.",
  },
  {
    question: "What documents do I need?",
    answer:
      "Mobile number (OTP), email address, IRDAI License number, and a selfie for liveness check. Optionally: intro video, achievement certificates (MDRT/COT/TOT).",
  },
  {
    question: "How do OTP verified reviews work?",
    answer:
      "You send a review link to your client. They verify via mobile OTP before submitting. This proves every review is from a real client — shown with '✓ OTP Verified' badge.",
  },
  {
    question: "What is the Founding Advisor Badge?",
    answer:
      "A permanent badge for advisors who join during YVITY's early launch phase. It stays on your profile forever, showing you were among the first credible advisors on the platform.",
  },
  {
    question: "How do I share my profile?",
    answer:
      "Via unique YVITY link, WhatsApp, email, or QR code (Gold plan). Add it to your WhatsApp status, business card, or email signature.",
  },
  {
    question: "What is MDRT and how does it help?",
    answer:
      "MDRT (Million Dollar Round Table) is a global top-1% recognition. Uploading your certificate adds up to 2 points to your YVITY Score and shows a prestigious badge on your profile.",
  },
  {
    question: "Is my personal data safe?",
    answer:
      "Yes. IRDAI and identity data is used only for verification and never shared without your consent. YVITY follows data protection standards.",
  },
];

const customerFaqs = [
  {
    question: "What is YVITY for me as a customer?",
    answer:
      "YVITY helps you find verified, licensed insurance advisors near you — with real client reviews, YVITY Score, and IRDAI-verified identity. No more relying on strangers or cold calls.",
  },
  {
    question: "Is YVITY free for customers?",
    answer:
      "Completely free. Search advisors, view profiles, read reviews, and contact them directly — no registration, no fees, no middleman.",
  },
  {
    question: "What does 'Verified' mean?",
    answer:
      "The advisor has passed YVITY's identity checks — selfie liveness, IRDAI license validation, and mobile OTP. They are a real, licensed professional.",
  },
  {
    question: "Are the reviews genuine?",
    answer:
      "Yes. All 'OTP Verified' reviews are from real clients who verified their phone number before submitting. No anonymous or fake reviews are allowed.",
  },
  {
    question: "How do I find a trusted advisor near me?",
    answer:
      "Go to yvity.in → Find Advisors → Search by city or service → Filter by Verified, Top Rated, or MDRT → View profiles and contact directly.",
  },
  {
    question: "What is the YVITY Score?",
    answer:
      "A number out of 100 showing the advisor's credibility — based on their verified identity, profile completeness, real client reviews, recommendations, and achievements like MDRT. Higher = more credible.",
  },
];

const FAQ_SECTIONS = [
  {
    id: "advisors",
    title: "For Advisors",
    description: "Profile, verification, plans & YVITY Score",
    faqs: advisorFaqs,
  },
  {
    id: "customers",
    title: "For Customers",
    description: "Finding advisors, reviews & trust",
    faqs: customerFaqs,
  },
];

function AccordionChevron({ open }) {
  return (
    <span
      className={`ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
        open
          ? "border-[#0a4d46] bg-[#0a4d46]"
          : "border-[#0a4d46] bg-white"
      }`}
    >
      {open ? (
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#e28c33"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#0a4d46"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      )}
    </span>
  );
}

function FaqQuestionAccordion({
  faq,
  itemKey,
  isOpen,
  onToggle,
  nested = false,
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white ${
        nested ? "shadow-none" : "shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:text-[#0a4d46]"
      >
        <span className="pr-2 font-nunito text-[14px] font-semibold leading-snug text-[#0A4A4A]">
          {faq.question}
        </span>
        <AccordionChevron open={isOpen} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={`${itemKey}-answer`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-4 pb-4 pt-1 font-nunito text-[13px] leading-relaxed text-[#374151]">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Mobile: section headings + single-level question accordions */
function MobileFaqAccordion() {
  const [openQuestionKey, setOpenQuestionKey] = useState(null);

  return (
    <div className="flex w-full flex-col gap-6">
      {FAQ_SECTIONS.map((section) => (
        <div key={section.id} className="flex flex-col gap-2">
          <div>
            <h3 className="font-poppins text-[15px] font-semibold text-[#0A4A4A]">
              {section.title}
            </h3>
            <p className="font-poppins text-[12px] text-[#6B7280]">
              {section.description}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {section.faqs.map((faq, index) => {
              const questionKey = `${section.id}-${index}`;
              return (
                <FaqQuestionAccordion
                  key={questionKey}
                  faq={faq}
                  itemKey={questionKey}
                  isOpen={openQuestionKey === questionKey}
                  onToggle={() =>
                    setOpenQuestionKey((prev) =>
                      prev === questionKey ? null : questionKey,
                    )
                  }
                  nested
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Desktop: tabs + flat accordion list (unchanged behaviour) */
function DesktopFaq() {
  const [activeTab, setActiveTab] = useState("advisors");
  const [openIndex, setOpenIndex] = useState(null);

  const currentFaqs =
    activeTab === "advisors" ? advisorFaqs : customerFaqs;

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setOpenIndex(null);
  };

  return (
    <div className="hidden lg:block w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mb-6 flex flex-col items-center"
      >
        <div className="relative z-20 mb-3 inline-flex w-auto gap-2 rounded-full bg-[#F8F6F1] p-2 sm:p-3 font-poppins sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => handleTabSwitch("advisors")}
            className="relative cursor-pointer rounded-full px-4 py-2.5 text-center text-xs font-semibold sm:px-10 sm:py-3 sm:text-sm md:px-8"
          >
            {activeTab === "advisors" && (
              <motion.div
                layoutId="faq-pill"
                className="absolute inset-0 rounded-full bg-[#0A4A4A]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 whitespace-nowrap transition-colors duration-300 ${
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
            onClick={() => handleTabSwitch("customers")}
            className="relative cursor-pointer rounded-full px-8 py-2.5 text-center text-xs font-semibold sm:px-10 sm:py-3 sm:text-sm"
          >
            {activeTab === "customers" && (
              <motion.div
                layoutId="faq-pill"
                className="absolute inset-0 rounded-full bg-[#0A4A4A]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 whitespace-nowrap transition-colors duration-300 ${
                activeTab === "customers" ? "text-[#F59E0B]" : "text-gray-500"
              }`}
            >
              For Customers
            </span>
          </motion.button>
        </div>
      </motion.div>

      <div className="relative w-full">
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-0 h-[400px] w-[90%] max-w-[700px] -translate-x-1/2"
          style={{
            backgroundImage: "url('/images/home/faq-bg-image.png')",
            backgroundPosition: "center top",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative z-10 w-full text-left">
          {currentFaqs.map((faq, index) => (
            <div key={`${activeTab}-${index}`} className="border-b border-gray-200">
              <button
                type="button"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="group flex w-full cursor-pointer items-center justify-between py-5 text-left transition-colors hover:text-[#0a4d46]"
              >
                <span className="font-nunito text-[16px] font-semibold leading-[26px] text-[#0A4A4A]">
                  {faq.question}
                </span>
                <AccordionChevron open={openIndex === index} />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-2 pr-10 font-nunito text-[12px] font-normal leading-[26px] text-[#374151]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FAQ = () => {
  return (
    <section
      id="faq"
      className={`relative flex min-h-0 w-full flex-col overflow-hidden bg-white font-sans ${LANDING_SECTION_PY} ${LANDING_SECTION_ANCHOR} md:min-h-[600px]`}
    >
      <div className={`relative z-10 ${LANDING_INNER}`}>
        <LandingSectionHeader
          className={`${LANDING_MOBILE_HEADER_MB} md:mb-8`}
          eyebrow="FAQ"
          accent="Frequently Asked"
          title="Questions"
          description="Everything you need to know about YVITY."
        />

        <LandingMobileSectionShell bodyOnly className="mb-2">
          <MobileFaqAccordion />
        </LandingMobileSectionShell>
        <DesktopFaq />
      </div>
    </section>
  );
};

export default FAQ;

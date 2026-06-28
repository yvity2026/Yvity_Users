"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  HelpCircle,
  Clock,
  Info,
  Landmark,
  Lightbulb,
  Lock,
  Map,
  MapPin,
  Mail,
  Phone,
  Scale,
  Search,
  Share2,
  Shield,
  Users,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { cn } from "@/lib/utils";

// ─── Static company data ──────────────────────────────────────────────────────

const COMPANIES = [
  {
    id: "tata-aia",
    logo: "/images/companies/tata-aia.png",
    initials: "TA",
    name: "TATA AIA Life Insurance Co. Ltd.",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "110",
    website: "https://www.tataaia.com",
    websiteDisplay: "www.tataaia.com",
    phone: "1860-266-9966",
    phone2: null,
    whatsapp: "+91 86559 07070",
    email: "customercare@tataaia.com",
    lastUpdated: "15 June 2026",
  },
  {
    id: "star-health",
    logo: "/images/companies/star-health.png",
    initials: "SH",
    name: "Star Health and Allied Insurance Co. Ltd.",
    serviceType: "Health Insurance",
    entityType: "Company",
    established: 2006,
    irdaiRegNo: "129",
    website: "https://www.starhealth.in",
    websiteDisplay: "www.starhealth.in",
    phone: "1800 425 2255",
    phone2: "1800 102 4477",
    whatsapp: "+91 95919 19191",
    email: "customercare@starhealth.in",
    lastUpdated: "15 June 2026",
  },
  {
    id: "niva-bupa",
    logo: "/images/companies/niva-bupa.png",
    initials: "NB",
    name: "Niva Bupa Health Insurance Co. Ltd.",
    serviceType: "Health Insurance",
    entityType: "Company",
    established: 2008,
    irdaiRegNo: "145",
    website: "https://www.nivabupa.com",
    websiteDisplay: "www.nivabupa.com",
    phone: "1860-500-8888",
    phone2: "1800-309-3333",
    whatsapp: "+91 98119 56696",
    email: "customercare@nivabupa.com",
    lastUpdated: "June 2026",
  },
  {
    id: "care-health",
    logo: "/images/companies/care-health.png",
    initials: "CH",
    name: "Care Health Insurance Ltd.",
    serviceType: "Health Insurance",
    entityType: "Company",
    established: 2012,
    irdaiRegNo: "148",
    website: "https://www.careinsurance.com",
    websiteDisplay: "www.careinsurance.com",
    phone: "1800-102-4488",
    phone2: "1800-102-6655",
    whatsapp: "+91 88604 02452",
    email: "customerfirst@careinsurance.com",
    lastUpdated: "June 2026",
  },
  {
    id: "manipalcigna",
    logo: "/images/companies/manipalcigna.png",
    initials: "MC",
    name: "ManipalCigna Health Insurance Co. Ltd.",
    serviceType: "Health Insurance",
    entityType: "Company",
    established: 2014,
    irdaiRegNo: "151",
    website: "https://www.manipalcigna.com",
    websiteDisplay: "www.manipalcigna.com",
    phone: "1800-102-4462",
    phone2: null,
    whatsapp: null,
    email: "customercare@manipalcigna.com",
    lastUpdated: "June 2026",
  },
  {
    id: "aditya-birla-health",
    logo: "/images/companies/aditya-birla-health.png",
    initials: "AB",
    name: "Aditya Birla Health Insurance Co. Ltd.",
    serviceType: "Health Insurance",
    entityType: "Company",
    established: 2015,
    irdaiRegNo: "153",
    website: "https://www.adityabirlacapital.com/healthinsurance",
    websiteDisplay: "www.adityabirlacapital.com",
    phone: "1800-270-7000",
    phone2: null,
    whatsapp: "+91 88288 00035",
    email: "care.healthinsurance@adityabirlacapital.com",
    lastUpdated: "June 2026",
  },
  {
    id: "galaxy-health",
    logo: "/images/companies/galaxy-health.png",
    initials: "GH",
    name: "Galaxy Health Insurance Co. Ltd.",
    serviceType: "Health Insurance",
    entityType: "Company",
    established: 2023,
    irdaiRegNo: "167",
    website: "https://www.galaxyhealth.com",
    websiteDisplay: "www.galaxyhealth.com",
    phone: "1800 203 0007",
    phone2: null,
    whatsapp: null,
    email: "support@galaxyhealth.com",
    lastUpdated: "June 2026",
  },
  {
    id: "narayana-health",
    logo: "/images/companies/narayana-health.png",
    initials: "NH",
    name: "Narayana Health Insurance Ltd.",
    serviceType: "Health Insurance",
    entityType: "Company",
    established: 2023,
    irdaiRegNo: "166",
    website: "https://www.narayanahealth.insurance",
    websiteDisplay: "www.narayanahealth.insurance",
    phone: "1800 203 0234",
    phone2: "+91 98210 34071",
    whatsapp: null,
    email: "support@narayanahealth.insurance",
    lastUpdated: "June 2026",
  },
];

const FILTERS = ["All", "Life", "Health", "General", "Repository", "Governing Body", "Ombudsman"];

const MOBILE_CATEGORIES = [
  { key: "Life",          label: "Life Insurance",      Icon: Heart,     iconBg: "bg-[#FEE2E2]", iconColor: "text-[#DC2626]", filter: (e) => e.serviceType?.toLowerCase().includes("life") },
  { key: "Health",        label: "Health Insurance",    Icon: Shield,    iconBg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]", filter: (e) => e.serviceType?.toLowerCase().includes("health") },
  { key: "General",       label: "General Insurance",   Icon: Building2, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#D97706]", filter: (e) => e.serviceType?.toLowerCase().includes("general") },
  { key: "Repository",    label: "Insurance Repository",Icon: Database,  iconBg: "bg-[#E8F7F7]", iconColor: "text-[#2ab5b5]", filter: (e) => e.entityType === "Repository" },
  { key: "Governing Body",label: "Governing Bodies",    Icon: Landmark,  iconBg: "bg-[#E4EDED]", iconColor: "text-[#0A4A4A]", filter: (e) => e.entityType === "Governing Body" },
  { key: "Ombudsman",     label: "Insurance Ombudsman", Icon: Scale,     iconBg: "bg-[#EFF6FF]", iconColor: "text-[#1D4ED8]", filter: (e) => e.entityType === "Ombudsman" },
];

// ─── Static repository data ───────────────────────────────────────────────────

const REPOSITORIES = [
  {
    id: "nsdl-ir",
    logo: "/images/companies/nsdl-nir.avif",
    initials: "NIR",
    name: "NSDL National Insurance Repository (NIR)",
    entityType: "Repository",
    established: 2013,
    irdaiRegNo: "IRDA/IR/Reg/01/2013",
    website: "https://nir.ndml.in",
    websiteDisplay: "nir.ndml.in",
    phone: "+91-22-4914 2631",
    phone2: "+91-22-4914 2630",
    phoneHours: null,
    email: "helpdesk.nir@ndml.in",
    about:
      "NSDL National Insurance Repository (NIR), operated by NDML, securely stores insurance policies in electronic form and helps policyholders access, manage and retrieve their policies anytime, anywhere across 83 cities via 181 service centres.",
    quickActions: [
      {
        label: "Login to Your Insurance Account",
        description: "Access your e-Insurance account securely",
        href: "https://nironline.ndml.in/NIR/loginPwd.html",
        Icon: Lock,
        iconBg: "bg-[#DCFCE7]",
        iconColor: "text-[#16A34A]",
      },
      {
        label: "Explore Repository Services",
        description: "Explore services offered by NSDL Insurance Repository",
        href: "https://nir.ndml.in",
        Icon: FileText,
        iconBg: "bg-[#EDE9FE]",
        iconColor: "text-[#7C3AED]",
      },
      {
        label: "What is an e-Insurance Account?",
        description: "Learn more about e-Insurance account and its benefits",
        href: "https://nir.ndml.in",
        Icon: BookOpen,
        iconBg: "bg-[#FEF3C7]",
        iconColor: "text-[#D97706]",
      },
    ],
    lastUpdated: "15 June 2026",
  },
];

// ─── Static governing body data ──────────────────────────────────────────────

const GOVERNING_BODIES = [
  {
    id: "irdai",
    logo: "/images/companies/irdai.svg",
    initials: "IR",
    name: "IRDAI",
    fullName: "Insurance Regulatory and Development Authority of India",
    entityType: "Governing Body",
    established: 1999,
    website: "https://www.irdai.gov.in",
    websiteDisplay: "www.irdai.gov.in",
    phone: "155255",
    phoneLabel: "Toll Free Helpline",
    phoneHours: "9:30 AM – 5:30 PM",
    phone2: "011-23682441",
    phone2Label: "General Enquiries",
    phone2Hours: "9:30 AM – 5:30 PM",
    email: "consumer@irdai.gov.in",
    about: "IRDAI is the regulatory body responsible for promoting, regulating and protecting the interests of policyholders and ensuring growth and stability of the insurance industry in India.",
    quickActions: [
      { label: "Explore IRDAI Services",    description: "Know more about IRDAI and its functions",                 href: "https://www.irdai.gov.in",         Icon: Landmark,      iconBg: "bg-[#DBEAFE]", iconColor: "text-[#1D4ED8]" },
      { label: "Circulars & Notifications", description: "Latest circulars, notifications and press releases",      href: "https://www.irdai.gov.in",         Icon: FileText,      iconBg: "bg-[#EDE9FE]", iconColor: "text-[#7C3AED]" },
      { label: "Consumer Education",        description: "Insurance awareness and consumer education materials",     href: "https://www.irdai.gov.in",         Icon: GraduationCap, iconBg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]" },
      { label: "Grievance Redressal",       description: "Learn about your rights and grievance redressal process", href: "https://bimabharosa.irdai.gov.in", Icon: Users,         iconBg: "bg-[#FEE2E2]", iconColor: "text-[#DC2626]" },
      { label: "Insurance Ombudsman",       description: "Information about Insurance Ombudsman Scheme",            href: "https://www.irdai.gov.in",         Icon: BookOpen,      iconBg: "bg-[#CCFBF1]", iconColor: "text-[#0D9488]" },
      { label: "FAQs",                      description: "Frequently asked questions about insurance",              href: "https://www.irdai.gov.in",         Icon: HelpCircle,    iconBg: "bg-[#FEF3C7]", iconColor: "text-[#D97706]" },
    ],
    lastUpdated: "15 May 2024",
  },
  {
    id: "bima-bharosa",
    logo: "/images/companies/bima-bharosa.jpg",
    initials: "BB",
    isCircleLogo: false,
    name: "Bima Bharosa",
    fullName: "IRDAI Integrated Grievance Management System",
    entityType: "Governing Body",
    badges: [
      { Icon: CheckCircle2, label: "Official IRDAI Grievance Portal", style: "green" },
    ],
    metaRows: [
      { Icon: Shield,   label: "Initiative by",    value: "IRDAI (Insurance Regulatory and Development Authority of India)" },
      { Icon: Landmark, label: "Regulatory Body",  value: "IRDAI" },
      { Icon: Globe,    label: "Official Website",  value: "www.bimabharosa.irdai.gov.in", href: "https://bimabharosa.irdai.gov.in" },
    ],
    phone: "155255",
    phoneLabel: "Toll Free Helpline",
    phoneHours: "9:30 AM – 5:30 PM",
    phone2: "011-23682441",
    phone2Label: "General Enquiries",
    phone2Hours: "9:30 AM – 5:30 PM",
    email: "bimabharosa@irdai.gov.in",
    aboutIcon: Info,
    about: "Bima Bharosa is the official grievance redressal portal of IRDAI. Policyholders can register their complaints, track the status and get them resolved through a transparent and time-bound process.",
    quickActionsColumns: 4,
    quickActions: [
      { label: "Register a Complaint",    description: "Lodge your insurance complaint online",                          href: "https://bimabharosa.irdai.gov.in", Icon: FileText,   iconBg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]" },
      { label: "Track Complaint Status",  description: "Track the status of your registered complaint",                  href: "https://bimabharosa.irdai.gov.in", Icon: Search,     iconBg: "bg-[#DBEAFE]", iconColor: "text-[#1D4ED8]" },
      { label: "Complaint Guidelines",    description: "Know about the process, timelines and required documents",        href: "https://bimabharosa.irdai.gov.in", Icon: BookOpen,   iconBg: "bg-[#EDE9FE]", iconColor: "text-[#7C3AED]" },
      { label: "FAQs",                    description: "Find answers to frequently asked questions",                      href: "https://bimabharosa.irdai.gov.in", Icon: HelpCircle, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#D97706]" },
    ],
    tipSection: {
      title: "When to Approach Bima Bharosa?",
      description: "You can approach Bima Bharosa when your grievance is not resolved by your insurance company or if you do not receive a response within 30 days.",
      href: "https://bimabharosa.irdai.gov.in",
    },
    lastUpdated: "15 May 2024",
  },
];

// ─── Static ombudsman data ────────────────────────────────────────────────────

const OMBUDSMAN_OFFICES = [
  {
    id: "ombudsman-hyd",
    entityType: "Ombudsman",
    officeCode: "HYD",
    name: "Hyderabad Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Andhra Pradesh", "Telangana", "Yanam (UT)"],
    address: '6-2-46, 1st Floor, "Moin Court", Lane Opp. Saleem Function Palace, A.C. Guards, Lakdi-ka-pul, Hyderabad – 500 004, Telangana, India',
    phone: "040-23312122",
    phone2: "040-23376599",
    email: "bimalokpal.hyd@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Hyderabad+AC+Guards+500004",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "15 May 2024",
  },
];

const ALL_ENTRIES = [...COMPANIES, ...REPOSITORIES, ...GOVERNING_BODIES, ...OMBUDSMAN_OFFICES];

// ─── CompanyCard ──────────────────────────────────────────────────────────────

function CompanyCard({ company, collapsed = false, onToggle }) {
  const [favorited, setFavorited] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: company.name, url: company.website }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(company.website).catch(() => {});
    }
  };

  const isHealth  = company.serviceType?.includes("Health");
  const isGeneral = company.serviceType?.includes("General");

  const theme = isHealth ? {
    gradient:     "from-[#F0FAFA] via-[#E8F7F7] to-[#D6F1F1]",
    watermark:    "text-[#2ab5b5] opacity-[0.08]",
    waveColor:    "#2ab5b5",
    bottomBar:    "bg-[#0A4A4A]",
    logoBorder:   "border-[#C8E8E8]",
    logoFallback: "bg-[#E8F7F7]",
    badgeBorder:  "border-[#2ab5b5]/40",
    badgeBg:      "bg-[#E8F7F7]",
    badgeIcon:    "text-[#2ab5b5]",
    badgeText:    "text-[#0A4A4A]",
    iconCircle:   "bg-[#E8F7F7]",
    iconColor:    "text-[#2ab5b5]",
    iconHoverBg:  "group-hover:bg-[#0A4A4A]",
    heartHover:   "hover:border-[#2ab5b5] hover:text-[#2ab5b5]",
    heartActive:  "fill-[#2ab5b5] text-[#2ab5b5]",
  } : isGeneral ? {
    gradient:     "from-[#F3F8F8] via-[#EAF2F2] to-[#DDE9E9]",
    watermark:    "text-[#0A4A4A] opacity-[0.06]",
    waveColor:    "#0A4A4A",
    bottomBar:    "bg-[#2ab5b5]",
    logoBorder:   "border-[#C8D8D8]",
    logoFallback: "bg-[#EAF2F2]",
    badgeBorder:  "border-[#0A4A4A]/20",
    badgeBg:      "bg-[#E4EDED]",
    badgeIcon:    "text-[#0A4A4A]",
    badgeText:    "text-[#0A4A4A]",
    iconCircle:   "bg-[#EAF2F2]",
    iconColor:    "text-[#0A4A4A]",
    iconHoverBg:  "group-hover:bg-[#2ab5b5]",
    heartHover:   "hover:border-[#0A4A4A] hover:text-[#0A4A4A]",
    heartActive:  "fill-[#0A4A4A] text-[#0A4A4A]",
  } : {
    gradient:     "from-[#FFFDF5] via-[#FFF8E8] to-[#FFF0CC]",
    watermark:    "text-[#F59E0B] opacity-[0.07]",
    waveColor:    "#F59E0B",
    bottomBar:    "bg-[#0A4A4A]",
    logoBorder:   "border-[#E2DDD4]",
    logoFallback: "bg-[#FFF8E8]",
    badgeBorder:  "border-[#F59E0B]/40",
    badgeBg:      "bg-[#FFFBEB]",
    badgeIcon:    "text-[#F59E0B]",
    badgeText:    "text-[#92400E]",
    iconCircle:   "bg-[#FFF8E8]",
    iconColor:    "text-[#F59E0B]",
    iconHoverBg:  "group-hover:bg-[#0A4A4A]",
    heartHover:   "hover:border-[#F59E0B] hover:text-[#F59E0B]",
    heartActive:  "fill-[#F59E0B] text-[#F59E0B]",
  };

  const shortName = company.name.split(" ").slice(0, 2).join(" ");
  const findAdvisorsUrl = `/dashboard/explore?company=${encodeURIComponent(shortName)}&service=${encodeURIComponent(company.serviceType)}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#E4E2DB] bg-white shadow-[0_4px_20px_rgba(10,74,74,0.08)]">

      {/* ── Section 1: Header ── */}
      <div className={cn("relative overflow-hidden bg-gradient-to-br px-4 pb-7 pt-4 sm:px-5 sm:pt-5", theme.gradient)}>

        {/* Shield watermark */}
        <Shield
          className={cn("pointer-events-none absolute right-4 top-1/2 h-36 w-36 -translate-y-1/2 select-none", theme.watermark)}
          strokeWidth={0.75}
        />

        {/* Accent wave decoration */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-2/3 select-none"
          viewBox="0 0 400 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,38 C80,8 200,48 400,18" stroke={theme.waveColor} strokeWidth="1.5" />
          <path d="M0,48 C80,18 200,58 400,28" stroke={theme.waveColor} strokeWidth="1" opacity="0.45" />
        </svg>

        {/* Bottom accent bar */}
        <div
          className={cn("absolute bottom-0 left-0 right-0 h-2", theme.bottomBar)}
          style={{ borderRadius: "6px 6px 0 0" }}
        />

        {/* Logo + Company info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo — round */}
          <div className={cn("flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border bg-white p-2 shadow-sm sm:h-[100px] sm:w-[100px]", theme.logoBorder)}>
            {imgError ? (
              <div className={cn("flex h-full w-full items-center justify-center rounded-full", theme.logoFallback)}>
                <span className="font-cormorant text-xl font-bold text-[#0A4A4A] sm:text-2xl">{company.initials}</span>
              </div>
            ) : (
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={96}
                height={96}
                className="h-full w-full object-contain"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Company info — takes all remaining width */}
          <div className="min-w-0 flex-1 pt-0.5">

            {/* Name row: name+checkmark on left, buttons on right */}
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="font-cormorant text-[18px] font-bold leading-snug text-[#0A4A4A] sm:text-[21px]">
                  {company.name}{" "}
                  <CheckCircle2 size={15} className="inline-block align-middle text-[#2ab5b5]" strokeWidth={2.5} />
                </h2>
                <div className={cn("mt-0.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5", theme.badgeBorder, theme.badgeBg)}>
                  <CheckCircle2 size={10} className={theme.badgeIcon} strokeWidth={2.5} />
                  <span className={cn("font-poppins text-[9px] font-semibold tracking-wide", theme.badgeText)}>
                    Verified Official Information
                  </span>
                </div>

                {/* Meta rows — inside text column so they sit tight below badge */}
                <div className="mt-1.5 flex flex-col gap-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={10} className="shrink-0 text-[#9CA3AF]" />
                      <span className="font-poppins text-[10px] text-[#6B7280]">
                        Established
                        <span className="ml-1 font-semibold text-[#374151]">{company.established}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield size={10} className="shrink-0 text-[#9CA3AF]" />
                      <span className="font-poppins text-[10px] text-[#6B7280]">
                        IRDAI Reg. No.
                        <span className="ml-1 font-semibold text-[#374151]">{company.irdaiRegNo}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe size={10} className="shrink-0 text-[#9CA3AF]" />
                    <span className="font-poppins text-[10px] text-[#6B7280]">Official Website</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-poppins text-[10px] font-semibold text-[#2ab5b5] hover:underline"
                    >
                      {company.websiteDisplay}
                    </a>
                  </div>
                </div>
              </div>

              {/* Buttons — vertical, inside layout (not absolute) */}
              <div className="flex shrink-0 flex-col gap-1.5 pt-0.5">
                <button
                  onClick={() => setFavorited((f) => !f)}
                  aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                  className={cn("flex h-7 w-7 items-center justify-center rounded-lg border border-[#E4E2DB] bg-white/90 text-[#6B7280] shadow-sm transition-colors", theme.heartHover)}
                >
                  <Heart
                    size={13}
                    strokeWidth={2}
                    className={cn("transition-all", favorited && theme.heartActive)}
                  />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E4E2DB] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#2ab5b5] hover:text-[#2ab5b5]"
                >
                  <Share2 size={12} strokeWidth={2} />
                </button>
                {onToggle && (
                  <button
                    onClick={onToggle}
                    aria-label={collapsed ? "Expand card" : "Collapse card"}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E4E2DB] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
                  >
                    <ChevronDown size={13} strokeWidth={2} className={cn("transition-transform duration-200", !collapsed && "rotate-180")} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!collapsed && (<>

      {/* ── Section 2: Contact grid ── */}
      <div className={cn("grid gap-px bg-[#E4E2DB]", company.whatsapp ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>

        {/* Customer Care — hover on cell, icon flips dark teal */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#F8F6F1]">
          <a
            href={`tel:${company.phone.replace(/\s/g, "")}`}
            aria-label={`Call ${company.name} customer care`}
            className={cn("flex h-10 w-10 items-center justify-center rounded-full transition-colors", theme.iconCircle, theme.iconHoverBg)}
          >
            <Phone size={17} className={cn("transition-colors group-hover:text-white", theme.iconColor)} strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Customer Care</span>
          <div className="flex flex-col gap-0.5">
            <a
              href={`tel:${company.phone.replace(/\s/g, "")}`}
              className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
            >
              {company.phone}
            </a>
            {company.phone2 && (
              <a
                href={`tel:${company.phone2.replace(/\s/g, "")}`}
                className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
              >
                {company.phone2}
              </a>
            )}
          </div>
        </div>

        {/* Email — hover on cell, icon flips dark teal */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#F8F6F1]">
          <a
            href={`mailto:${company.email}`}
            aria-label={`Email ${company.name}`}
            className={cn("flex h-10 w-10 items-center justify-center rounded-full transition-colors", theme.iconCircle, theme.iconHoverBg)}
          >
            <Mail size={17} className={cn("transition-colors group-hover:text-white", theme.iconColor)} strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Customer Care Email</span>
          <a
            href={`mailto:${company.email}`}
            className="break-all font-poppins text-[11px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
          >
            {company.email}
          </a>
        </div>

        {/* WhatsApp — only rendered when company has a WhatsApp number */}
        {company.whatsapp && (
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#F0FDF4]">
          <a
            href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${company.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0FDF4] transition-colors group-hover:bg-[#25D366]"
          >
            <FaWhatsapp size={19} className="text-[#25D366] transition-colors group-hover:text-white" />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">WhatsApp</span>
          <a
            href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#25D366]"
          >
            {company.whatsapp}
          </a>
        </div>
        )}

        {/* 24x7 — informational, no click */}
        <div className="flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", theme.iconCircle)}>
            <Headphones size={17} className={theme.iconColor} strokeWidth={1.75} />
          </span>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Customer Care</span>
          <span className="font-poppins text-[15px] font-bold text-[#0A4A4A]">24 x 7</span>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">(All Days)</span>
        </div>
      </div>

      {/* ── Section 3: Find Advisors ── */}
      <div className="flex flex-col gap-3 bg-[#F8F6F1] px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F4F4] text-[#0A4A4A]">
            <Users size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-poppins text-[13px] font-bold text-[#0A4A4A]">Find Advisors</p>
            <p className="font-poppins text-[11px] leading-relaxed text-[#6B7280]">
              Connect with verified advisors for {shortName} insurance.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 font-poppins text-[10px] text-[#374151]">
              <CheckCircle2 size={11} className="text-[#2ab5b5]" />
              Company: {shortName}
            </span>
            <span className="inline-flex items-center gap-1 font-poppins text-[10px] text-[#374151]">
              <CheckCircle2 size={11} className="text-[#2ab5b5]" />
              Service: {company.serviceType}
            </span>
          </div>
          <Link
            href={findAdvisorsUrl}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0A4A4A] px-5 py-2.5 font-poppins text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Find Advisors <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* ── Section 4: Footer ── */}
      <div className="flex flex-col gap-1.5 border-t border-[#E4E2DB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#E4E2DB] font-poppins text-[9px] font-bold text-[#9CA3AF]">
            i
          </span>
          <p className="font-poppins text-[10px] text-[#9CA3AF]">
            All information is sourced from the official website of the company.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Calendar size={10} className="text-[#9CA3AF]" />
          <span className="font-poppins text-[10px] text-[#9CA3AF]">
            Last Updated:{" "}
            <span className="font-semibold text-[#F59E0B]">{company.lastUpdated}</span>
          </span>
        </div>
      </div>

      </>)}
    </article>
  );
}

// ─── RepositoryCard ───────────────────────────────────────────────────────────

function RepositoryCard({ repo, collapsed = false, onToggle }) {
  const [favorited, setFavorited] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: repo.name, url: repo.website }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(repo.website).catch(() => {});
    }
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#C8E8E8] bg-white shadow-[0_4px_20px_rgba(10,74,74,0.08)]">

      {/* ── Section 1: Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F0FAFA] via-[#E8F7F7] to-[#D4EEEE] px-4 pb-7 pt-4 sm:px-5 sm:pt-5">

        {/* Database watermark */}
        <Database
          className="pointer-events-none absolute right-4 top-1/2 h-36 w-36 -translate-y-1/2 select-none text-[#2ab5b5] opacity-[0.07]"
          strokeWidth={0.75}
        />

        {/* Teal wave decoration */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-2/3 select-none"
          viewBox="0 0 400 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,38 C80,8 200,48 400,18" stroke="#2ab5b5" strokeWidth="1.5" />
          <path d="M0,48 C80,18 200,58 400,28" stroke="#2ab5b5" strokeWidth="1" opacity="0.45" />
        </svg>

        {/* Dark teal bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 bg-[#0A4A4A]"
          style={{ borderRadius: "6px 6px 0 0" }}
        />

        {/* Favorite + Share — absolute top-right */}
        <div className="absolute right-4 top-4 flex gap-1.5 sm:right-5 sm:top-5">
          <button
            onClick={() => setFavorited((f) => !f)}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8E8E8] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#2ab5b5] hover:text-[#2ab5b5]"
          >
            <Heart
              size={13}
              strokeWidth={2}
              className={cn("transition-all", favorited && "fill-[#2ab5b5] text-[#2ab5b5]")}
            />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8E8E8] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#2ab5b5] hover:text-[#2ab5b5]"
          >
            <Share2 size={12} strokeWidth={2} />
          </button>
          {onToggle && (
            <button
              onClick={onToggle}
              aria-label={collapsed ? "Expand card" : "Collapse card"}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8E8E8] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
            >
              <ChevronDown size={13} strokeWidth={2} className={cn("transition-transform duration-200", !collapsed && "rotate-180")} />
            </button>
          )}
        </div>

        {/* Logo + Info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo — circular, teal border */}
          <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border border-[#B2E0E0] bg-white p-2 shadow-sm sm:h-[100px] sm:w-[100px]">
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#E8F7F7]">
                <span className="font-cormorant text-xl font-bold text-[#0A4A4A] sm:text-2xl">{repo.initials}</span>
              </div>
            ) : (
              <Image
                src={repo.logo}
                alt={`${repo.name} logo`}
                width={96}
                height={96}
                className="h-full w-full object-contain"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Info — right padding to clear the absolute buttons */}
          <div className="min-w-0 flex-1 pr-16 pt-0.5 sm:pr-20">
            <h2 className="font-cormorant text-[18px] font-bold leading-snug text-[#0A4A4A] sm:text-[21px]">
              {repo.name}
            </h2>

            {/* Two badges */}
            <div className="mt-1 flex flex-wrap gap-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2ab5b5]/40 bg-white/70 px-2.5 py-0.5">
                <CheckCircle2 size={10} className="text-[#2ab5b5]" strokeWidth={2.5} />
                <span className="font-poppins text-[9px] font-semibold tracking-wide text-[#0A4A4A]">
                  Verified Official Information
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#F59E0B]/40 bg-[#FFFBEB] px-2.5 py-0.5">
                <Shield size={10} className="text-[#F59E0B]" strokeWidth={2.5} />
                <span className="font-poppins text-[9px] font-semibold tracking-wide text-[#92400E]">
                  Authorized by IRDAI
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Calendar size={10} className="shrink-0 text-[#9CA3AF]" />
                <span className="font-poppins text-[10px] text-[#6B7280]">
                  Established
                  <span className="ml-1 font-semibold text-[#374151]">{repo.established}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={10} className="shrink-0 text-[#9CA3AF]" />
                <span className="font-poppins text-[10px] text-[#6B7280]">Official Website</span>
                <a
                  href={repo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-poppins text-[10px] font-semibold text-[#2ab5b5] hover:underline"
                >
                  {repo.websiteDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!collapsed && (<>

      {/* ── Section 2: Contact (3-column) ── */}
      <div className="grid grid-cols-3 gap-px bg-[#E4E2DB]">

        {/* Phone */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#F0FAFA]">
          <a
            href={`tel:${repo.phone.replace(/[\s-]/g, "")}`}
            aria-label={`Call ${repo.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F7F7] transition-colors group-hover:bg-[#0A4A4A]"
          >
            <Phone size={17} className="text-[#2ab5b5] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Customer Care</span>
          <div className="flex flex-col gap-0.5">
            <a
              href={`tel:${repo.phone.replace(/[\s-]/g, "")}`}
              className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
            >
              {repo.phone}
            </a>
            {repo.phone2 && (
              <a
                href={`tel:${repo.phone2.replace(/[\s-]/g, "")}`}
                className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
              >
                {repo.phone2}
              </a>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#F0FAFA]">
          <a
            href={`mailto:${repo.email}`}
            aria-label={`Email ${repo.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F7F7] transition-colors group-hover:bg-[#0A4A4A]"
          >
            <Mail size={17} className="text-[#2ab5b5] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Email Support</span>
          <a
            href={`mailto:${repo.email}`}
            className="break-all font-poppins text-[11px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
          >
            {repo.email}
          </a>
        </div>

        {/* Support */}
        <div className="flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F7F7]">
            <Headphones size={17} className="text-[#2ab5b5]" strokeWidth={1.75} />
          </span>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Support</span>
          <span className="font-poppins text-[12px] font-bold text-[#0A4A4A]">Available</span>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">on website</span>
        </div>
      </div>

      {/* ── Section 3: About ── */}
      <div className="bg-[#F0FAFA] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4EEEE] text-[#0A4A4A]">
            <Database size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-poppins text-[13px] font-bold text-[#0A4A4A]">About {repo.name}</p>
            <p className="mt-0.5 font-poppins text-[11px] leading-relaxed text-[#6B7280]">
              {repo.about}
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 4: Quick Actions ── */}
      <div className="px-4 py-4 sm:px-5">
        <p className="mb-3 font-poppins text-[13px] font-bold text-[#0A4A4A]">Quick Actions</p>
        <div className="flex flex-col gap-2">
          {repo.quickActions.map((action, i) => (
            <a
              key={i}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-[#E4E2DB] px-3.5 py-3 transition-colors hover:border-[#2ab5b5] hover:bg-[#F0FAFA]"
            >
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", action.iconBg)}>
                <action.Icon size={18} className={action.iconColor} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-poppins text-[12px] font-semibold text-[#0A4A4A]">{action.label}</p>
                <p className="font-poppins text-[10px] text-[#6B7280]">{action.description}</p>
              </div>
              <ChevronRight size={14} className="shrink-0 text-[#9CA3AF]" />
            </a>
          ))}
        </div>
      </div>

      {/* ── Section 5: Footer ── */}
      <div className="flex flex-col gap-1.5 border-t border-[#E4E2DB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#E4E2DB] font-poppins text-[9px] font-bold text-[#9CA3AF]">
            i
          </span>
          <p className="font-poppins text-[10px] text-[#9CA3AF]">
            All information is sourced from the official website of the repository.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Calendar size={10} className="text-[#9CA3AF]" />
          <span className="font-poppins text-[10px] text-[#9CA3AF]">
            Last Updated:{" "}
            <span className="font-semibold text-[#F59E0B]">{repo.lastUpdated}</span>
          </span>
        </div>
      </div>

      </>)}
    </article>
  );
}

// ─── GoverningBodyCard ────────────────────────────────────────────────────────

function GoverningBodyCard({ body, collapsed = false, onToggle }) {
  const [favorited, setFavorited] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: body.name, url: body.website }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(body.website).catch(() => {});
    }
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#C8D5D5] bg-white shadow-[0_4px_20px_rgba(10,74,74,0.08)]">

      {/* ── Section 1: Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#EEF3F3] via-[#E4EDED] to-[#D6E5E5] px-4 pb-7 pt-4 sm:px-5 sm:pt-5">

        {/* Landmark watermark */}
        <Landmark
          className="pointer-events-none absolute right-4 top-1/2 h-36 w-36 -translate-y-1/2 select-none text-[#0A4A4A] opacity-[0.06]"
          strokeWidth={0.75}
        />

        {/* Dark teal wave decoration */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-2/3 select-none"
          viewBox="0 0 400 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,38 C80,8 200,48 400,18" stroke="#0A4A4A" strokeWidth="1.5" />
          <path d="M0,48 C80,18 200,58 400,28" stroke="#0A4A4A" strokeWidth="1" opacity="0.35" />
        </svg>

        {/* Dark teal bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 bg-[#0A4A4A]"
          style={{ borderRadius: "6px 6px 0 0" }}
        />

        {/* Favorite + Share — absolute top-right */}
        <div className="absolute right-4 top-4 flex gap-1.5 sm:right-5 sm:top-5">
          <button
            onClick={() => setFavorited((f) => !f)}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
          >
            <Heart
              size={13}
              strokeWidth={2}
              className={cn("transition-all", favorited && "fill-[#0A4A4A] text-[#0A4A4A]")}
            />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
          >
            <Share2 size={12} strokeWidth={2} />
          </button>
          {onToggle && (
            <button
              onClick={onToggle}
              aria-label={collapsed ? "Expand card" : "Collapse card"}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
            >
              <ChevronDown size={13} strokeWidth={2} className={cn("transition-transform duration-200", !collapsed && "rotate-180")} />
            </button>
          )}
        </div>

        {/* Logo + Info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo — circular, muted teal border */}
          <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border border-[#C8D5D5] bg-white p-2 shadow-sm sm:h-[100px] sm:w-[100px]">
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#E4EDED]">
                <span className="font-cormorant text-xl font-bold text-[#0A4A4A] sm:text-2xl">{body.initials}</span>
              </div>
            ) : (
              <Image
                src={body.logo}
                alt={`${body.name} logo`}
                width={96}
                height={96}
                className="h-full w-full object-contain"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Info — right padding to clear the absolute buttons */}
          <div className="min-w-0 flex-1 pr-16 pt-0.5 sm:pr-20">
            <h2 className="font-cormorant text-[24px] font-bold leading-none text-[#0A4A4A] sm:text-[28px]">
              {body.name}
            </h2>
            {body.fullName && (
              <p className="mt-0.5 font-poppins text-[11px] font-medium leading-snug text-[#374151]">
                {body.fullName}
              </p>
            )}

            {/* Two badges */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#2ab5b5]/40 bg-white/70 px-2.5 py-0.5">
                <CheckCircle2 size={10} className="text-[#2ab5b5]" strokeWidth={2.5} />
                <span className="font-poppins text-[9px] font-semibold tracking-wide text-[#0A4A4A]">
                  Verified Official Information
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#3B82F6]/30 bg-[#EFF6FF] px-2.5 py-0.5">
                <Shield size={10} className="text-[#3B82F6]" strokeWidth={2.5} />
                <span className="font-poppins text-[9px] font-semibold tracking-wide text-[#1E3A8A]">
                  Statutory Body under Govt. of India
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Calendar size={10} className="shrink-0 text-[#9CA3AF]" />
                <span className="font-poppins text-[10px] text-[#6B7280]">
                  Established
                  <span className="ml-1 font-semibold text-[#374151]">{body.established}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={10} className="shrink-0 text-[#9CA3AF]" />
                <span className="font-poppins text-[10px] text-[#6B7280]">Official Website</span>
                <a
                  href={body.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-poppins text-[10px] font-semibold text-[#0A4A4A] hover:underline"
                >
                  {body.websiteDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!collapsed && (<>

      {/* ── Section 2: Contact (3-column) ── */}
      <div className="grid grid-cols-3 gap-px bg-[#E4E2DB]">

        {/* Toll Free */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#EEF3F3]">
          <a
            href={`tel:${body.phone.replace(/[\s-]/g, "")}`}
            aria-label={`Call ${body.name} toll free`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EDED] transition-colors group-hover:bg-[#0A4A4A]"
          >
            <Phone size={17} className="text-[#0A4A4A] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">{body.phoneLabel}</span>
          <a
            href={`tel:${body.phone.replace(/[\s-]/g, "")}`}
            className="font-poppins text-[13px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
          >
            {body.phone}
          </a>
          {body.phoneHours && (
            <span className="font-poppins text-[9px] text-[#9CA3AF]">{body.phoneHours}</span>
          )}
        </div>

        {/* Email */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#EEF3F3]">
          <a
            href={`mailto:${body.email}`}
            aria-label={`Email ${body.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EDED] transition-colors group-hover:bg-[#0A4A4A]"
          >
            <Mail size={17} className="text-[#0A4A4A] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Email</span>
          <a
            href={`mailto:${body.email}`}
            className="break-all font-poppins text-[11px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
          >
            {body.email}
          </a>
        </div>

        {/* General Enquiries */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#EEF3F3]">
          <a
            href={`tel:${body.phone2.replace(/[\s-]/g, "")}`}
            aria-label={`Call ${body.name} general enquiries`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EDED] transition-colors group-hover:bg-[#0A4A4A]"
          >
            <Headphones size={17} className="text-[#0A4A4A] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">{body.phone2Label}</span>
          <a
            href={`tel:${body.phone2.replace(/[\s-]/g, "")}`}
            className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
          >
            {body.phone2}
          </a>
          {body.phone2Hours && (
            <span className="font-poppins text-[9px] text-[#9CA3AF]">{body.phone2Hours}</span>
          )}
        </div>
      </div>

      {/* ── Section 3: About ── */}
      <div className="bg-[#EEF3F3] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D6E5E5] text-[#0A4A4A]">
            <Landmark size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-poppins text-[13px] font-bold text-[#0A4A4A]">About {body.name}</p>
            <p className="mt-0.5 font-poppins text-[11px] leading-relaxed text-[#6B7280]">
              {body.about}
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 4: Quick Actions (3×2 grid) ── */}
      <div className="px-4 py-4 sm:px-5">
        <p className="mb-3 font-poppins text-[13px] font-bold text-[#0A4A4A]">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {body.quickActions.map((action, i) => (
            <a
              key={i}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 rounded-xl border border-[#E4E2DB] p-3 transition-colors hover:border-[#0A4A4A] hover:bg-[#EEF3F3]"
            >
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", action.iconBg)}>
                <action.Icon size={18} className={action.iconColor} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-poppins text-[11px] font-semibold leading-snug text-[#0A4A4A]">{action.label}</p>
                <p className="mt-0.5 font-poppins text-[10px] leading-relaxed text-[#6B7280]">{action.description}</p>
              </div>
              <ChevronRight size={13} className="self-end text-[#9CA3AF]" />
            </a>
          ))}
        </div>
      </div>

      {/* ── Section 5: Footer ── */}
      <div className="flex flex-col gap-1.5 border-t border-[#E4E2DB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#E4E2DB] font-poppins text-[9px] font-bold text-[#9CA3AF]">
            i
          </span>
          <p className="font-poppins text-[10px] text-[#9CA3AF]">
            All information is sourced from the official website of {body.name}.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Calendar size={10} className="text-[#9CA3AF]" />
          <span className="font-poppins text-[10px] text-[#9CA3AF]">
            Last Updated:{" "}
            <span className="font-semibold text-[#F59E0B]">{body.lastUpdated}</span>
          </span>
        </div>
      </div>

      </>)}
    </article>
  );
}

// ─── BimaBharosaCard ─────────────────────────────────────────────────────────

function BimaBharosaCard({ body, collapsed = false, onToggle }) {
  const [favorited, setFavorited] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: body.name, url: body.website }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(body.website).catch(() => {});
    }
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#C8D5D5] bg-white shadow-[0_4px_20px_rgba(10,74,74,0.08)]">

      {/* ── Section 1: Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#EEF3F3] via-[#E4EDED] to-[#D6E5E5] px-4 pb-7 pt-4 sm:px-5 sm:pt-5">

        {/* Landmark watermark */}
        <Landmark
          className="pointer-events-none absolute right-4 top-1/2 h-36 w-36 -translate-y-1/2 select-none text-[#0A4A4A] opacity-[0.06]"
          strokeWidth={0.75}
        />

        {/* Dark teal wave */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-2/3 select-none"
          viewBox="0 0 400 50" fill="none" xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none" aria-hidden
        >
          <path d="M0,38 C80,8 200,48 400,18" stroke="#0A4A4A" strokeWidth="1.5" />
          <path d="M0,48 C80,18 200,58 400,28" stroke="#0A4A4A" strokeWidth="1" opacity="0.35" />
        </svg>

        {/* Dark teal bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#0A4A4A]" style={{ borderRadius: "6px 6px 0 0" }} />

        {/* Favorite + Share */}
        <div className="absolute right-4 top-4 flex gap-1.5 sm:right-5 sm:top-5">
          <button
            onClick={() => setFavorited((f) => !f)}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
          >
            <Heart size={13} strokeWidth={2} className={cn("transition-all", favorited && "fill-[#0A4A4A] text-[#0A4A4A]")} />
          </button>
          <button onClick={handleShare} aria-label="Share"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
          >
            <Share2 size={12} strokeWidth={2} />
          </button>
          {onToggle && (
            <button
              onClick={onToggle}
              aria-label={collapsed ? "Expand card" : "Collapse card"}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
            >
              <ChevronDown size={13} strokeWidth={2} className={cn("transition-transform duration-200", !collapsed && "rotate-180")} />
            </button>
          )}
        </div>

        {/* Logo + Info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo — rectangular (logo has wide aspect ratio) */}
          <div className="flex h-[76px] w-[110px] shrink-0 items-center justify-center rounded-2xl border border-[#C8D5D5] bg-white p-2 shadow-sm sm:h-[90px] sm:w-[136px]">
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#E4EDED]">
                <span className="font-cormorant text-xl font-bold text-[#0A4A4A]">{body.initials}</span>
              </div>
            ) : (
              <Image
                src={body.logo}
                alt={`${body.name} logo`}
                width={130}
                height={85}
                className="h-full w-full object-contain"
                onError={() => setImgError(true)}
              />
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 pr-16 pt-0.5 sm:pr-20">
            <h2 className="font-cormorant text-[22px] font-bold leading-tight text-[#0A4A4A] sm:text-[26px]">
              {body.name}
            </h2>
            <p className="mt-0.5 font-poppins text-[11px] font-medium leading-snug text-[#374151]">
              {body.fullName}
            </p>

            {/* Badge */}
            <div className="mt-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#16A34A]/30 bg-[#DCFCE7] px-2.5 py-0.5">
                <CheckCircle2 size={10} className="text-[#16A34A]" strokeWidth={2.5} />
                <span className="font-poppins text-[9px] font-semibold tracking-wide text-[#15803D]">
                  Official IRDAI Grievance Portal
                </span>
              </div>
            </div>

            {/* Meta rows */}
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-start gap-1.5">
                <Shield size={10} className="mt-0.5 shrink-0 text-[#9CA3AF]" />
                <span className="font-poppins text-[10px] text-[#6B7280]">
                  Initiative by{" "}
                  <span className="font-semibold text-[#374151]">IRDAI (Insurance Regulatory and Development Authority of India)</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Landmark size={10} className="shrink-0 text-[#9CA3AF]" />
                <span className="font-poppins text-[10px] text-[#6B7280]">
                  Regulatory Body <span className="ml-1 font-semibold text-[#374151]">IRDAI</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={10} className="shrink-0 text-[#9CA3AF]" />
                <span className="font-poppins text-[10px] text-[#6B7280]">Official Website</span>
                <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noopener noreferrer"
                  className="font-poppins text-[10px] font-semibold text-[#0A4A4A] hover:underline">
                  www.bimabharosa.irdai.gov.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!collapsed && (<>

      {/* ── Section 2: Contact (3-column) ── */}
      <div className="grid grid-cols-3 gap-px bg-[#E4E2DB]">
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#EEF3F3]">
          <a href="tel:155255" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EDED] transition-colors group-hover:bg-[#0A4A4A]">
            <Phone size={17} className="text-[#0A4A4A] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Toll Free Helpline</span>
          <a href="tel:155255" className="font-poppins text-[13px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]">155255</a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">9:30 AM – 5:30 PM</span>
        </div>

        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#EEF3F3]">
          <a href="mailto:bimabharosa@irdai.gov.in" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EDED] transition-colors group-hover:bg-[#0A4A4A]">
            <Mail size={17} className="text-[#0A4A4A] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Email Support</span>
          <a href="mailto:bimabharosa@irdai.gov.in" className="break-all font-poppins text-[10px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]">
            bimabharosa@irdai.gov.in
          </a>
        </div>

        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#EEF3F3]">
          <a href="tel:01123682441" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EDED] transition-colors group-hover:bg-[#0A4A4A]">
            <Headphones size={17} className="text-[#0A4A4A] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">General Enquiries</span>
          <a href="tel:01123682441" className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]">011-23682441</a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">9:30 AM – 5:30 PM</span>
        </div>
      </div>

      {/* ── Section 3: About ── */}
      <div className="bg-[#EEF3F3] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D6E5E5] text-[#0A4A4A]">
            <Info size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-poppins text-[13px] font-bold text-[#0A4A4A]">About Bima Bharosa</p>
            <p className="mt-0.5 font-poppins text-[11px] leading-relaxed text-[#6B7280]">
              Bima Bharosa is the official grievance redressal portal of IRDAI. Policyholders can register their complaints, track the status and get them resolved through a transparent and time-bound process.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 4: Quick Actions (4-column grid) ── */}
      <div className="px-4 py-4 sm:px-5">
        <p className="mb-3 font-poppins text-[13px] font-bold text-[#0A4A4A]">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {body.quickActions.map((action, i) => (
            <a key={i} href={action.href} target="_blank" rel="noopener noreferrer"
              className="flex flex-col gap-2 rounded-xl border border-[#E4E2DB] p-3 transition-colors hover:border-[#0A4A4A] hover:bg-[#EEF3F3]"
            >
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", action.iconBg)}>
                <action.Icon size={18} className={action.iconColor} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-poppins text-[11px] font-semibold leading-snug text-[#0A4A4A]">{action.label}</p>
                <p className="mt-0.5 font-poppins text-[10px] leading-relaxed text-[#6B7280]">{action.description}</p>
              </div>
              <ChevronRight size={13} className="self-end text-[#9CA3AF]" />
            </a>
          ))}
        </div>
      </div>

      {/* ── Section 5: Tip ── */}
      <div className="flex items-start gap-3 border-t border-[#E4E2DB] bg-[#F8F6F1] px-4 py-4 sm:items-center sm:px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D6E5E5] text-[#0A4A4A]">
          <Lightbulb size={18} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-poppins text-[12px] font-bold text-[#0A4A4A]">When to Approach Bima Bharosa?</p>
          <p className="mt-0.5 font-poppins text-[11px] leading-relaxed text-[#6B7280]">
            You can approach Bima Bharosa when your grievance is not resolved by your insurance company or if you do not receive a response within 30 days.
          </p>
        </div>
        <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noopener noreferrer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C8D5D5] bg-white text-[#0A4A4A] transition-colors hover:bg-[#0A4A4A] hover:text-white"
        >
          <ChevronRight size={14} />
        </a>
      </div>

      {/* ── Section 6: Footer ── */}
      <div className="flex flex-col gap-1.5 border-t border-[#E4E2DB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#E4E2DB] font-poppins text-[9px] font-bold text-[#9CA3AF]">i</span>
          <p className="font-poppins text-[10px] text-[#9CA3AF]">All information is sourced from the official website of IRDAI.</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Calendar size={10} className="text-[#9CA3AF]" />
          <span className="font-poppins text-[10px] text-[#9CA3AF]">
            Last Updated: <span className="font-semibold text-[#F59E0B]">{body.lastUpdated}</span>
          </span>
        </div>
      </div>

      </>)}
    </article>
  );
}

// ─── OmbudsmanCard ───────────────────────────────────────────────────────────

function OmbudsmanCard({ office, collapsed = false, onToggle }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#C5D0E0] bg-white shadow-[0_4px_20px_rgba(30,58,138,0.08)]">

      {/* ── Section 1: Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#EEF2F8] via-[#E8EFF8] to-[#DCE8F5] px-4 pb-7 pt-4 sm:px-5 sm:pt-5">

        {/* Wave decoration */}
        <svg className="pointer-events-none absolute bottom-0 left-0 w-2/3 select-none"
          viewBox="0 0 400 50" fill="none" xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none" aria-hidden>
          <path d="M0,38 C80,8 200,48 400,18" stroke="#3B82F6" strokeWidth="1.5" />
          <path d="M0,48 C80,18 200,58 400,28" stroke="#3B82F6" strokeWidth="1" opacity="0.35" />
        </svg>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#1E3A8A]" style={{ borderRadius: "6px 6px 0 0" }} />

        {onToggle && (
          <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
            <button
              onClick={onToggle}
              aria-label={collapsed ? "Expand card" : "Collapse card"}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#BFDBFE] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              <ChevronDown size={13} strokeWidth={2} className={cn("transition-transform duration-200", !collapsed && "rotate-180")} />
            </button>
          </div>
        )}

        <div className="flex items-start gap-3 sm:gap-4">
          {/* City avatar */}
          <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border border-[#BFDBFE] bg-white shadow-sm sm:h-[90px] sm:w-[90px]">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#EFF6FF]">
              <Landmark size={28} className="text-[#1D4ED8]" strokeWidth={1.5} />
              <span className="mt-0.5 font-poppins text-[10px] font-bold text-[#1D4ED8]">{office.officeCode}</span>
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-cormorant text-[20px] font-bold leading-tight text-[#1E3A8A] sm:text-[23px]">
                  {office.name}
                </h2>
                <p className="font-poppins text-[11px] text-[#374151]">{office.subtitle}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-[#16A34A]/30 bg-[#DCFCE7] px-2.5 py-0.5">
                  <CheckCircle2 size={10} className="text-[#16A34A]" strokeWidth={2.5} />
                  <span className="font-poppins text-[9px] font-semibold text-[#15803D]">{office.status}</span>
                </div>
              </div>
              {/* Office Code box */}
              <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#BFDBFE] bg-white px-3 py-2 shadow-sm">
                <Landmark size={16} className="text-[#3B82F6]" strokeWidth={1.5} />
                <span className="mt-0.5 font-poppins text-[9px] text-[#6B7280]">Office Code</span>
                <span className="font-poppins text-[14px] font-bold text-[#1E3A8A]">{office.officeCode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!collapsed && (<>

      {/* ── Section 2: Jurisdiction ── */}
      <div className="border-b border-[#E4E2DB] px-4 py-3 sm:px-5">
        <div className="flex items-start gap-2">
          <Users size={14} className="mt-0.5 shrink-0 text-[#3B82F6]" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="font-poppins text-[11px] font-bold text-[#1E3A8A]">Jurisdiction</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {office.jurisdiction.map((state) => (
                <span key={state} className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-0.5 font-poppins text-[10px] font-semibold text-[#1D4ED8]">
                  {state}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Address ── */}
      <div className="border-b border-[#E4E2DB] px-4 py-3 sm:px-5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
            <MapPin size={15} className="text-[#3B82F6]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-poppins text-[11px] font-bold text-[#374151]">Address</p>
            <p className="mt-0.5 font-poppins text-[11px] leading-relaxed text-[#6B7280]">{office.address}</p>
          </div>
        </div>
      </div>

      {/* ── Section 4: Phone + Email ── */}
      <div className="grid grid-cols-2 gap-px border-b border-[#E4E2DB] bg-[#E4E2DB]">
        <div className="bg-white px-4 py-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
              <Phone size={14} className="text-[#16A34A]" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-poppins text-[11px] font-bold text-[#374151]">Phone</p>
              <a href={`tel:${office.phone.replace(/[\s-]/g, "")}`} className="mt-0.5 block font-poppins text-[12px] font-semibold text-[#1E3A8A] hover:underline">{office.phone}</a>
              {office.phone2 && (
                <a href={`tel:${office.phone2.replace(/[\s-]/g, "")}`} className="block font-poppins text-[12px] font-semibold text-[#1E3A8A] hover:underline">{office.phone2}</a>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white px-4 py-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE]">
              <Mail size={14} className="text-[#7C3AED]" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-poppins text-[11px] font-bold text-[#374151]">Email</p>
              <a href={`mailto:${office.email}`} className="mt-0.5 block break-all font-poppins text-[11px] font-semibold text-[#1E3A8A] hover:underline">{office.email}</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Office Hours ── */}
      <div className="border-b border-[#E4E2DB] px-4 py-3 sm:px-5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7]">
            <Clock size={14} className="text-[#D97706]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-poppins text-[11px] font-bold text-[#374151]">Office Hours</p>
            <p className="mt-0.5 font-poppins text-[12px] font-semibold text-[#1E3A8A]">{office.officeHours}</p>
            <p className="font-poppins text-[10px] text-[#9CA3AF]">({office.officeHoursNote})</p>
          </div>
        </div>
      </div>

      {/* ── Section 6: Action buttons ── */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3 sm:px-5">
        <a href={office.mapsUrl} target="_blank" rel="noopener noreferrer"
          className="col-span-3 flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 font-poppins text-[12px] font-semibold text-white transition-opacity hover:opacity-90 sm:col-span-1">
          <Map size={14} strokeWidth={2} /> Open in Google Maps
        </a>
        <a href={`tel:${office.phone.replace(/[\s-]/g, "")}`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#16A34A] px-3 py-2.5 font-poppins text-[12px] font-semibold text-[#16A34A] transition-colors hover:bg-[#DCFCE7]">
          <Phone size={13} strokeWidth={2} /> Call Office
        </a>
        <a href={`mailto:${office.email}`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#7C3AED] px-3 py-2.5 font-poppins text-[12px] font-semibold text-[#7C3AED] transition-colors hover:bg-[#EDE9FE]">
          <Mail size={13} strokeWidth={2} /> Send Email
        </a>
      </div>

      {/* ── Section 7: Footer ── */}
      <div className="flex flex-col gap-1.5 border-t border-[#E4E2DB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-1.5">
          <Info size={12} className="shrink-0 text-[#9CA3AF]" />
          <p className="font-poppins text-[10px] text-[#9CA3AF]">
            This office handles insurance complaints from the jurisdiction mentioned above.{" "}
            <a href={office.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="font-semibold text-[#3B82F6] hover:underline">
              Source: {office.sourceDisplay}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Calendar size={10} className="text-[#9CA3AF]" />
          <span className="font-poppins text-[10px] text-[#9CA3AF]">
            Last Updated: <span className="font-semibold text-[#F59E0B]">{office.lastUpdated}</span>
          </span>
        </div>
      </div>

      </>)}
    </article>
  );
}

// ─── Mobile helpers ───────────────────────────────────────────────────────────

function getEntryMeta(entry) {
  if (entry.entityType === "Ombudsman") {
    return { label: entry.officeCode, avatarBg: "bg-[#EFF6FF]", avatarText: "text-[#1D4ED8]", subtitle: entry.subtitle ?? "Insurance Ombudsman" };
  }
  if (entry.entityType === "Repository") {
    return { label: entry.initials, avatarBg: "bg-[#E8F7F7]", avatarText: "text-[#2ab5b5]", subtitle: "Insurance Repository" };
  }
  if (entry.entityType === "Governing Body") {
    return { label: entry.initials, avatarBg: "bg-[#E4EDED]", avatarText: "text-[#0A4A4A]", subtitle: "Governing Body" };
  }
  const isLife = entry.serviceType?.includes("Life");
  const isHealth = entry.serviceType?.includes("Health");
  return {
    label: entry.initials,
    avatarBg: isLife ? "bg-[#FEE2E2]" : isHealth ? "bg-[#DCFCE7]" : "bg-[#FEF3C7]",
    avatarText: isLife ? "text-[#DC2626]" : isHealth ? "text-[#16A34A]" : "text-[#D97706]",
    subtitle: entry.serviceType,
  };
}

function renderCard(entry, { collapsed = false, onToggle } = {}) {
  if (entry.entityType === "Repository") return <RepositoryCard repo={entry} collapsed={collapsed} onToggle={onToggle} />;
  if (entry.id === "bima-bharosa") return <BimaBharosaCard body={entry} collapsed={collapsed} onToggle={onToggle} />;
  if (entry.entityType === "Governing Body") return <GoverningBodyCard body={entry} collapsed={collapsed} onToggle={onToggle} />;
  if (entry.entityType === "Ombudsman") return <OmbudsmanCard office={entry} collapsed={collapsed} onToggle={onToggle} />;
  return <CompanyCard company={entry} collapsed={collapsed} onToggle={onToggle} />;
}

function MobileAccordionItem({ entry, isOpen, onToggle }) {
  return renderCard(entry, { collapsed: !isOpen, onToggle });
}

// ─── Desktop accordion ────────────────────────────────────────────────────────

function DesktopAccordionItem({ entry, isOpen, onToggle }) {
  return renderCard(entry, { collapsed: !isOpen, onToggle });
}

// ─── InsuranceDirectory page ──────────────────────────────────────────────────

export default function InsuranceDirectory() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [mobileCategory, setMobileCategory] = useState(null);
  const [openCardId, setOpenCardId] = useState(null);
  const [openDesktopIds, setOpenDesktopIds] = useState({});
  const toggleDesktop = (id) => setOpenDesktopIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const mobileCat = MOBILE_CATEGORIES.find((c) => c.key === mobileCategory) ?? null;
  const mobileEntries = mobileCat ? ALL_ENTRIES.filter(mobileCat.filter) : [];

  const filtered = ALL_ENTRIES.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Life" && c.serviceType?.toLowerCase().includes("life")) ||
      (activeFilter === "Health" && c.serviceType?.toLowerCase().includes("health")) ||
      (activeFilter === "General" && c.serviceType?.toLowerCase().includes("general")) ||
      (activeFilter === "Repository" && c.entityType === "Repository") ||
      (activeFilter === "Governing Body" && c.entityType === "Governing Body") ||
      (activeFilter === "Ombudsman" && c.entityType === "Ombudsman");
    return matchSearch && matchFilter;
  });

  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8">

      {/* ── DESKTOP ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:block">

        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F4F4] text-[#0A4A4A]">
            <Building2 size={24} strokeWidth={1.75} />
          </div>
          <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
            Insurance Directory
          </h1>
          <p className="mt-2 max-w-xl font-poppins text-sm leading-relaxed text-[#6B7280] sm:text-base">
            Official contact details and verified information for top insurance companies in India.
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl border border-[#E4E2DB] bg-white px-4 py-3 shadow-sm focus-within:border-[#2ab5b5] focus-within:ring-1 focus-within:ring-[#2ab5b5]/20 transition-shadow">
            <Search size={15} className="shrink-0 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by company name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent font-poppins text-[13px] text-[#374151] outline-none placeholder:text-[#9CA3AF]"
            />
          </div>

          {/* Filter chips — single unified row */}
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1 font-poppins text-[11px] font-semibold transition-colors",
                  activeFilter === f
                    ? "bg-[#0A4A4A] text-white"
                    : "border border-[#E4E2DB] bg-white text-[#6B7280] hover:border-[#0A4A4A] hover:text-[#0A4A4A]",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion list */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="mx-auto mb-3 h-12 w-12 text-[#E4E2DB]" strokeWidth={1} />
            <p className="font-poppins text-sm text-[#9CA3AF]">No results match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 items-start gap-2.5">
            {filtered.map((entry) => (
              <DesktopAccordionItem
                key={entry.id}
                entry={entry}
                isOpen={!!openDesktopIds[entry.id]}
                onToggle={() => toggleDesktop(entry.id)}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────── */}
      <div className="lg:hidden">
        {mobileCategory === null ? (

          /* Level 1 — Category tiles */
          <div>
            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F4F4] text-[#0A4A4A]">
                <Building2 size={20} strokeWidth={1.75} />
              </div>
              <h1 className="font-cormorant text-2xl font-bold text-[#0A4A4A] sm:text-3xl">
                Insurance Directory
              </h1>
              <p className="mt-1.5 font-poppins text-[12px] leading-relaxed text-[#6B7280]">
                Official contacts and verified information for insurance companies and bodies in India.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {MOBILE_CATEGORIES.map((cat) => {
                const count = ALL_ENTRIES.filter(cat.filter).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setMobileCategory(cat.key);
                      setOpenCardId(null);
                    }}
                    className="flex w-full items-center gap-3.5 rounded-2xl border border-[#E4E2DB] bg-white px-4 py-3.5 text-left shadow-sm transition-colors active:bg-[#F8F6F1]"
                  >
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", cat.iconBg)}>
                      <cat.Icon size={22} className={cat.iconColor} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-poppins text-[14px] font-semibold text-[#0A4A4A]">{cat.label}</p>
                      <p className="font-poppins text-[11px] text-[#9CA3AF]">
                        {count === 0 ? "Coming soon" : count === 1 ? "1 entry" : `${count} entries`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {count > 0 && (
                        <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#0A4A4A]/10 px-1.5 font-poppins text-[11px] font-bold text-[#0A4A4A]">
                          {count}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-[#9CA3AF]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        ) : (

          /* Level 2 — Accordion list */
          <div>
            {/* Sticky back bar — sits just below the fixed navbar */}
            <div
              className="sticky z-30 -mx-3 mb-4 flex items-center gap-3 border-b border-[#E4E2DB] bg-white/95 px-3 py-2.5 backdrop-blur-sm sm:-mx-4 sm:px-4"
              style={{ top: "calc(3.75rem + env(safe-area-inset-top, 0px))" }}
            >
              <button
                onClick={() => {
                  setMobileCategory(null);
                  setOpenCardId(null);
                }}
                className="flex items-center gap-1.5 rounded-full border border-[#E4E2DB] bg-white px-3 py-1.5 font-poppins text-[12px] font-semibold text-[#0A4A4A] shadow-sm transition-colors active:bg-[#F8F6F1]"
              >
                <ChevronLeft size={14} />
                Back
              </button>
              {mobileCat && (
                <p className="truncate font-poppins text-[13px] font-semibold text-[#0A4A4A]">
                  {mobileCat.label}
                </p>
              )}
            </div>

            {/* Category mini-header */}
            {mobileCat && (
              <div className="mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", mobileCat.iconBg)}>
                    <mobileCat.Icon size={16} className={mobileCat.iconColor} strokeWidth={1.75} />
                  </div>
                  <h2 className="font-cormorant text-xl font-bold text-[#0A4A4A]">{mobileCat.label}</h2>
                </div>
                <p className="mt-1 pl-[2.625rem] font-poppins text-[11px] text-[#9CA3AF]">
                  {mobileEntries.length === 0
                    ? "No entries yet — check back soon."
                    : mobileEntries.length === 1
                    ? "1 entry listed"
                    : `${mobileEntries.length} entries listed`}
                </p>
              </div>
            )}

            {/* Accordion items or empty-state */}
            {mobileEntries.length === 0 && mobileCat ? (
              <div className="py-12 text-center">
                <div className={cn("mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl", mobileCat.iconBg)}>
                  <mobileCat.Icon size={32} className={mobileCat.iconColor} strokeWidth={1.5} />
                </div>
                <p className="font-poppins text-[13px] font-semibold text-[#0A4A4A]">Coming soon</p>
                <p className="mt-1 font-poppins text-[11px] text-[#9CA3AF]">
                  We&apos;re adding more entries. Please check back later.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {mobileEntries.map((entry) => (
                  <MobileAccordionItem
                    key={entry.id}
                    entry={entry}
                    isOpen={openCardId === entry.id}
                    onToggle={() => setOpenCardId((prev) => (prev === entry.id ? null : entry.id))}
                  />
                ))}
              </div>
            )}
          </div>

        )}
      </div>

    </div>
  );
}

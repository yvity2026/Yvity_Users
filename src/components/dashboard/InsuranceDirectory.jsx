"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Database,
  FileText,
  Globe,
  Headphones,
  Heart,
  Lock,
  Mail,
  Phone,
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
];

const FILTERS = ["All", "Life", "Health", "General", "Repository", "Governing Body", "Ombudsman"];

// ─── Static repository data ───────────────────────────────────────────────────

const REPOSITORIES = [
  {
    id: "nsdl-ir",
    logo: "/images/companies/nsdl.png",
    name: "NSDL Insurance Repository",
    entityType: "Repository",
    established: 2013,
    irdaiRegNo: "IRDA/IR/Reg/01/2013",
    website: "https://ir.nsdl.com",
    websiteDisplay: "ir.nsdl.com",
    phone: "022-4886 7000",
    phoneHours: "10:00 AM – 6:00 PM",
    email: "info@nsdl.co.in",
    about:
      "NSDL Insurance Repository securely stores insurance policies in electronic form and helps policyholders access, manage and retrieve their policies anytime, anywhere.",
    quickActions: [
      {
        label: "Login to Your Insurance Account",
        description: "Access your e-Insurance account securely",
        href: "https://einsurance.nsdl.com",
        Icon: Lock,
        iconBg: "bg-[#DCFCE7]",
        iconColor: "text-[#16A34A]",
      },
      {
        label: "Explore Repository Services",
        description: "Explore services offered by NSDL Insurance Repository",
        href: "https://ir.nsdl.com",
        Icon: FileText,
        iconBg: "bg-[#EDE9FE]",
        iconColor: "text-[#7C3AED]",
      },
      {
        label: "What is an e-Insurance Account?",
        description: "Learn more about e-Insurance account and its benefits",
        href: "https://ir.nsdl.com",
        Icon: BookOpen,
        iconBg: "bg-[#FEF3C7]",
        iconColor: "text-[#D97706]",
      },
    ],
    lastUpdated: "15 June 2026",
  },
];

const ALL_ENTRIES = [...COMPANIES, ...REPOSITORIES];

// ─── CompanyCard ──────────────────────────────────────────────────────────────

function CompanyCard({ company }) {
  const [favorited, setFavorited] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: company.name, url: company.website }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(company.website).catch(() => {});
    }
  };

  const shortName = company.name.split(" ").slice(0, 2).join(" ");
  const findAdvisorsUrl = `/dashboard/explore?company=${encodeURIComponent(shortName)}&service=${encodeURIComponent(company.serviceType)}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#E4E2DB] bg-white shadow-[0_4px_20px_rgba(10,74,74,0.08)]">

      {/* ── Section 1: Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E8] to-[#FFF0CC] px-4 pb-7 pt-4 sm:px-5 sm:pt-5">

        {/* Shield watermark */}
        <Shield
          className="pointer-events-none absolute right-4 top-1/2 h-36 w-36 -translate-y-1/2 select-none text-[#F59E0B] opacity-[0.07]"
          strokeWidth={0.75}
        />

        {/* Gold wave decoration */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-2/3 select-none"
          viewBox="0 0 400 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,38 C80,8 200,48 400,18" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M0,48 C80,18 200,58 400,28" stroke="#F59E0B" strokeWidth="1" opacity="0.45" />
        </svg>

        {/* Dark teal bottom bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 bg-[#0A4A4A]"
          style={{ borderRadius: "6px 6px 0 0" }}
        />

        {/* Logo + Company info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo — round */}
          <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border border-[#E2DDD4] bg-white p-2 shadow-sm sm:h-[100px] sm:w-[100px]">
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              width={96}
              height={96}
              className="h-full w-full object-contain"
            />
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
                {/* Verified badge — inside name column so it sits tight below h2,
                    not after the taller buttons column */}
                <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border border-[#F59E0B]/40 bg-[#FFFBEB] px-2.5 py-0.5">
                  <CheckCircle2 size={10} className="text-[#F59E0B]" strokeWidth={2.5} />
                  <span className="font-poppins text-[9px] font-semibold tracking-wide text-[#92400E]">
                    Verified Official Information
                  </span>
                </div>
              </div>

              {/* Buttons — vertical, inside layout (not absolute) */}
              <div className="flex shrink-0 flex-col gap-1.5 pt-0.5">
                <button
                  onClick={() => setFavorited((f) => !f)}
                  aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E4E2DB] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#F59E0B] hover:text-[#F59E0B]"
                >
                  <Heart
                    size={13}
                    strokeWidth={2}
                    className={cn("transition-all", favorited && "fill-[#F59E0B] text-[#F59E0B]")}
                  />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E4E2DB] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#2ab5b5] hover:text-[#2ab5b5]"
                >
                  <Share2 size={12} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Meta rows */}
            <div className="mt-2 flex flex-col gap-1">
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
        </div>
      </div>

      {/* ── Section 2: Contact (4-column grid) ── */}
      <div className="grid grid-cols-2 gap-px bg-[#E4E2DB] sm:grid-cols-4">

        {/* Customer Care — hover on cell, icon flips dark teal */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#F8F6F1]">
          <a
            href={`tel:${company.phone.replace(/\s/g, "")}`}
            aria-label={`Call ${company.name} customer care`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E8] transition-colors group-hover:bg-[#0A4A4A]"
          >
            <Phone size={17} className="text-[#F59E0B] transition-colors group-hover:text-white" strokeWidth={1.75} />
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
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E8] transition-colors group-hover:bg-[#0A4A4A]"
          >
            <Mail size={17} className="text-[#F59E0B] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Customer Care Email</span>
          <a
            href={`mailto:${company.email}`}
            className="break-all font-poppins text-[11px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
          >
            {company.email}
          </a>
        </div>

        {/* WhatsApp — hover on cell, icon flips WhatsApp green */}
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

        {/* 24x7 — informational, no click */}
        <div className="flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8E8]">
            <Headphones size={17} className="text-[#F59E0B]" strokeWidth={1.75} />
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
    </article>
  );
}

// ─── RepositoryCard ───────────────────────────────────────────────────────────

function RepositoryCard({ repo }) {
  const [favorited, setFavorited] = useState(false);

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
        </div>

        {/* Logo + Info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo — circular, teal border */}
          <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border border-[#B2E0E0] bg-white p-2 shadow-sm sm:h-[100px] sm:w-[100px]">
            <Image
              src={repo.logo}
              alt={`${repo.name} logo`}
              width={96}
              height={96}
              className="h-full w-full object-contain"
            />
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
          <a
            href={`tel:${repo.phone.replace(/[\s-]/g, "")}`}
            className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#2ab5b5]"
          >
            {repo.phone}
          </a>
          {repo.phoneHours && (
            <span className="font-poppins text-[9px] text-[#9CA3AF]">{repo.phoneHours}</span>
          )}
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
    </article>
  );
}

// ─── InsuranceDirectory page ──────────────────────────────────────────────────

export default function InsuranceDirectory() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Building2 className="mx-auto mb-3 h-12 w-12 text-[#E4E2DB]" strokeWidth={1} />
          <p className="font-poppins text-sm text-[#9CA3AF]">No results match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filtered.map((entry) =>
            entry.entityType === "Repository" ? (
              <RepositoryCard key={entry.id} repo={entry} />
            ) : (
              <CompanyCard key={entry.id} company={entry} />
            )
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import { Building2, Globe, Mail, MapPin, Phone, Search } from "lucide-react";

// ─── Static company data ──────────────────────────────────────────────────────

const COMPANIES = [
  {
    id: "tata-aia",
    logo: "/images/companies/tata-aia.png",
    name: "TATA AIA Life Insurance Co. Ltd.",
    category: "Life Insurance",
    irdaiRegNo: "110",
    website: "https://www.tataaia.com",
    websiteDisplay: "tataaia.com",
    phone: "1860-266-9966",
    email: "customercare@tataaia.com",
    headOfficeAddress:
      "14th Floor, Tower A, Peninsula Business Park, Senapati Bapat Marg, Lower Parel, Mumbai – 400013, Maharashtra",
  },
  {
    id: "star-health",
    logo: "/images/companies/star-health.png",
    name: "Star Health and Allied Insurance Co. Ltd.",
    category: "Health Insurance",
    irdaiRegNo: "129",
    website: "https://www.starhealth.in",
    websiteDisplay: "starhealth.in",
    phone: "044-69006900",
    email: "support@starhealth.in",
    headOfficeAddress:
      "No. 1, New Tank Street, Valluvarkottam High Road, Nungambakkam, Chennai – 600034, Tamil Nadu",
  },
];

// ─── CompanyCard ──────────────────────────────────────────────────────────────

function CompanyCard({ company }) {
  const {
    logo,
    name,
    category,
    irdaiRegNo,
    website,
    websiteDisplay,
    phone,
    email,
    headOfficeAddress,
  } = company;

  return (
    <article className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-[#E4E2DB] bg-white shadow-[0_2px_12px_rgba(10,74,74,0.06)]">

      {/* ── Section 1: Header ── */}
      <div className="flex items-start gap-4 p-4 sm:p-5">
        {/* Company logo */}
        <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl border border-[#E2DDD4] bg-white p-1.5 shadow-sm">
          <Image
            src={logo}
            alt={`${name} logo`}
            width={56}
            height={56}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Name + IRDAI + Website */}
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-start gap-x-2 gap-y-0.5">
            <h2 className="font-cormorant text-[18px] font-bold leading-tight text-[#0A4A4A] sm:text-[20px]">
              {name}
            </h2>
            <span className="mt-0.5 shrink-0 rounded-full bg-[#E8F4F4] px-2 py-0.5 font-poppins text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0A4A4A]">
              {category}
            </span>
          </div>
          <p className="mt-1 font-poppins text-[11px] text-[#9CA3AF]">
            IRDAI Reg. No.&nbsp;
            <span className="font-semibold text-[#6B7280]">{irdaiRegNo}</span>
          </p>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 font-poppins text-[12px] font-medium text-[#2ab5b5] transition-opacity hover:opacity-75"
          >
            <Globe size={12} strokeWidth={2} aria-hidden />
            {websiteDisplay}
          </a>
        </div>
      </div>

      {/* ── Section 2: Contact ── */}
      <div className="border-t border-[#E4E2DB] px-4 py-3.5 sm:px-5">
        <p className="mb-2.5 font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
          Contact
        </p>
        <div className="flex flex-col gap-2">
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
            className="group flex items-center gap-2.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E8F4F4] text-[#0A4A4A] transition-colors group-hover:bg-[#0A4A4A] group-hover:text-white">
              <Phone size={13} strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-poppins text-[10px] text-[#9CA3AF]">Customer Care</span>
              <span className="font-poppins text-[13px] font-semibold text-[#0A4A4A]">{phone}</span>
            </span>
          </a>
          <a
            href={`mailto:${email}`}
            className="group flex items-center gap-2.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E8F4F4] text-[#0A4A4A] transition-colors group-hover:bg-[#0A4A4A] group-hover:text-white">
              <Mail size={13} strokeWidth={2} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-poppins text-[10px] text-[#9CA3AF]">Email</span>
              <span className="truncate font-poppins text-[13px] font-semibold text-[#0A4A4A]">
                {email}
              </span>
            </span>
          </a>
        </div>
      </div>

      {/* ── Section 3: Head Office ── */}
      <div className="border-t border-[#E4E2DB] px-4 py-3.5 sm:px-5">
        <p className="mb-2 font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
          Head Office
        </p>
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F8F6F1] text-[#6B7280]">
            <Building2 size={13} strokeWidth={2} aria-hidden />
          </span>
          <p className="font-poppins text-[12px] leading-relaxed text-[#6B7280]">
            {headOfficeAddress}
          </p>
        </div>
      </div>

      {/* ── Section 4: Find Nearest Branch (Coming Soon) ── */}
      <div className="border-t border-[#E4E2DB] px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2">
          <p className="font-poppins text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Find Nearest Branch
          </p>
          <span className="rounded-full bg-[#FFF9E8] px-2 py-0.5 font-poppins text-[9px] font-bold uppercase tracking-wide text-[#92400E] ring-1 ring-[#F59E0B]/30">
            Coming Soon
          </span>
        </div>
        <div className="mt-2.5 flex gap-2 opacity-40 pointer-events-none select-none">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#E4E2DB] bg-[#F8F6F1] px-3 py-2">
            <MapPin size={13} className="shrink-0 text-[#9CA3AF]" aria-hidden />
            <input
              type="text"
              placeholder="Enter PIN code"
              disabled
              className="w-full bg-transparent font-poppins text-[12px] text-[#6B7280] placeholder:text-[#9CA3AF] outline-none"
              aria-label="PIN code (coming soon)"
            />
          </div>
          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 rounded-xl bg-[#0A4A4A] px-4 font-poppins text-[12px] font-semibold text-white"
          >
            <Search size={12} aria-hidden />
            Search
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── InsuranceDirectory page component ───────────────────────────────────────

export default function InsuranceDirectory() {
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
          Official contact details, head office addresses, and branch locator for top insurance companies in India.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        {COMPANIES.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>

    </div>
  );
}

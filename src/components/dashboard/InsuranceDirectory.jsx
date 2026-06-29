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
    id: "lic",
    logo: "/images/companies/lic.png",
    initials: "LIC",
    name: "Life Insurance Corporation of India",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 1956,
    irdaiRegNo: "512",
    website: "https://www.licindia.in",
    websiteDisplay: "www.licindia.in",
    phone: "022-6827-6827",
    phone2: "1800-33-4433",
    whatsapp: "+91 89768 62090",
    email: "co_complaints@licindia.com",
    lastUpdated: "June 2026",
  },
  {
    id: "hdfc-life",
    logo: "/images/companies/hdfc-life.png",
    initials: "HL",
    name: "HDFC Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2000,
    irdaiRegNo: "101",
    website: "https://www.hdfclife.com",
    websiteDisplay: "www.hdfclife.com",
    phone: "1860-267-9999",
    phone2: null,
    whatsapp: "+91 82918 90569",
    email: "service@hdfclife.com",
    lastUpdated: "June 2026",
  },
  {
    id: "icici-prudential",
    logo: "/images/companies/icici-prudential.png",
    initials: "IP",
    name: "ICICI Prudential Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2000,
    irdaiRegNo: "105",
    website: "https://www.iciciprulife.com",
    websiteDisplay: "www.iciciprulife.com",
    phone: "1860-266-7766",
    phone2: null,
    whatsapp: "+91 99206 67766",
    email: "claimsupport@iciciprulife.com",
    lastUpdated: "June 2026",
  },
  {
    id: "sbi-life",
    logo: "/images/companies/sbi-life.png",
    initials: "SL",
    name: "SBI Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "111",
    website: "https://www.sbilife.co.in",
    websiteDisplay: "www.sbilife.co.in",
    phone: "1800-267-9090",
    phone2: null,
    whatsapp: "+91 90290 06575",
    email: "info@sbilife.co.in",
    lastUpdated: "June 2026",
  },
  {
    id: "max-life",
    logo: "/images/companies/max-life.png",
    initials: "ML",
    name: "Axis Max Life Insurance Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "104",
    website: "https://www.axismaxlife.com",
    websiteDisplay: "www.axismaxlife.com",
    phone: "1860-120-5577",
    phone2: null,
    whatsapp: "+91 74283 96005",
    email: "service.helpdesk@maxlifeinsurance.com",
    lastUpdated: "June 2026",
  },
  {
    id: "bajaj-allianz-life",
    logo: "/images/companies/bajaj-allianz-life.png",
    initials: "BL",
    name: "Bajaj Allianz Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "116",
    website: "https://www.bajajallianzlife.com",
    websiteDisplay: "www.bajajallianzlife.com",
    phone: "1800-209-7272",
    phone2: null,
    whatsapp: "+91 88067 27272",
    email: "customercare@bajajallianzlife.com",
    lastUpdated: "June 2026",
  },
  {
    id: "kotak-life",
    logo: "/images/companies/kotak-life.png",
    initials: "KL",
    name: "Kotak Mahindra Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "107",
    website: "https://www.kotaklife.com",
    websiteDisplay: "www.kotaklife.com",
    phone: "1800-209-8800",
    phone2: null,
    whatsapp: "+91 93210 03007",
    email: "clientservices.li@kotak.com",
    lastUpdated: "June 2026",
  },
  {
    id: "aditya-birla-sunlife",
    logo: "/images/companies/aditya-birla-sunlife.png",
    initials: "ABSLI",
    name: "Aditya Birla Sun Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2000,
    irdaiRegNo: "109",
    website: "https://lifeinsurance.adityabirlacapital.com",
    websiteDisplay: "lifeinsurance.adityabirlacapital.com",
    phone: "1800-270-7000",
    phone2: null,
    whatsapp: "+91 88288 00040",
    email: "care.lifeinsurance@adityabirlacapital.com",
    lastUpdated: "June 2026",
  },
  {
    id: "pnb-metlife",
    logo: "/images/companies/pnb-metlife.png",
    initials: "PM",
    name: "PNB MetLife India Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "117",
    website: "https://www.pnbmetlife.com",
    websiteDisplay: "www.pnbmetlife.com",
    phone: "1800-425-6969",
    phone2: "+91 80-2650-2244",
    whatsapp: "+91 76698 00577",
    email: "indiaservice@pnbmetlife.co.in",
    lastUpdated: "June 2026",
  },
  {
    id: "indusind-nippon",
    logo: "/images/companies/indusind-nippon.png",
    initials: "IN",
    name: "IndusInd Nippon Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "121",
    website: "https://www.indusindnipponlife.com",
    websiteDisplay: "www.indusindnipponlife.com",
    phone: "1800-102-1010",
    phone2: "1800-102-3330",
    whatsapp: "+91 72088 52700",
    email: "customerservice@indusindnipponlife.com",
    lastUpdated: "June 2026",
  },
  {
    id: "canara-hsbc-life",
    logo: "/images/companies/canara-hsbc-life.png",
    initials: "CHL",
    name: "Canara HSBC Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2008,
    irdaiRegNo: "136",
    website: "https://www.canarahsbclife.com",
    websiteDisplay: "www.canarahsbclife.com",
    phone: "1800-891-0003",
    phone2: "1800-103-0003",
    whatsapp: "+91 91529 98795",
    email: "customerservice@canarahsbclife.in",
    lastUpdated: "June 2026",
  },
  {
    id: "indiafirst-life",
    logo: "/images/companies/indiafirst-life.png",
    initials: "IF",
    name: "IndiaFirst Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2009,
    irdaiRegNo: "143",
    website: "https://www.indiafirstlife.com",
    websiteDisplay: "www.indiafirstlife.com",
    phone: "1800-209-8700",
    phone2: "+91 88288 40199",
    whatsapp: "+91 93222 22266",
    email: "customer.first@indiafirstlife.com",
    lastUpdated: "June 2026",
  },
  {
    id: "ageas-federal",
    logo: "/images/companies/ageas-federal.png",
    initials: "AF",
    name: "Ageas Federal Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2008,
    irdaiRegNo: "135",
    website: "https://www.ageasfederal.com",
    websiteDisplay: "www.ageasfederal.com",
    phone: "1800-209-0502",
    phone2: "022-4168-9000",
    whatsapp: null,
    email: "support@ageasfederal.com",
    lastUpdated: "June 2026",
  },
  {
    id: "shriram-life",
    logo: "/images/companies/shriram-life.png",
    initials: "SRI",
    name: "Shriram Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2005,
    irdaiRegNo: "128",
    website: "https://www.shriramlife.com",
    websiteDisplay: "www.shriramlife.com",
    phone: "1800-103-6116",
    phone2: "1800-103-2671",
    whatsapp: null,
    email: "customercare@shriramlife.in",
    lastUpdated: "June 2026",
  },
  {
    id: "generali-central-life",
    logo: "/images/companies/generali-central-life.png",
    initials: "GCL",
    name: "Generali Central Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2007,
    irdaiRegNo: "133",
    website: "https://www.generalicentrallife.com",
    websiteDisplay: "www.generalicentrallife.com",
    phone: "1800-102-2355",
    phone2: null,
    whatsapp: "+91 81081 98633",
    email: "care@generalicentral.com",
    lastUpdated: "June 2026",
  },
  {
    id: "sud-life",
    logo: "/images/companies/sud-life.png",
    initials: "SUD",
    name: "Star Union Dai-ichi Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2009,
    irdaiRegNo: "142",
    website: "https://www.sudlife.in",
    websiteDisplay: "www.sudlife.in",
    phone: "1800-266-8833",
    phone2: "022-3954-6300",
    whatsapp: "+91 72088 67122",
    email: "customercare@sudlife.in",
    lastUpdated: "June 2026",
  },
  {
    id: "aviva-life",
    logo: "/images/companies/aviva-life.png",
    initials: "AV",
    name: "Aviva Life Insurance Company India Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2002,
    irdaiRegNo: "122",
    website: "https://www.avivaindia.com",
    websiteDisplay: "www.avivaindia.com",
    phone: "1800-103-7766",
    phone2: null,
    whatsapp: "+91 98731 49080",
    email: "customerservices@avivaindia.com",
    lastUpdated: "June 2026",
  },
  {
    id: "bharti-axa-life",
    logo: "/images/companies/bharti-axa-life.png",
    initials: "BA",
    name: "Bharti AXA Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2006,
    irdaiRegNo: "130",
    website: "https://www.bhartiaxa.com",
    websiteDisplay: "www.bhartiaxa.com",
    phone: "1800-102-4444",
    phone2: null,
    whatsapp: null,
    email: "service@bhartiaxa.com",
    lastUpdated: "June 2026",
  },
  {
    id: "bandhan-life",
    logo: "/images/companies/bandhan-life.png",
    initials: "BDL",
    name: "Bandhan Life Insurance Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2008,
    irdaiRegNo: "138",
    website: "https://www.bandhanlife.com",
    websiteDisplay: "www.bandhanlife.com",
    phone: "1800-209-9090",
    phone2: null,
    whatsapp: "+91 98674 52226",
    email: "customer.care@bandhanlife.com",
    lastUpdated: "June 2026",
  },
  {
    id: "pramerica-life",
    logo: "/images/companies/pramerica-life.png",
    initials: "PL",
    name: "Pramerica Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2008,
    irdaiRegNo: "140",
    website: "https://pramericalife.in",
    websiteDisplay: "pramericalife.in",
    phone: "1860-500-7070",
    phone2: null,
    whatsapp: "+91 92891 87070",
    email: "contactus@pramericalife.in",
    lastUpdated: "June 2026",
  },
  {
    id: "edelweiss-life",
    logo: "/images/companies/edelweiss-life.png",
    initials: "EL",
    name: "Edelweiss Life Insurance Company Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2011,
    irdaiRegNo: "147",
    website: "https://www.edelweisslife.in",
    websiteDisplay: "www.edelweisslife.in",
    phone: "1800-2121-212",
    phone2: null,
    whatsapp: "+91 98335 21212",
    email: "care@edelweisslife.in",
    lastUpdated: "June 2026",
  },
  {
    id: "creditaccess-life",
    logo: "/images/companies/creditaccess-life.png",
    initials: "CAL",
    name: "CreditAccess Life Insurance Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2019,
    irdaiRegNo: "163",
    website: "https://creditaccesslife.in",
    websiteDisplay: "creditaccesslife.in",
    phone: "1800-569-0801",
    phone2: null,
    whatsapp: null,
    email: "contact@calife.in",
    lastUpdated: "June 2026",
  },
  {
    id: "acko-life",
    logo: "/images/companies/acko-life.png",
    initials: "ACK",
    name: "Acko Life Insurance Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2022,
    irdaiRegNo: "164",
    website: "https://www.acko.com/life",
    websiteDisplay: "www.acko.com/life",
    phone: "1800-210-1992",
    phone2: null,
    whatsapp: null,
    email: "hello@acko.com",
    lastUpdated: "June 2026",
  },
  {
    id: "go-digit-life",
    logo: "/images/companies/go-digit-life.png",
    initials: "GDL",
    name: "Go Digit Life Insurance Limited",
    serviceType: "Life Insurance",
    entityType: "Company",
    established: 2023,
    irdaiRegNo: "165",
    website: "https://www.godigit.com",
    websiteDisplay: "www.godigit.com",
    phone: "1800-296-2626",
    phone2: null,
    whatsapp: "+91 99601 26126",
    email: "life@godigit.com",
    lastUpdated: "June 2026",
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
    id: "hdfc-ergo",
    logo: "/images/companies/hdfc-ergo.png",
    initials: "HE",
    name: "HDFC ERGO General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2002,
    irdaiRegNo: "146",
    website: "https://www.hdfcergo.com",
    websiteDisplay: "www.hdfcergo.com",
    phone: "022-6234-6234",
    phone2: "8000-829-0829",
    whatsapp: "+91 81695 00500",
    email: "care@hdfcergo.com",
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
  {
    id: "new-india-assurance",
    logo: "/images/companies/new-india-assurance.png",
    initials: "NIA",
    name: "The New India Assurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 1919,
    irdaiRegNo: "190",
    website: "https://www.newindia.co.in",
    websiteDisplay: "www.newindia.co.in",
    phone: "1800-209-1415",
    phone2: null,
    whatsapp: null,
    email: "ho@newindia.co.in",
    lastUpdated: "June 2026",
  },
  {
    id: "united-india",
    logo: "/images/companies/united-india.png",
    initials: "UII",
    name: "United India Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 1938,
    irdaiRegNo: "545",
    website: "https://www.uiic.co.in",
    websiteDisplay: "www.uiic.co.in",
    phone: "1800-425-33333",
    phone2: null,
    whatsapp: null,
    email: "customercare@uiic.co.in",
    lastUpdated: "June 2026",
  },
  {
    id: "national-insurance",
    logo: "/images/companies/national-insurance.png",
    initials: "NIC",
    name: "National Insurance Company Limited",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 1906,
    irdaiRegNo: "58",
    website: "https://www.nationalinsuranceindia.nic.in",
    websiteDisplay: "nationalinsuranceindia.nic.in",
    phone: "1800-345-0330",
    phone2: null,
    whatsapp: null,
    email: "customerfeedback@nationalinsuranceindia.nic.in",
    lastUpdated: "June 2026",
  },
  {
    id: "oriental-insurance",
    logo: "/images/companies/oriental-insurance.png",
    initials: "OIC",
    name: "The Oriental Insurance Company Limited",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 1947,
    irdaiRegNo: "556",
    website: "https://www.orientalinsurance.org.in",
    websiteDisplay: "www.orientalinsurance.org.in",
    phone: "1800-118-485",
    phone2: null,
    whatsapp: null,
    email: "customercare@orientalinsurance.org.in",
    lastUpdated: "June 2026",
  },
  {
    id: "bajaj-allianz-general",
    logo: "/images/companies/bajaj-allianz-general.png",
    initials: "BAG",
    name: "Bajaj Allianz General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "113",
    website: "https://www.bajajallianz.com",
    websiteDisplay: "www.bajajallianz.com",
    phone: "1800-209-0144",
    phone2: null,
    whatsapp: "+91 75072 45858",
    email: "bagichelp@bajajallianz.co.in",
    lastUpdated: "June 2026",
  },
  {
    id: "icici-lombard",
    logo: "/images/companies/icici-lombard.png",
    initials: "IL",
    name: "ICICI Lombard General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "115",
    website: "https://www.icicilombard.com",
    websiteDisplay: "www.icicilombard.com",
    phone: "1800-2666",
    phone2: null,
    whatsapp: "+91 98190 91900",
    email: "customersupport@icicilombard.com",
    lastUpdated: "June 2026",
  },
  {
    id: "tata-aig-general",
    logo: "/images/companies/tata-aig-general.png",
    initials: "TAG",
    name: "Tata AIG General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "108",
    website: "https://www.tataaig.com",
    websiteDisplay: "www.tataaig.com",
    phone: "1800-266-7780",
    phone2: null,
    whatsapp: "+91 92890 22222",
    email: "customersupport@tataaig.com",
    lastUpdated: "June 2026",
  },
  {
    id: "sbi-general",
    logo: "/images/companies/sbi-general.png",
    initials: "SBG",
    name: "SBI General Insurance Company Limited",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2009,
    irdaiRegNo: "144",
    website: "https://www.sbigeneral.in",
    websiteDisplay: "www.sbigeneral.in",
    phone: "1800-102-1111",
    phone2: null,
    whatsapp: "+91 70457 22222",
    email: "care@sbigeneral.in",
    lastUpdated: "June 2026",
  },
  {
    id: "reliance-general",
    logo: "/images/companies/reliance-general.png",
    initials: "RGI",
    name: "Reliance General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2000,
    irdaiRegNo: "103",
    website: "https://www.reliancegeneral.co.in",
    websiteDisplay: "www.reliancegeneral.co.in",
    phone: "1800-3009",
    phone2: null,
    whatsapp: null,
    email: "rgic.customerservice@reliancegeneral.co.in",
    lastUpdated: "June 2026",
  },
  {
    id: "go-digit-general",
    logo: "/images/companies/go-digit-general.png",
    initials: "GDG",
    name: "Go Digit General Insurance Limited",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2016,
    irdaiRegNo: "158",
    website: "https://www.godigit.com",
    websiteDisplay: "www.godigit.com",
    phone: "1800-258-5956",
    phone2: null,
    whatsapp: "+91 70199 70000",
    email: "hello@godigit.com",
    lastUpdated: "June 2026",
  },
  {
    id: "cholamandalam-general",
    logo: "/images/companies/cholamandalam-general.png",
    initials: "CHO",
    name: "Cholamandalam MS General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2001,
    irdaiRegNo: "123",
    website: "https://www.cholainsurance.com",
    websiteDisplay: "www.cholainsurance.com",
    phone: "1800-200-5544",
    phone2: null,
    whatsapp: null,
    email: "customercare@cholams.murugappa.com",
    lastUpdated: "June 2026",
  },
  {
    id: "royal-sundaram",
    logo: "/images/companies/royal-sundaram.png",
    initials: "RSG",
    name: "Royal Sundaram General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2000,
    irdaiRegNo: "102",
    website: "https://www.royalsundaram.in",
    websiteDisplay: "www.royalsundaram.in",
    phone: "1860-425-0000",
    phone2: null,
    whatsapp: null,
    email: "query@royalsundaram.in",
    lastUpdated: "June 2026",
  },
  {
    id: "future-generali-general",
    logo: "/images/companies/future-generali-general.png",
    initials: "FGI",
    name: "Future Generali India Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2007,
    irdaiRegNo: "132",
    website: "https://www.futuregenerali.in",
    websiteDisplay: "www.futuregenerali.in",
    phone: "1800-220-233",
    phone2: null,
    whatsapp: null,
    email: "fgcare@futuregenerali.in",
    lastUpdated: "June 2026",
  },
  {
    id: "universal-sompo",
    logo: "/images/companies/universal-sompo.png",
    initials: "USG",
    name: "Universal Sompo General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2007,
    irdaiRegNo: "134",
    website: "https://www.universalsompo.com",
    websiteDisplay: "www.universalsompo.com",
    phone: "1800-200-5142",
    phone2: null,
    whatsapp: null,
    email: "customercare@universalsompo.com",
    lastUpdated: "June 2026",
  },
  {
    id: "shriram-general",
    logo: "/images/companies/shriram-general.png",
    initials: "SGI",
    name: "Shriram General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2008,
    irdaiRegNo: "137",
    website: "https://www.shriramgeneral.com",
    websiteDisplay: "www.shriramgeneral.com",
    phone: "1800-3000-8586",
    phone2: null,
    whatsapp: null,
    email: "helpdesk@shriramgi.com",
    lastUpdated: "June 2026",
  },
  {
    id: "kotak-general",
    logo: "/images/companies/kotak-general.png",
    initials: "KGI",
    name: "Kotak Mahindra General Insurance Co. Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2015,
    irdaiRegNo: "152",
    website: "https://www.kotakgeneral.com",
    websiteDisplay: "www.kotakgeneral.com",
    phone: "1800-266-4545",
    phone2: null,
    whatsapp: null,
    email: "general.insurance@kotak.com",
    lastUpdated: "June 2026",
  },
  {
    id: "liberty-general",
    logo: "/images/companies/liberty-general.png",
    initials: "LGI",
    name: "Liberty General Insurance Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2013,
    irdaiRegNo: "150",
    website: "https://www.libertyinsurance.in",
    websiteDisplay: "www.libertyinsurance.in",
    phone: "1800-2666-400",
    phone2: null,
    whatsapp: null,
    email: "customer.care@libertyinsurance.in",
    lastUpdated: "June 2026",
  },
  {
    id: "zuno-general",
    logo: "/images/companies/zuno-general.png",
    initials: "ZGI",
    name: "Zuno General Insurance Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2009,
    irdaiRegNo: "143",
    website: "https://www.zunoinsurance.com",
    websiteDisplay: "www.zunoinsurance.com",
    phone: "1800-267-2440",
    phone2: null,
    whatsapp: null,
    email: "customersupport@zunoinsurance.com",
    lastUpdated: "June 2026",
  },
  {
    id: "acko-general",
    logo: "/images/companies/acko-general.png",
    initials: "ACK",
    name: "Acko General Insurance Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2016,
    irdaiRegNo: "157",
    website: "https://www.acko.com",
    websiteDisplay: "www.acko.com",
    phone: "1800-266-2256",
    phone2: null,
    whatsapp: null,
    email: "support@acko.com",
    lastUpdated: "June 2026",
  },
  {
    id: "navi-general",
    logo: "/images/companies/navi-general.png",
    initials: "NGI",
    name: "Navi General Insurance Ltd.",
    serviceType: "General Insurance",
    entityType: "Company",
    established: 2016,
    irdaiRegNo: "155",
    website: "https://www.navi.com",
    websiteDisplay: "www.navi.com",
    phone: "1800-123-0004",
    phone2: null,
    whatsapp: null,
    email: "insurance.help@navi.com",
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
  {
    id: "cirl",
    logo: "/images/companies/cirl.png",
    initials: "CIRL",
    name: "Central Insurance Repository Limited (CIRL)",
    entityType: "Repository",
    established: 2013,
    irdaiRegNo: "IRDA/IR/Reg/02/2013",
    website: "https://www.cirlrepository.com",
    websiteDisplay: "www.cirlrepository.com",
    phone: "+91-44-4299 6200",
    phone2: null,
    phoneHours: "10:00 AM – 6:00 PM",
    email: "helpdesk@cirlrepository.com",
    about:
      "Central Insurance Repository Limited (CIRL) is one of four IRDAI-authorised Insurance Repositories in India. It enables policyholders to hold and service all their insurance policies in a single, secure electronic form through a free e-Insurance Account (eIA).",
    quickActions: [
      {
        label: "Login to Your eIA Account",
        description: "Access your e-Insurance account on CIRL",
        href: "https://www.cirlrepository.com",
        Icon: Lock,
        iconBg: "bg-[#DCFCE7]",
        iconColor: "text-[#16A34A]",
      },
      {
        label: "Open an eIA Account",
        description: "Create your free e-Insurance Account with CIRL",
        href: "https://www.cirlrepository.com",
        Icon: FileText,
        iconBg: "bg-[#EDE9FE]",
        iconColor: "text-[#7C3AED]",
      },
      {
        label: "What is an e-Insurance Account?",
        description: "Learn about eIA and its benefits for policyholders",
        href: "https://www.cirlrepository.com",
        Icon: BookOpen,
        iconBg: "bg-[#FEF3C7]",
        iconColor: "text-[#D97706]",
      },
    ],
    lastUpdated: "June 2026",
  },
  {
    id: "cams-repo",
    logo: "/images/companies/cams-repo.png",
    initials: "CAMS",
    name: "CAMS Repository Services Limited",
    entityType: "Repository",
    established: 2013,
    irdaiRegNo: "IRDA/IR/Reg/03/2013",
    website: "https://www.camsrepository.com",
    websiteDisplay: "www.camsrepository.com",
    phone: "1800-3010-6767",
    phone2: null,
    phoneHours: "10:00 AM – 6:00 PM",
    email: "insurancerep@camsonline.com",
    about:
      "CAMS Repository Services Limited (CAMSRep) is an IRDAI-authorised Insurance Repository backed by the CAMS group. It offers a free e-Insurance Account (eIA) to policyholders, enabling electronic storage, retrieval and servicing of all insurance policies in one place.",
    quickActions: [
      {
        label: "Login to Your eIA Account",
        description: "Access your CAMS e-Insurance account securely",
        href: "https://www.camsrepository.com",
        Icon: Lock,
        iconBg: "bg-[#DCFCE7]",
        iconColor: "text-[#16A34A]",
      },
      {
        label: "Open an eIA Account",
        description: "Create your free e-Insurance Account with CAMS",
        href: "https://www.camsrepository.com",
        Icon: FileText,
        iconBg: "bg-[#EDE9FE]",
        iconColor: "text-[#7C3AED]",
      },
      {
        label: "What is an e-Insurance Account?",
        description: "Understand eIA and its benefits",
        href: "https://www.camsrepository.com",
        Icon: BookOpen,
        iconBg: "bg-[#FEF3C7]",
        iconColor: "text-[#D97706]",
      },
    ],
    lastUpdated: "June 2026",
  },
  {
    id: "kfintech-repo",
    logo: "/images/companies/kfintech.png",
    initials: "KFin",
    name: "KFintech Insurance Repository",
    entityType: "Repository",
    established: 2013,
    irdaiRegNo: "IRDA/IR/Reg/04/2013",
    website: "https://ir.kfintech.com",
    websiteDisplay: "ir.kfintech.com",
    phone: "1800-309-4001",
    phone2: null,
    phoneHours: "9:00 AM – 6:00 PM",
    email: "einsurance@kfintech.com",
    about:
      "KFintech Insurance Repository (formerly Karvy Insurance Repository) is an IRDAI-authorised Insurance Repository that provides policyholders a consolidated e-Insurance Account (eIA) for storing and managing all their insurance policies electronically.",
    quickActions: [
      {
        label: "Login to Your eIA Account",
        description: "Access your KFintech e-Insurance account",
        href: "https://ir.kfintech.com",
        Icon: Lock,
        iconBg: "bg-[#DCFCE7]",
        iconColor: "text-[#16A34A]",
      },
      {
        label: "Open an eIA Account",
        description: "Create your free e-Insurance Account with KFintech",
        href: "https://ir.kfintech.com",
        Icon: FileText,
        iconBg: "bg-[#EDE9FE]",
        iconColor: "text-[#7C3AED]",
      },
      {
        label: "What is an e-Insurance Account?",
        description: "Learn about eIA benefits for policyholders",
        href: "https://ir.kfintech.com",
        Icon: BookOpen,
        iconBg: "bg-[#FEF3C7]",
        iconColor: "text-[#D97706]",
      },
    ],
    lastUpdated: "June 2026",
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
  {
    id: "bima-sugam",
    logo: "/images/companies/bima-sugam.png",
    initials: "BS",
    isCircleLogo: false,
    name: "Bima Sugam",
    fullName: "IRDAI's Unified Insurance Marketplace & Policy Repository",
    entityType: "Governing Body",
    badges: [
      { Icon: CheckCircle2, label: "Official IRDAI Initiative", style: "green" },
    ],
    metaRows: [
      { Icon: Shield,   label: "Initiative by",   value: "IRDAI (Insurance Regulatory and Development Authority of India)" },
      { Icon: Landmark, label: "Regulatory Body",  value: "IRDAI" },
      { Icon: Globe,    label: "Official Website", value: "www.bimasugam.com", href: "https://www.bimasugam.com" },
    ],
    phone: null,
    phoneLabel: null,
    phoneHours: null,
    phone2: null,
    phone2Label: null,
    phone2Hours: null,
    email: null,
    aboutIcon: Info,
    about: "Bima Sugam is IRDAI's national digital insurance platform — a single portal where you can browse, compare, and purchase policies from all licensed insurers, store all your active policies in one place, complete eKYC once for all insurers, and initiate claims online. Think of it as a digital locker + marketplace for insurance.",
    quickActionsColumns: 4,
    quickActions: [
      { label: "Browse & Compare Policies",  description: "Search and compare insurance products from all licensed insurers",     href: "https://www.bimasugam.com", Icon: Search,       iconBg: "bg-[#DBEAFE]", iconColor: "text-[#1D4ED8]" },
      { label: "View Your Policies",         description: "See all your active insurance policies in one digital place",          href: "https://www.bimasugam.com", Icon: FileText,     iconBg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]" },
      { label: "Open an eIA Account",        description: "Get an eInsurance Account to store all policies digitally",           href: "https://www.bimasugam.com", Icon: Lock,         iconBg: "bg-[#EDE9FE]", iconColor: "text-[#7C3AED]" },
      { label: "File a Claim Online",        description: "Initiate and track insurance claims through the portal",               href: "https://www.bimasugam.com", Icon: CheckCircle2, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#D97706]" },
    ],
    tipSection: {
      title: "Confused by too many choices?",
      description: "Bima Sugam shows you all available policies — but comparing 40+ similar products, reading fine print, and picking the right coverage for your life stage is harder than it looks. A verified YVITY advisor can shortlist the best options for your needs and explain the terms in plain language, at no extra cost to you.",
      href: "/dashboard/explore",
      hrefLabel: "Find an Advisor on YVITY",
      isInternal: true,
    },
    lastUpdated: "June 2026",
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
    address: '6-2-46, 1st Floor, "Moin Court", Lane Opp. Saleem Function Palace, A.C. Guards, Lakdi-ka-pul, Hyderabad – 500 004',
    phone: "040-23312122",
    phone2: "040-23376599",
    email: "bimalokpal.hyd@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Hyderabad+AC+Guards+500004",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-ahm",
    entityType: "Ombudsman",
    officeCode: "AHM",
    name: "Ahmedabad Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Gujarat", "Dadra & Nagar Haveli", "Daman & Diu"],
    address: "Jeevan Prakash Building, 6th Floor, Tilak Marg, Relief Road, Ahmedabad – 380 001",
    phone: "079-25501201",
    phone2: "079-25501202",
    email: "bimalokpal.ahmedabad@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Ahmedabad+Relief+Road+380001",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-bng",
    entityType: "Ombudsman",
    officeCode: "BNG",
    name: "Bengaluru Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Karnataka"],
    address: "Jeevan Soudha Building, PID No. 57-27-N-19, Ground Floor, 19/19, 24th Main Road, JP Nagar, 1st Phase, Bengaluru – 560 078",
    phone: "080-26652048",
    phone2: "080-26652049",
    email: "bimalokpal.bengaluru@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Bengaluru+JP+Nagar+560078",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-bho",
    entityType: "Ombudsman",
    officeCode: "BHO",
    name: "Bhopal Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Madhya Pradesh", "Chhattisgarh"],
    address: "Janak Vihar Complex, 2nd Floor, 6, Malviya Nagar, Opp. Airtel Office, Near New Market, Bhopal – 462 003",
    phone: "0755-2769201",
    phone2: "0755-2769202",
    email: "bimalokpal.bhopal@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Bhopal+Malviya+Nagar+462003",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-bhu",
    entityType: "Ombudsman",
    officeCode: "BHU",
    name: "Bhubaneswar Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Odisha"],
    address: "62, Forest Park, Bhubaneswar – 751 009",
    phone: "0674-2596461",
    phone2: "0674-2596455",
    email: "bimalokpal.bhubaneswar@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Bhubaneswar+Forest+Park+751009",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-chd",
    entityType: "Ombudsman",
    officeCode: "CHD",
    name: "Chandigarh Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Punjab", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Chandigarh (UT)"],
    address: "S.C.O. No. 101, 102 & 103, 2nd Floor, Batra Building, Sector 17-D, Chandigarh – 160 017",
    phone: "0172-2706196",
    phone2: "0172-2706468",
    email: "bimalokpal.chandigarh@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Chandigarh+Sector+17D+160017",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-che",
    entityType: "Ombudsman",
    officeCode: "CHE",
    name: "Chennai Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Tamil Nadu", "Puducherry (Excl. Yanam)"],
    address: "Fatima Akhtar Court, 4th Floor, 453 (old 312), Anna Salai, Teynampet, Chennai – 600 018",
    phone: "044-24333668",
    phone2: "044-24335284",
    email: "bimalokpal.chennai@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Chennai+Anna+Salai+Teynampet+600018",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-del",
    entityType: "Ombudsman",
    officeCode: "DEL",
    name: "Delhi Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Delhi"],
    address: "2/2 A, Universal Insurance Building, Asaf Ali Road, New Delhi – 110 002",
    phone: "011-23232481",
    phone2: "011-23213504",
    email: "bimalokpal.delhi@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Delhi+Asaf+Ali+Road+110002",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-guw",
    entityType: "Ombudsman",
    officeCode: "GUW",
    name: "Guwahati Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Assam", "Meghalaya", "Manipur", "Mizoram", "Arunachal Pradesh", "Nagaland", "Tripura"],
    address: '"Jeevan Nivesh", 5th Floor, Nr. Panbazar Overbridge, S.S. Road, Guwahati – 781 001',
    phone: "0361-2632204",
    phone2: "0361-2602205",
    email: "bimalokpal.guwahati@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Guwahati+SS+Road+781001",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-jai",
    entityType: "Ombudsman",
    officeCode: "JAI",
    name: "Jaipur Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Rajasthan"],
    address: "Jeevan Nidhi – II Building, 4th Floor, LIC HO Campus, Near Rajmanthan Hotel, C-Scheme, Jaipur – 302 005",
    phone: "0141-2740363",
    phone2: null,
    email: "bimalokpal.jaipur@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Jaipur+C+Scheme+302005",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-koc",
    entityType: "Ombudsman",
    officeCode: "KOC",
    name: "Kochi Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Kerala", "Lakshadweep (UT)", "Mahe (UT)"],
    address: "2nd Floor, Pulinat Building, Opp. Cochin Shipyard, M.G. Road, Ernakulam, Kochi – 682 015",
    phone: "0484-2358759",
    phone2: "0484-2359338",
    email: "bimalokpal.ernakulam@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Kochi+MG+Road+Ernakulam+682015",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-kol",
    entityType: "Ombudsman",
    officeCode: "KOL",
    name: "Kolkata Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["West Bengal", "Sikkim", "Andaman & Nicobar Islands"],
    address: "Hindustan Building Annexe, 4th Floor, 4, C.R. Avenue, Kolkata – 700 072",
    phone: "033-22124339",
    phone2: "033-22987701",
    email: "bimalokpal.kolkata@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Kolkata+CR+Avenue+700072",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-luc",
    entityType: "Ombudsman",
    officeCode: "LUC",
    name: "Lucknow Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Uttar Pradesh (Central & Eastern Districts)", "Uttarakhand"],
    address: "Jeevan Bhawan, Phase-2, 6th Floor, Nawal Kishore Road, Hazratganj, Lucknow – 226 001",
    phone: "0522-2231330",
    phone2: "0522-2231331",
    email: "bimalokpal.lucknow@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Lucknow+Hazratganj+226001",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-mum",
    entityType: "Ombudsman",
    officeCode: "MUM",
    name: "Mumbai Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Goa", "Mumbai Metropolitan Region", "Dadra & Nagar Haveli (part)"],
    address: "3rd Floor, Jeevan Seva Annexe, S.V. Road, Santacruz (W), Mumbai – 400 054",
    phone: "022-26106928",
    phone2: "022-26106960",
    email: "bimalokpal.mumbai@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Mumbai+Santacruz+400054",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-noi",
    entityType: "Ombudsman",
    officeCode: "NOI",
    name: "Noida Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Uttar Pradesh (Western & Northern Districts)"],
    address: "Bhagwan Sahai Palace, 4th Floor, Main Road, Naya Bans, Sector 15, Gautam Budh Nagar, Noida – 201 301",
    phone: "0120-2514250",
    phone2: "0120-2514252",
    email: "bimalokpal.noida@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Noida+Sector+15+201301",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-pat",
    entityType: "Ombudsman",
    officeCode: "PAT",
    name: "Patna Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Bihar", "Jharkhand"],
    address: "1st Floor, Kalpana Arcade Building, Bazar Samiti Road, Bahadurpur, Patna – 800 006",
    phone: "0612-2680952",
    phone2: null,
    email: "bimalokpal.patna@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Patna+Bahadurpur+800006",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
  },
  {
    id: "ombudsman-pun",
    entityType: "Ombudsman",
    officeCode: "PUN",
    name: "Pune Office",
    subtitle: "Insurance Ombudsman",
    status: "Active",
    jurisdiction: ["Maharashtra (Excl. Mumbai Metro)", "Goa (North District)"],
    address: "Jeevan Darshan Building, 3rd Floor, C.T.S. No.s 195 to 198, N.C. Kelkar Road, Narayan Peth, Pune – 411 030",
    phone: "020-32341320",
    phone2: null,
    email: "bimalokpal.pune@cioins.co.in",
    officeHours: "Monday – Friday : 10:00 AM – 5:00 PM",
    officeHoursNote: "Excluding Saturdays, Sundays & Public Holidays",
    mapsUrl: "https://maps.google.com/?q=Insurance+Ombudsman+Pune+Narayan+Peth+411030",
    sourceUrl: "https://www.cioins.co.in",
    sourceDisplay: "cioins.co.in",
    lastUpdated: "May 2024",
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
    gradient:     "from-[#FFFBF0] via-[#FEF3C7] to-[#FDE68A]",
    watermark:    "text-[#D97706] opacity-[0.08]",
    waveColor:    "#D97706",
    bottomBar:    "bg-[#92400E]",
    logoBorder:   "border-[#FCD34D]",
    logoFallback: "bg-[#FEF3C7]",
    badgeBorder:  "border-[#D97706]/40",
    badgeBg:      "bg-[#FEF3C7]",
    badgeIcon:    "text-[#D97706]",
    badgeText:    "text-[#92400E]",
    iconCircle:   "bg-[#FEF3C7]",
    iconColor:    "text-[#D97706]",
    iconHoverBg:  "group-hover:bg-[#92400E]",
    heartHover:   "hover:border-[#D97706] hover:text-[#D97706]",
    heartActive:  "fill-[#D97706] text-[#D97706]",
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
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#BFDBFE] bg-white shadow-[0_4px_20px_rgba(10,74,74,0.08)]">

      {/* ── Section 1: Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] px-4 pb-7 pt-4 sm:px-5 sm:pt-5">

        {/* Database watermark */}
        <Database
          className="pointer-events-none absolute right-4 top-1/2 h-36 w-36 -translate-y-1/2 select-none text-[#1D4ED8] opacity-[0.07]"
          strokeWidth={0.75}
        />

        {/* Blue wave decoration */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-2/3 select-none"
          viewBox="0 0 400 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,38 C80,8 200,48 400,18" stroke="#1D4ED8" strokeWidth="1.5" />
          <path d="M0,48 C80,18 200,58 400,28" stroke="#1D4ED8" strokeWidth="1" opacity="0.45" />
        </svg>

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-2 bg-[#1E3A8A]"
          style={{ borderRadius: "6px 6px 0 0" }}
        />

        {/* Logo + Info */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo — circular, blue border */}
          <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border border-[#93C5FD] bg-white p-2 shadow-sm sm:h-[100px] sm:w-[100px]">
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#EFF6FF]">
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

          {/* Info */}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="font-cormorant text-[18px] font-bold leading-snug text-[#0A4A4A] sm:text-[21px]">
                  {repo.name}
                </h2>

                {/* Two badges */}
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1D4ED8]/30 bg-white/70 px-2.5 py-0.5">
                    <CheckCircle2 size={10} className="text-[#1D4ED8]" strokeWidth={2.5} />
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
                  className="font-poppins text-[10px] font-semibold text-[#1D4ED8] hover:underline"
                >
                  {repo.websiteDisplay}
                </a>
              </div>
            </div>
          </div>

          {/* Buttons — vertical */}
          <div className="flex shrink-0 flex-col gap-1.5 pt-0.5">
            <button
              onClick={() => setFavorited((f) => !f)}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#BFDBFE] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              <Heart size={13} strokeWidth={2} className={cn("transition-all", favorited && "fill-[#1D4ED8] text-[#1D4ED8]")} />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#BFDBFE] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              <Share2 size={12} strokeWidth={2} />
            </button>
            {onToggle && (
              <button
                onClick={onToggle}
                aria-label={collapsed ? "Expand card" : "Collapse card"}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#BFDBFE] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
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

      {/* ── Section 2: Contact (3-column) ── */}
      <div className="grid grid-cols-3 gap-px bg-[#E4E2DB]">

        {/* Phone */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#EFF6FF]">
          <a
            href={`tel:${repo.phone.replace(/[\s-]/g, "")}`}
            aria-label={`Call ${repo.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DBEAFE] transition-colors group-hover:bg-[#1E3A8A]"
          >
            <Phone size={17} className="text-[#1D4ED8] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Customer Care</span>
          <div className="flex flex-col gap-0.5">
            <a
              href={`tel:${repo.phone.replace(/[\s-]/g, "")}`}
              className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#1D4ED8]"
            >
              {repo.phone}
            </a>
            {repo.phone2 && (
              <a
                href={`tel:${repo.phone2.replace(/[\s-]/g, "")}`}
                className="font-poppins text-[12px] font-bold text-[#0A4A4A] transition-colors hover:text-[#1D4ED8]"
              >
                {repo.phone2}
              </a>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="group flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center transition-colors hover:bg-[#EFF6FF]">
          <a
            href={`mailto:${repo.email}`}
            aria-label={`Email ${repo.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DBEAFE] transition-colors group-hover:bg-[#1E3A8A]"
          >
            <Mail size={17} className="text-[#1D4ED8] transition-colors group-hover:text-white" strokeWidth={1.75} />
          </a>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Email Support</span>
          <a
            href={`mailto:${repo.email}`}
            className="break-all font-poppins text-[11px] font-bold text-[#0A4A4A] transition-colors hover:text-[#1D4ED8]"
          >
            {repo.email}
          </a>
        </div>

        {/* Support */}
        <div className="flex flex-col items-center gap-1.5 bg-white px-3 py-4 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DBEAFE]">
            <Headphones size={17} className="text-[#1D4ED8]" strokeWidth={1.75} />
          </span>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">Support</span>
          <span className="font-poppins text-[12px] font-bold text-[#0A4A4A]">Available</span>
          <span className="font-poppins text-[9px] text-[#9CA3AF]">on website</span>
        </div>
      </div>

      {/* ── Section 3: About ── */}
      <div className="bg-[#EFF6FF] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
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
              className="flex items-center gap-3 rounded-xl border border-[#E4E2DB] px-3.5 py-3 transition-colors hover:border-[#1D4ED8] hover:bg-[#EFF6FF]"
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

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
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

              {/* Buttons — vertical */}
              <div className="flex shrink-0 flex-col gap-1.5 pt-0.5">
                <button
                  onClick={() => setFavorited((f) => !f)}
                  aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
                >
                  <Heart size={13} strokeWidth={2} className={cn("transition-all", favorited && "fill-[#0A4A4A] text-[#0A4A4A]")} />
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

          <div className="min-w-0 flex-1 pt-0.5">
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

          <div className="flex shrink-0 flex-col gap-1.5 pt-0.5">
            <button
              onClick={() => setFavorited((f) => !f)}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]"
            >
              <Heart size={13} strokeWidth={2} className={cn("transition-all", favorited && "fill-[#0A4A4A] text-[#0A4A4A]")} />
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
  const [favorited, setFavorited] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: office.name, url: window.location.href }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

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
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
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
              {/* Buttons — vertical */}
              <div className="flex shrink-0 flex-col gap-1.5 pt-0.5">
                <button
                  onClick={() => setFavorited((f) => !f)}
                  aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C5D0E0] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                >
                  <Heart size={13} strokeWidth={2} className={cn("transition-all", favorited && "fill-[#1D4ED8] text-[#1D4ED8]")} />
                </button>
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C5D0E0] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                >
                  <Share2 size={12} strokeWidth={2} />
                </button>
                {onToggle && (
                  <button
                    onClick={onToggle}
                    aria-label={collapsed ? "Expand card" : "Collapse card"}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C5D0E0] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
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

// ─── BimaSugamCard ───────────────────────────────────────────────────────────

function BimaSugamCard({ body, collapsed = false, onToggle }) {
  const [favorited, setFavorited] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleShare = async () => {
    const url = body.metaRows?.find((r) => r.href)?.href ?? window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: body.name, url }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  const websiteRow = body.metaRows?.find((r) => r.href);
  const tip = body.tipSection ?? null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#C8D5D5] bg-white shadow-[0_4px_20px_rgba(10,74,74,0.08)]">

      {/* ── Section 1: Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#EEF3F3] via-[#E4EDED] to-[#D6E5E5] px-4 pb-7 pt-4 sm:px-5 sm:pt-5">
        <Landmark className="pointer-events-none absolute right-4 top-1/2 h-36 w-36 -translate-y-1/2 select-none text-[#0A4A4A] opacity-[0.06]" strokeWidth={0.75} />
        <svg className="pointer-events-none absolute bottom-0 left-0 w-2/3 select-none" viewBox="0 0 400 50" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden>
          <path d="M0,38 C80,8 200,48 400,18" stroke="#0A4A4A" strokeWidth="1.5" />
          <path d="M0,48 C80,18 200,58 400,28" stroke="#0A4A4A" strokeWidth="1" opacity="0.35" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#0A4A4A]" style={{ borderRadius: "6px 6px 0 0" }} />

        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo */}
          <div className="flex h-[76px] w-[110px] shrink-0 items-center justify-center rounded-2xl border border-[#C8D5D5] bg-white p-2 shadow-sm sm:h-[90px] sm:w-[136px]">
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#E4EDED]">
                <span className="font-cormorant text-xl font-bold text-[#0A4A4A]">{body.initials}</span>
              </div>
            ) : (
              <Image src={body.logo} alt={`${body.name} logo`} width={130} height={85} className="h-full w-full object-contain" onError={() => setImgError(true)} />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="font-cormorant text-[22px] font-bold leading-tight text-[#0A4A4A] sm:text-[26px]">{body.name}</h2>
            <p className="mt-0.5 font-poppins text-[11px] font-medium leading-snug text-[#374151]">{body.fullName}</p>

            {/* Badges */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(body.badges ?? []).map((badge, i) => (
                <div key={i} className="inline-flex items-center gap-1.5 rounded-full border border-[#16A34A]/30 bg-[#DCFCE7] px-2.5 py-0.5">
                  <badge.Icon size={10} className="text-[#16A34A]" strokeWidth={2.5} />
                  <span className="font-poppins text-[9px] font-semibold tracking-wide text-[#15803D]">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Meta rows */}
            <div className="mt-2 flex flex-col gap-1">
              {(body.metaRows ?? []).map((row, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <row.Icon size={10} className="mt-0.5 shrink-0 text-[#9CA3AF]" />
                  <span className="font-poppins text-[10px] text-[#6B7280]">
                    {row.label}{" "}
                    {row.href ? (
                      <a href={row.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0A4A4A] hover:underline">{row.value}</a>
                    ) : (
                      <span className="font-semibold text-[#374151]">{row.value}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-col gap-1.5 pt-0.5">
            <button onClick={() => setFavorited((f) => !f)} aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]">
              <Heart size={13} strokeWidth={2} className={cn("transition-all", favorited && "fill-[#0A4A4A] text-[#0A4A4A]")} />
            </button>
            <button onClick={handleShare} aria-label="Share"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]">
              <Share2 size={12} strokeWidth={2} />
            </button>
            {onToggle && (
              <button onClick={onToggle} aria-label={collapsed ? "Expand card" : "Collapse card"}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#C8D5D5] bg-white/90 text-[#6B7280] shadow-sm transition-colors hover:border-[#0A4A4A] hover:text-[#0A4A4A]">
                <ChevronDown size={13} strokeWidth={2} className={cn("transition-transform duration-200", !collapsed && "rotate-180")} />
              </button>
            )}
          </div>
        </div>
      </div>

      {!collapsed && (<>

      {/* ── Section 2: Visit Portal CTA ── */}
      {websiteRow && (
        <div className="flex items-center justify-between border-b border-[#E4E2DB] bg-[#EEF3F3] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Globe size={14} className="shrink-0 text-[#0A4A4A]" strokeWidth={1.75} />
            <span className="font-poppins text-[12px] font-semibold text-[#0A4A4A]">Official Portal</span>
            <span className="font-poppins text-[11px] text-[#6B7280]">{websiteRow.value}</span>
          </div>
          <a href={websiteRow.href} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A4A4A] px-3.5 py-2 font-poppins text-[11px] font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95">
            Visit Bima Sugam <ChevronRight size={12} strokeWidth={2.5} />
          </a>
        </div>
      )}

      {/* ── Section 3: About ── */}
      <div className="bg-[#EEF3F3] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D6E5E5] text-[#0A4A4A]">
            <Info size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-poppins text-[13px] font-bold text-[#0A4A4A]">About {body.name}</p>
            <p className="mt-0.5 font-poppins text-[11px] leading-relaxed text-[#6B7280]">{body.about}</p>
          </div>
        </div>
      </div>

      {/* ── Section 4: Quick Actions ── */}
      {body.quickActions?.length > 0 && (
        <div className="px-4 py-4 sm:px-5">
          <p className="mb-3 font-poppins text-[13px] font-bold text-[#0A4A4A]">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {body.quickActions.map((action, i) => (
              <a key={i} href={action.href} target="_blank" rel="noopener noreferrer"
                className="flex flex-col gap-2 rounded-xl border border-[#E4E2DB] p-3 transition-colors hover:border-[#0A4A4A] hover:bg-[#EEF3F3]">
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
      )}

      {/* ── Section 5: Advisor Tip ── */}
      {tip && (
        <div className="flex items-start gap-3 border-t border-[#E4E2DB] bg-gradient-to-br from-[#EEF8F8] via-[#E4F2F2] to-[#D6EDED] px-4 py-4 sm:px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A4A4A]/10 text-[#0A4A4A]">
            <Lightbulb size={18} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-poppins text-[12px] font-bold text-[#0A4A4A]">{tip.title}</p>
            <p className="mt-0.5 font-poppins text-[11px] leading-relaxed text-[#4B7070]">{tip.description}</p>
            {tip.href && (
              <div className="mt-2.5">
                {tip.isInternal ? (
                  <Link href={tip.href}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A4A4A] px-4 py-2 font-poppins text-[11px] font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95">
                    <Users size={12} strokeWidth={2} /> {tip.hrefLabel ?? "Find an Advisor"} <ChevronRight size={12} strokeWidth={2.5} />
                  </Link>
                ) : (
                  <a href={tip.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A4A4A] px-4 py-2 font-poppins text-[11px] font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95">
                    {tip.hrefLabel ?? "Learn More"} <ChevronRight size={12} strokeWidth={2.5} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Section 6: Footer ── */}
      <div className="flex flex-col gap-1.5 border-t border-[#E4E2DB] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#E4E2DB] font-poppins text-[9px] font-bold text-[#9CA3AF]">i</span>
          <p className="font-poppins text-[10px] text-[#9CA3AF]">All information is sourced from the official IRDAI / Bima Sugam portal.</p>
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

function renderCard(entry, { collapsed = false, onToggle } = {}) {
  if (entry.entityType === "Repository") return <RepositoryCard repo={entry} collapsed={collapsed} onToggle={onToggle} />;
  if (entry.id === "bima-bharosa") return <BimaBharosaCard body={entry} collapsed={collapsed} onToggle={onToggle} />;
  if (entry.id === "bima-sugam") return <BimaSugamCard body={entry} collapsed={collapsed} onToggle={onToggle} />;
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

// ─── Helper: map category key → explore service filter ───────────────────────

function categoryToServiceFilter(key) {
  if (key === "Life") return "Life Insurance";
  if (key === "Health") return "Health Insurance";
  if (key === "General") return "General Insurance";
  return null;
}

// ─── AdvisorNudgeCard ─────────────────────────────────────────────────────────

function AdvisorNudgeCard({ serviceFilter }) {
  const href = serviceFilter
    ? `/dashboard/explore?service=${encodeURIComponent(serviceFilter)}`
    : "/dashboard/explore";

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[#B8D8D8] bg-gradient-to-br from-[#EEF8F8] via-[#E4F2F2] to-[#D6EDED] p-5">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A4A4A]/10">
          <Users size={22} className="text-[#0A4A4A]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-cormorant text-[17px] font-bold leading-snug text-[#0A4A4A]">
            Need help choosing the right policy?
          </p>
          <p className="mt-1 font-poppins text-[11px] leading-relaxed text-[#4B7070]">
            Can&apos;t find what you&apos;re looking for? Connect with a verified insurance advisor near you for personalised guidance.
          </p>
          <Link
            href={href}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#0A4A4A] px-4 py-2.5 font-poppins text-[12px] font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <Users size={13} strokeWidth={2} />
            Find Advisors
            <ChevronRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── InsuranceDirectory page ──────────────────────────────────────────────────

export default function InsuranceDirectory() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  // mobileCategory drives the slide transform; listCategory persists content during back-slide
  const [mobileCategory, setMobileCategory] = useState(null);
  const [listCategory, setListCategory] = useState(null);
  const [openCardId, setOpenCardId] = useState(null);
  const [openDesktopIds, setOpenDesktopIds] = useState({});
  const toggleDesktop = (id) => setOpenDesktopIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const goToCategory = (key) => {
    setListCategory(key);
    setMobileCategory(key);
    setOpenCardId(null);
  };

  const goBack = () => {
    setMobileCategory(null);
    setOpenCardId(null);
    // listCategory intentionally NOT cleared — content stays visible during back-slide
  };

  // List panel uses listCategory so content doesn't disappear mid-animation
  const listCat = MOBILE_CATEGORIES.find((c) => c.key === listCategory) ?? null;
  const listEntries = listCat ? ALL_ENTRIES.filter(listCat.filter) : [];

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

        <AdvisorNudgeCard serviceFilter={categoryToServiceFilter(activeFilter)} />

      </div>

      {/* ── MOBILE ──────────────────────────────────────────────────────── */}
      {/* overflow-hidden clips the off-screen panel; both panels live side-by-side
          in a flex row and the wrapper slides left/right via translateX */}
      <div className="lg:hidden overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out will-change-transform"
          style={{ transform: mobileCategory ? "translateX(-100%)" : "translateX(0%)" }}
        >

          {/* ── Panel 1: Hub ── */}
          <div className="w-full min-w-full">
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
                    onClick={() => goToCategory(cat.key)}
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

          {/* ── Panel 2: Category list ── */}
          <div className="w-full min-w-full" aria-hidden={!mobileCategory}>
            {/* Sticky back bar */}
            <div
              className="sticky z-30 -mx-3 mb-4 flex items-center gap-3 border-b border-[#E4E2DB] bg-white/95 px-3 py-2.5 backdrop-blur-sm sm:-mx-4 sm:px-4"
              style={{ top: "calc(3.75rem + env(safe-area-inset-top, 0px))" }}
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 rounded-full border border-[#E4E2DB] bg-white px-3 py-1.5 font-poppins text-[12px] font-semibold text-[#0A4A4A] shadow-sm transition-colors active:bg-[#F8F6F1]"
              >
                <ChevronLeft size={14} />
                Back
              </button>
              {listCat && (
                <p className="truncate font-poppins text-[13px] font-semibold text-[#0A4A4A]">
                  {listCat.label}
                </p>
              )}
            </div>

            {/* Category mini-header */}
            {listCat && (
              <div className="mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", listCat.iconBg)}>
                    <listCat.Icon size={16} className={listCat.iconColor} strokeWidth={1.75} />
                  </div>
                  <h2 className="font-cormorant text-xl font-bold text-[#0A4A4A]">{listCat.label}</h2>
                </div>
                <p className="mt-1 pl-[2.625rem] font-poppins text-[11px] text-[#9CA3AF]">
                  {listEntries.length === 0
                    ? "No entries yet — check back soon."
                    : listEntries.length === 1
                    ? "1 entry listed"
                    : `${listEntries.length} entries listed`}
                </p>
              </div>
            )}

            {/* Accordion items or empty-state */}
            {listEntries.length === 0 && listCat ? (
              <div className="py-12 text-center">
                <div className={cn("mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl", listCat.iconBg)}>
                  <listCat.Icon size={32} className={listCat.iconColor} strokeWidth={1.5} />
                </div>
                <p className="font-poppins text-[13px] font-semibold text-[#0A4A4A]">Coming soon</p>
                <p className="mt-1 font-poppins text-[11px] text-[#9CA3AF]">
                  We&apos;re adding more entries. Please check back later.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {listEntries.map((entry) => (
                  <MobileAccordionItem
                    key={entry.id}
                    entry={entry}
                    isOpen={openCardId === entry.id}
                    onToggle={() => setOpenCardId((prev) => (prev === entry.id ? null : entry.id))}
                  />
                ))}
              </div>
            )}

            <AdvisorNudgeCard serviceFilter={categoryToServiceFilter(listCat?.key)} />
          </div>

        </div>
      </div>

    </div>
  );
}

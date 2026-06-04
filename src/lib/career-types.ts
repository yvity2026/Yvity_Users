import type { VerificationRecord } from "@/lib/verification/types";

export type RoleSubItem = {
  id: string;
  title: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM or "" for present
  bullets: string[];
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  category: string;
  location: string;
  start: string; // YYYY-MM
  end: string; // YYYY-MM or ""
  bullets: string[];
  subRoles?: RoleSubItem[];
  /**
   * @deprecated Use `verification?.status === "verified"`. Kept for older
   * stored profiles — derived from {@link verification} when both exist.
   */
  verified?: boolean;
  /**
   * Optional YVITY verification record. Experiences can be published without
   * verification; uploading supporting documents lets an admin confirm the
   * role and stamps the public card with a "Verified by YVITY" badge.
   */
  verification?: VerificationRecord;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
  certificateId?: string;
  /**
   * @deprecated Pre-verification-record field. Today the source of truth is
   * `verification?.status`; this is preserved for legacy data and falls back
   * to "pending" when no record exists.
   */
  status: "verified" | "pending";
  bullets: string[];
  /**
   * Optional YVITY verification record — see {@link Experience.verification}.
   */
  verification?: VerificationRecord;
};

export type Education = {
  id: string;
  degree: string;
  specialization?: string;
  institution: string;
  location: string;
  year: string;
};

export type CareerData = {
  experiences: Experience[];
  certifications: Certification[];
  education: Education[];
};

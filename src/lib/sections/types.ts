import type { VerificationRecord } from "@/lib/verification/types";
import type { ServiceLicenseHolder } from "@/lib/advisor/service-license-holder";
import type { ServiceCapacityId } from "@/lib/advisor/serviceCapacity";
import type { ServiceCardDisplay } from "@/lib/advisor/service-card-display";

export type ServiceCategory = "life" | "health" | "general" | "mutual";

export type ServiceArea = {
  label: string;
};

export type ServiceItem = {
  id: string;
  category: ServiceCategory;
  title: string;
  provider: string;
  /**
   * Free-text experience label (e.g. "7+ Years Experience"). Kept for legacy
   * records and as a fallback when `serviceStartDate` is not set. New services
   * created from the editor derive this string automatically from
   * `serviceStartDate` at render time — see `formatExperienceFromStart`.
   */
  experience: string;
  /**
   * Optional ISO date (`YYYY-MM-DD`) the advisor started offering this service.
   * When present, the public card calculates and displays years of experience
   * automatically instead of relying on the static `experience` string.
   */
  serviceStartDate?: string;
  roleLabel: string;
  clients: number;
  claims: number;
  sumInsured: string;
  claimSettled: string;
  claimRatio: number;
  statusMessage: string;
  statusCaption: string;
  areas: ServiceArea[];
  /** @deprecated Replaced by `verification.status`. Kept for backward compat. */
  verified?: boolean;
  /** Mandatory verification record — services without `status === "verified"` are hidden publicly. */
  verification: VerificationRecord;
  /** Optional company / insurer logo (upload or URL). */
  companyLogoUrl?: string;
  /** IRDAI licence holder for this company appointment (setup + admin verified). */
  licenseHolder?: ServiceLicenseHolder;
  /** Account type: individual agent, team leader, or firm. */
  capacityId?: ServiceCapacityId;
  /** Which metric blocks appear on the public service card. */
  cardDisplay?: ServiceCardDisplay;
  /** Optional team / firm metrics (shown when enabled in cardDisplay). */
  teamSize?: number;
  activeAgents?: number;
  branchCount?: number;
  /** When false, item appears in the banner only (e.g. Mutual Funds). */
  showDetailCard?: boolean;
};

export type AchievementCategory = "life" | "health" | "education" | "other";

export type AchievementIconStyle = "trophy" | "ribbon" | "star" | "heart" | "graduation" | "users" | "mdrt";

export type AchievementItem = {
  id: string;
  category: AchievementCategory;
  title: string;
  subtitle: string;
  description: string;
  achievedCount: number;
  years: string[];
  iconStyle: AchievementIconStyle;
  /**
   * @deprecated Use `verification?.status === "verified"`. Kept for legacy
   * achievement data that pre-dates the verification record.
   */
  verified?: boolean;
  /**
   * Optional YVITY verification record. Achievements may be published without
   * verification — uploading documents lets an admin approve and stamps the
   * public card with a "Verified by YVITY" badge.
   */
  verification?: VerificationRecord;
};

export type TestimonialType = "text" | "audio" | "video";

export type TestimonialService = "life" | "health" | "general" | "mutual" | "claim";

export type TestimonialMemberBadge = "yvity-member" | "mobile-verified";

export type TestimonialAdvisorReply = {
  text: string;
  repliedOn: string;
  issueResolved?: boolean;
};

export type TestimonialStatus = "published" | "draft";

export type TestimonialSource = "customer" | "advisor";

export type TestimonialItem = {
  id: string;
  /** Customer submissions are read-only in the dashboard; advisor-seeded entries are editable. */
  source?: TestimonialSource;
  type: TestimonialType;
  service: TestimonialService;
  name: string;
  profession: string;
  location: string;
  quote: string;
  rating: number;
  date: string;
  /** ISO timestamp for FIFO public visibility (customer submissions). */
  submittedAt?: string;
  memberBadge: TestimonialMemberBadge;
  verified?: boolean;
  audioDuration?: string;
  videoDuration?: string;
  /** Public URL for uploaded audio/video (e.g. /api/testimonials/media/…) */
  mediaUrl?: string;
  status?: TestimonialStatus;
  advisorReply?: TestimonialAdvisorReply;
};

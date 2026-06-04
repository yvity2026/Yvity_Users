import type { LeadServiceType } from "@/lib/leads/service-types";

export type LeadOrigin = "self" | "yvity";

export type LeadPriority = "high" | "medium" | "low";

/** Advisor-entered sources only. Platform leads are auto-created. */
export type SelfLeadChannel = "self_manual" | "self_referral";

export type LeadChannel = SelfLeadChannel | "yvity_public_profile";

export type LeadStatus =
  | "new"
  | "interested"
  | "follow_up"
  | "proposal_shared"
  | "converted"
  | "not_interested"
  | "not_contactable";

export type FollowUpType =
  | "call"
  | "whatsapp"
  | "physical_meeting"
  | "online_meeting"
  | "proposal_shared";

export type Lead = {
  id: string;
  origin: LeadOrigin;
  channel: LeadChannel;
  fullName: string;
  mobile: string;
  city?: string;
  serviceType: LeadServiceType;
  priority: LeadPriority;
  status: LeadStatus;
  notes: string;
  followUpType?: FollowUpType;
  followUpDate?: string;
  followUpTime?: string;
  lastActivityAt?: string;
  convertedAt?: string;
  sourceInquiryId?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeadInput = {
  fullName: string;
  mobile: string;
  city?: string;
  channel: SelfLeadChannel;
  serviceType: LeadServiceType;
  priority: LeadPriority;
  notes?: string;
};

export type UpdateLeadInput = Partial<{
  fullName: string;
  mobile: string;
  city: string;
  channel: SelfLeadChannel;
  serviceType: LeadServiceType;
  priority: LeadPriority;
  status: LeadStatus;
  notes: string;
  followUpType: FollowUpType | null;
  followUpDate: string | null;
  followUpTime: string | null;
  lastActivityAt: string;
}>;

export type LeadsOverviewStats = {
  total: number;
  new: number;
  interested: number;
  followUpPending: number;
  converted: number;
  lost: number;
};

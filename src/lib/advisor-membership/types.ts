export type MembershipPlanId = "free" | "silver" | "gold";

export type MembershipStatus = "active" | "expired";

export type PaymentStatus = "paid" | "pending" | "failed";

export type MembershipFeatureId =
  | "public_profile"
  | "services"
  | "career_journey"
  | "education"
  | "testimonials"
  | "gallery"
  | "achievements"
  | "leads"
  | "insights"
  | "verified_badge";

export type MembershipFeature = {
  id: MembershipFeatureId;
  label: string;
};

export type MembershipPlanDefinition = {
  id: MembershipPlanId;
  name: string;
  priceLabel: string;
  priceAnnualInr: number;
  tagline: string;
  features: MembershipFeatureId[];
  highlight?: string;
};

export type PaymentRecord = {
  id: string;
  paidAt: string;
  planName: string;
  amountInr: number;
  status: PaymentStatus;
  invoiceId: string;
};

export type MembershipModel = {
  current: {
    planId: MembershipPlanId;
    planName: string;
    status: MembershipStatus;
    startDate: string;
    expiryDate: string;
    daysRemaining: number;
    showVerifiedBadge: boolean;
  };
  benefits: MembershipFeature[];
  plans: MembershipPlanDefinition[];
  renewal: {
    renewalDate: string;
    expiryDate: string;
    daysRemaining: number;
    showReminder: boolean;
    reminderLevel: "none" | "soon" | "urgent";
  };
  payments: PaymentRecord[];
};

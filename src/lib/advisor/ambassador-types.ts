export type AmbassadorDashboardData = {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  freeReferrals: number;
  pendingRewards: number;
  programActive: boolean;
  rewardsQualifyOn: string[];
  recentReferrals: Array<{
    name: string;
    status: "registered" | "qualified" | "expired" | "invalid";
    planPurchased: string | null;
    registeredAt: string;
  }>;
};

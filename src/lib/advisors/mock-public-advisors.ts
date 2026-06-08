export type PublicAdvisorCard = {
  id: string;
  name: string;
  title: string;
  location: string;
  state: string;
  avatarUrl: string | null;
  showIdentityVerified: boolean;
  showVerifiedBadge: boolean;
  score: number;
  profileUrl: string;
  profileSlug?: string;
  serviceTypes: string[];
  achievementTags: string[];
  companies: string[];
  subscription_plan: string;
  account_status: string;
  isHero: boolean;
  isLanding: boolean;
  exp: string;
  reviews: string;
  avgRating: string;
  recs: string;
  clients: string;
  clientsLabel?: string;
};

/** No seeded advisors — landing/explore use Supabase or an empty state. */
export function getMockPublicAdvisors(): PublicAdvisorCard[] {
  return [];
}

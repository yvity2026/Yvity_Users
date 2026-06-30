export type VaultCategory =
  | "insurance"
  | "investments"
  | "bank_accounts"
  | "fixed_deposits"
  | "loans"
  | "real_estate"
  | "gold"
  | "documents"
  | "nominees";

export const VAULT_CATEGORIES: {
  id: VaultCategory;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "insurance",
    label: "Insurance",
    emoji: "🛡️",
    description: "Life, health, motor & other policies",
  },
  {
    id: "investments",
    label: "Investments",
    emoji: "📈",
    description: "Mutual funds, stocks, PPF, NPS & more",
  },
  {
    id: "bank_accounts",
    label: "Bank Accounts",
    emoji: "🏦",
    description: "Savings, current & salary accounts",
  },
  {
    id: "fixed_deposits",
    label: "Fixed Deposits",
    emoji: "🔒",
    description: "FDs across banks and post office",
  },
  {
    id: "loans",
    label: "Loans",
    emoji: "📋",
    description: "Home, car, personal & education loans",
  },
  {
    id: "real_estate",
    label: "Real Estate",
    emoji: "🏠",
    description: "Property and land holdings",
  },
  {
    id: "gold",
    label: "Gold",
    emoji: "✨",
    description: "Physical gold, digital gold & SGBs",
  },
  {
    id: "documents",
    label: "Important Documents",
    emoji: "📄",
    description: "PAN, Aadhaar, passport & certificates",
  },
  {
    id: "nominees",
    label: "Nominees",
    emoji: "👥",
    description: "Family members listed as nominees",
  },
];

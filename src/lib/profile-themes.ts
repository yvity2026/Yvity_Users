export type ProfileThemeId =
  | "signature-dark"
  | "warm-ivory"
  | "clean-white"
  | "midnight-amber";

export const DEFAULT_PROFILE_THEME_ID: ProfileThemeId = "signature-dark";

export const PROFILE_THEME_IDS: ProfileThemeId[] = [
  "signature-dark",
  "warm-ivory",
  "clean-white",
  "midnight-amber",
];

/** Dark profile themes (system color-scheme + preview thumbnails). */
export function isDarkProfileTheme(id: ProfileThemeId): boolean {
  return id === "signature-dark" || id === "midnight-amber";
}

export type ProfileThemeMeta = {
  id: ProfileThemeId;
  name: string;
  tagline: string;
  isDefault?: boolean;
  preview: {
    background: string;
    card: string;
    accent: string;
    gold: string;
    text: string;
  };
};

export const PROFILE_THEMES: ProfileThemeMeta[] = [
  {
    id: "signature-dark",
    name: "Signature Dark",
    tagline: "Dark premium · Teal & gold · Soft glow",
    isDefault: true,
    preview: {
      background: "oklch(0.18 0.035 235)",
      card: "oklch(0.235 0.04 232)",
      accent: "oklch(0.78 0.13 200)",
      gold: "oklch(0.82 0.16 78)",
      text: "oklch(0.97 0.01 230)",
    },
  },
  {
    id: "warm-ivory",
    name: "Warm Ivory",
    tagline: "Official YVITY brand · Pearl ivory · Teal & saffron · Cormorant + Poppins",
    preview: {
      background: "#F8F6F1",
      card: "#FCFAF6",
      accent: "#0A4A4A",
      gold: "#F59E0B",
      text: "#111827",
    },
  },
  {
    id: "clean-white",
    name: "Clean White",
    tagline: "Pure white · Teal accents · Modern minimal",
    preview: {
      background: "oklch(1 0 0)",
      card: "oklch(0.99 0 0)",
      accent: "oklch(0.48 0.1 200)",
      gold: "oklch(0.72 0.14 78)",
      text: "oklch(0.22 0.04 232)",
    },
  },
  {
    id: "midnight-amber",
    name: "Midnight Amber",
    tagline: "Option D preview · Navy depth · Amber glow",
    preview: {
      background: "#1A1F36",
      card: "#2A3055",
      accent: "#FFB347",
      gold: "#E8821A",
      text: "#ECEEF8",
    },
  },
];

export function isProfileThemeId(value: unknown): value is ProfileThemeId {
  return typeof value === "string" && PROFILE_THEME_IDS.includes(value as ProfileThemeId);
}

export function getProfileThemeMeta(id: ProfileThemeId): ProfileThemeMeta {
  return PROFILE_THEMES.find((t) => t.id === id) ?? PROFILE_THEMES[0];
}

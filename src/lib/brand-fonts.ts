import { Cormorant_Garamond, DM_Sans, Poppins } from "next/font/google";

/** Loaded globally; applied only under `[data-profile-theme="warm-ivory"]`. */
export const fontCormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const fontDmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const fontPoppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const brandFontClassName = [
  fontCormorant.variable,
  fontDmSans.variable,
  fontPoppins.variable,
].join(" ");

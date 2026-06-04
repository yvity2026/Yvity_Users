"use client";

/**
 * Wrapper so LandingPage can pass keyed children into LandingMobileExperience.
 * The `key` on this element is what React uses for the section list.
 */
export default function LandingMobileSectionSlot({ sectionId, children }) {
  return <>{children}</>;
}

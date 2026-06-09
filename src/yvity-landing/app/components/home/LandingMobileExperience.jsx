"use client";

import { Children, isValidElement } from "react";
import LandingMobileBackBar from "./LandingMobileBackBar";
import LandingSectionHub from "./LandingSectionHub";
import { useLandingMobileNav } from "./LandingMobileNavContext";
import { MOBILE_LANDING_SECTIONS } from "./mobileLandingSections";
import { cn } from "@/lib/utils";

const MOBILE_PANEL_IDS = new Set(
  MOBILE_LANDING_SECTIONS.map((section) => section.id),
);

function LandingPanel({ activePanel, panelId, children, className }) {
  const isActive = activePanel === panelId;

  return (
    <div className={cn(isActive ? "block" : "hidden", "lg:block", className)}>
      <div
        key={isActive ? `show-${panelId}` : `hide-${panelId}`}
        className={cn(
          isActive &&
            "max-lg:animate-in max-lg:fade-in max-lg:duration-200 max-lg:motion-reduce:animate-none",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function resolveSectionId(child) {
  if (!isValidElement(child)) return null;
  if (child.key && String(child.key) !== "") {
    return String(child.key).replace(/^\.\$/, "");
  }
  return child.props?.sectionId ?? null;
}

/**
 * @param {object} props
 * @param {import("react").ReactNode} props.home
 * @param {import("react").ReactNode} [props.footer]
 * @param {import("react").ReactNode} [props.children] — keyed LandingMobileSectionSlot elements from LandingPage
 */
export default function LandingMobileExperience({ home, footer, children }) {
  const { activePanel } = useLandingMobileNav();
  const sectionSlots = Children.toArray(children);

  return (
    <>
      <LandingPanel activePanel={activePanel} panelId="home">
        {home}
        <LandingSectionHub />
      </LandingPanel>

      {sectionSlots.map((slot) => {
        const id = resolveSectionId(slot);
        if (!id) return null;

        const isMobilePanel = MOBILE_PANEL_IDS.has(id);

        if (!isMobilePanel) {
          return (
            <div key={id} className="hidden lg:block">
              {slot}
            </div>
          );
        }

        return (
          <LandingPanel key={id} activePanel={activePanel} panelId={id}>
            <LandingMobileBackBar sectionId={id} />
            {slot}
          </LandingPanel>
        );
      })}

      {footer ? (
        <LandingPanel activePanel={activePanel} panelId="home">
          {footer}
        </LandingPanel>
      ) : null}
    </>
  );
}

"use client";

import { Children, isValidElement } from "react";
import LandingMobileBackBar from "./LandingMobileBackBar";
import LandingSectionHub from "./LandingSectionHub";
import { useLandingMobileNav } from "./LandingMobileNavContext";
import { MOBILE_LANDING_SECTIONS } from "./mobileLandingSections";

const MOBILE_PANEL_IDS = new Set(
  MOBILE_LANDING_SECTIONS.map((section) => section.id),
);

function panelVisibility(activePanel, panelId) {
  return activePanel === panelId ? "block" : "hidden lg:block";
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
      <div className={panelVisibility(activePanel, "home")}>
        {home}
        <LandingSectionHub />
      </div>

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
          <div key={id} className={panelVisibility(activePanel, id)}>
            <LandingMobileBackBar sectionId={id} />
            {slot}
          </div>
        );
      })}

      {footer ? (
        <div className={panelVisibility(activePanel, "home")}>{footer}</div>
      ) : null}
    </>
  );
}

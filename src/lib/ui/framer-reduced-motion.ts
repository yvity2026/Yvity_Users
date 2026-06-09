import type { Transition } from "framer-motion";

const instant: Transition = { duration: 0 };

/** Modal panel enter/exit — auth modals, setup flows. */
export function modalPanelMotion(reduced: boolean) {
  if (reduced) {
    return {
      initial: false as const,
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 1, y: 0 },
      transition: instant,
    };
  }
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 24 },
    transition: { type: "spring" as const, damping: 28, stiffness: 340 },
  };
}

/** Horizontal step transitions inside auth wizards. */
export function stepSlideMotion(reduced: boolean, enterFrom: "left" | "right" = "left") {
  const enterX = enterFrom === "left" ? -14 : 14;
  const exitX = enterFrom === "left" ? 14 : -14;
  if (reduced) {
    return {
      initial: false as const,
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 1, x: 0 },
      transition: instant,
    };
  }
  return {
    initial: { opacity: 0, x: enterX },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: exitX },
    transition: { duration: 0.2 },
  };
}

/** Expand/collapse blocks (registration optional fields, etc.). */
export function collapseMotion(reduced: boolean) {
  if (reduced) {
    return {
      initial: false as const,
      animate: { opacity: 1, height: "auto" as const },
      exit: { opacity: 1, height: "auto" as const },
      transition: instant,
    };
  }
  return {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" as const },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.22 },
  };
}

/** Small inline reveal (e.g. success hints). */
export function fadeUpMotion(reduced: boolean) {
  if (reduced) {
    return {
      initial: false as const,
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 1, y: 0 },
      transition: instant,
    };
  }
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
    transition: { duration: 0.18 },
  };
}

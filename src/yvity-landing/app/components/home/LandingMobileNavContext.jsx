"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const LandingMobileNavContext = createContext(null);

export function LandingMobileNavProvider({ children }) {
  const [activePanel, setActivePanel] = useState("home");

  const goHome = useCallback(() => {
    setActivePanel("home");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const openPanel = useCallback((panelId) => {
    if (!panelId || panelId === "home") {
      goHome();
      return;
    }
    setActivePanel(panelId);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [goHome]);

  const value = useMemo(
    () => ({
      activePanel,
      goHome,
      openPanel,
      isHome: activePanel === "home",
    }),
    [activePanel, goHome, openPanel],
  );

  return (
    <LandingMobileNavContext.Provider value={value}>
      {children}
    </LandingMobileNavContext.Provider>
  );
}

export function useLandingMobileNav() {
  const context = useContext(LandingMobileNavContext);
  if (!context) {
    throw new Error(
      "useLandingMobileNav must be used within LandingMobileNavProvider",
    );
  }
  return context;
}

export function useLandingMobileNavOptional() {
  return useContext(LandingMobileNavContext);
}

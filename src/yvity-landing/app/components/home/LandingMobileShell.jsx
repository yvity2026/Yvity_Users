"use client";

import MobileBottomNav from "./MobileBottomNav";
import { LandingMobileNavProvider } from "./LandingMobileNavContext";

export default function LandingMobileShell({ children }) {
  return (
    <LandingMobileNavProvider>
      <div className="pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        {children}
      </div>
      <MobileBottomNav />
    </LandingMobileNavProvider>
  );
}

"use client";

import { useRef, useState } from "react";
import { Home, MessageCircle, Search, UserPlus } from "lucide-react";
import { openRegistrationModal } from "@/yvity-landing/lib/ui/openRegistrationModal";
import { useLandingMobileNav } from "./LandingMobileNavContext";

const PRIMARY_NAV = [
  { id: "home", label: "Home", icon: Home, action: "panel", ariaLabel: "Home" },
  {
    id: "find-advisors",
    label: "Find",
    icon: Search,
    action: "panel",
    ariaLabel: "Find advisors",
  },
  {
    id: "testimonials",
    label: "Reviews",
    icon: MessageCircle,
    action: "panel",
    ariaLabel: "Reviews",
  },
  {
    id: "register",
    label: "Join",
    icon: UserPlus,
    action: "register",
    ariaLabel: "Join YVITY",
  },
];

function panelToNavId(activePanel) {
  if (activePanel === "home") return "home";
  return activePanel;
}

export default function MobileBottomNav() {
  const { activePanel, goHome, openPanel } = useLandingMobileNav();
  const [registerActive, setRegisterActive] = useState(false);
  const registerTimerRef = useRef(null);

  const activeId = registerActive ? "register" : panelToNavId(activePanel);

  const handleNavClick = (item) => {
    if (item.action === "register") {
      if (registerTimerRef.current) clearTimeout(registerTimerRef.current);
      setRegisterActive(true);
      openRegistrationModal();
      registerTimerRef.current = setTimeout(() => setRegisterActive(false), 600);
      return;
    }

    setRegisterActive(false);
    if (item.id === "home") {
      goHome();
    } else {
      openPanel(item.id);
    }
  };

  return (
    <nav
      aria-label="Mobile section navigation"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mob-nav-bottom-frame">
        <div className="glass-nav-mobile mob-nav-bottom-inner">
          <div className="mx-auto flex h-[3.75rem] w-full max-w-[1536px] items-stretch justify-around px-4 sm:h-16">
            {PRIMARY_NAV.map((item) => {
              const { id, label, icon: Icon, ariaLabel } = item;
              const isActive = activeId === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={ariaLabel}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => handleNavClick(item)}
                  className="relative flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center px-1.5"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200 ${
                      isActive
                        ? "bg-[#0A4A4A] text-[#F59E0B] shadow-[0_4px_12px_rgba(10,74,74,0.45)]"
                        : "bg-transparent text-[#0A4A4A]/55"
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
                  </span>
                  <span
                    className={`mt-0.5 font-poppins text-[10px] leading-none text-[#0A4A4A] ${
                      isActive ? "font-semibold" : "font-medium opacity-65"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

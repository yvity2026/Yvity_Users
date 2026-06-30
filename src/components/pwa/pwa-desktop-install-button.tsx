"use client";

import { useEffect, useState } from "react";
import { MonitorDown } from "lucide-react";

export function PwaDesktopInstallButton() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  if (!prompt || installed) return null;

  const handleClick = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    prompt.prompt();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setPrompt(null);
  };

  return (
    <button
      onClick={handleClick}
      className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-white/20 hover:bg-white/[0.08] hover:text-foreground"
      title="Install YVITY as a desktop app"
    >
      <MonitorDown className="size-3.5 text-[#F59E0B]" />
      Install App
    </button>
  );
}

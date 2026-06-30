"use client";

import { useEffect, useState } from "react";
import { X, Share2, Plus } from "lucide-react";

const DISMISS_KEY = "yvity_a2hs_dismissed";
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

type Platform = "ios" | "android" | null;

function detectPlatform(): Platform {
  if (typeof window === "undefined") return null;
  // Already installed as PWA — don't show
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as Record<string, unknown>).standalone === true);
  if (isStandalone) return null;
  // Desktop — don't show
  if (window.innerWidth >= 768) return null;

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  if (isIOS) return "ios";

  const isAndroid = /Android/.test(ua);
  if (isAndroid) return "android";

  return null;
}

export function AddToHomeScreenBanner() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [visible, setVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_TTL) return;

    const p = detectPlatform();
    if (!p) return;
    setPlatform(p);

    if (p === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => setVisible(true), 3000);
      };
      window.addEventListener("beforeinstallprompt", handler as EventListener);
      return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
    }

    if (p === "ios") {
      setTimeout(() => setVisible(true), 3000);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    deferredPrompt.prompt();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!visible || !platform) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
      role="dialog"
      aria-label="Add YVITY to your home screen"
    >
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0A4A4A] shadow-2xl shadow-black/40 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div className="size-10 rounded-xl bg-[#F59E0B] flex items-center justify-center shrink-0">
            <span className="text-[#0A4A4A] font-black text-sm tracking-wider">Y</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight">Add YVITY to Home Screen</p>
            <p className="text-xs text-white/60 mt-0.5 leading-tight">Open instantly like an app — no browser needed</p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 size-7 rounded-full bg-white/10 flex items-center justify-center"
            aria-label="Dismiss"
          >
            <X className="size-3.5 text-white/70" />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-4 pb-4">
          {platform === "ios" ? (
            <div className="rounded-xl bg-white/8 border border-white/10 p-3">
              <p className="text-xs font-semibold text-white/80 mb-2">How to install on iPhone / iPad:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-6 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
                    <span className="text-[#F59E0B] text-xs font-bold">1</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/70">
                    <span>Tap the</span>
                    <span className="inline-flex items-center gap-1 bg-white/10 rounded px-1.5 py-0.5 text-white font-medium">
                      <Share2 className="size-3" /> Share
                    </span>
                    <span>button below</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="size-6 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
                    <span className="text-[#F59E0B] text-xs font-bold">2</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/70">
                    <span>Scroll and tap</span>
                    <span className="inline-flex items-center gap-1 bg-white/10 rounded px-1.5 py-0.5 text-white font-medium">
                      <Plus className="size-3" /> Add to Home Screen
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="size-6 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center shrink-0">
                    <span className="text-[#F59E0B] text-xs font-bold">3</span>
                  </div>
                  <p className="text-xs text-white/70">Tap <span className="text-white font-medium">Add</span> — done!</p>
                </div>
              </div>
              {/* Arrow pointing down to browser bar */}
              <div className="mt-3 flex justify-center">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[10px] text-[#F59E0B]/80 font-medium">Share button is at the bottom of your browser</p>
                  <div className="w-px h-4 bg-[#F59E0B]/40" />
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#F59E0B]/60" />
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="w-full rounded-xl bg-[#F59E0B] py-3 text-sm font-bold text-[#0A4A4A] shadow-lg shadow-[#F59E0B]/20 active:scale-[0.98] transition-transform"
            >
              Install YVITY App — It's Free
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

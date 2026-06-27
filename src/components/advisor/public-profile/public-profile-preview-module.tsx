"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Eye,
  Link2,
  Loader2,
  Mail,
  Monitor,
  RefreshCw,
  Share2,
  Smartphone,
} from "lucide-react";
import { FacebookIcon, LinkedInIcon, WhatsAppIcon, XIcon } from "@/components/icons/brand-icons";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { usePublicProfileUrls } from "@/hooks/use-public-profile-urls";
import { useShareProfileLink } from "@/hooks/use-share-profile-link";
import { cn } from "@/lib/utils";

export type PublicProfileViewMode = "mobile" | "desktop";

export type PublicProfilePreviewModuleProps = {
  viewMode: PublicProfileViewMode;
  onViewModeChange: (next: PublicProfileViewMode) => void;
  /** Tighter layout when embedded in dashboard My Space (especially mobile). */
  compactEmbed?: boolean;
};

/**
 * Internal "Public Profile" view rendered in the advisor workspace's main
 * content area.
 *
 * Two modes (selected via the toggle at the top):
 *
 * - **Mobile view** — narrow iframe (left) with a full share sidebar
 *   (right) and a faux browser chrome on the preview. Looks and behaves
 *   like a phone-sized preview docked next to the share tools.
 * - **Desktop view** — full-width iframe with NO browser chrome at the
 *   top. The advisor workspace header is hidden by the parent dashboard
 *   so the site fills the entire content area like a real visitor would
 *   see it. Sharing collapses into a slim CTA bar above the preview.
 */
export function PublicProfilePreviewModule({
  viewMode,
  onViewModeChange,
  compactEmbed = false,
}: PublicProfilePreviewModuleProps) {
  // Reload counter — incrementing this remounts the iframe so the
  // advisor can refresh the preview after publishing changes.
  const { previewPath, previewUrl, liveUrl, canShare } = usePublicProfileUrls();
  const [reloadKey, setReloadKey] = useState(0);
  const [absoluteUrl, setAbsoluteUrl] = useState<string>(previewPath);

  useEffect(() => {
    setAbsoluteUrl(canShare ? liveUrl : previewUrl);
  }, [canShare, liveUrl, previewUrl]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <div className={cn("space-y-2 sm:space-y-2.5", viewMode === "desktop" && "space-y-2")}>
      {!canShare ? (
        <p className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          Preview mode — your profile link goes live after admin approval. You can explore the layout
          below; sharing unlocks once you are approved.
        </p>
      ) : null}
      {/* ─── Top bar — view toggle + (desktop) compact share CTA ─── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <ViewModeToggle value={viewMode} onChange={onViewModeChange} />

        {viewMode === "desktop" && (
          <DesktopShareCtaBar
            url={absoluteUrl}
            onReload={reload}
            canShare={canShare}
            previewUrl={previewUrl}
          />
        )}
      </div>

      {/* ─── Body — layout depends on the active view ─── */}
      {viewMode === "mobile" ? (
        <div
          className={cn(
            "grid gap-4",
            compactEmbed ? "grid-cols-1" : "lg:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]",
          )}
        >
          <PreviewPane
            reloadKey={reloadKey}
            onReload={reload}
            absoluteUrl={absoluteUrl}
            previewPath={previewPath}
            showChrome
            compactEmbed={compactEmbed}
          />
          <SharePanel
            url={absoluteUrl}
            compactEmbed={compactEmbed}
            canShare={canShare}
            previewUrl={previewUrl}
          />
        </div>
      ) : (
        <PreviewPane
          reloadKey={reloadKey}
          onReload={reload}
          absoluteUrl={absoluteUrl}
          previewPath={previewPath}
          showChrome={false}
          tall
          compactEmbed={compactEmbed}
        />
      )}
    </div>
  );
}

// ─── View-mode toggle ────────────────────────────────────────────────

function ViewModeToggle({
  value,
  onChange,
}: {
  value: PublicProfileViewMode;
  onChange: (next: PublicProfileViewMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Preview viewport"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full p-0.5",
        "border border-white/12 bg-white/[0.04]",
      )}
    >
      <ToggleOption
        active={value === "mobile"}
        onClick={() => onChange("mobile")}
        icon={Smartphone}
        label="Mobile view"
      />
      <ToggleOption
        active={value === "desktop"}
        onClick={() => onChange("desktop")}
        icon={Monitor}
        label="Desktop view"
      />
    </div>
  );
}

function ToggleOption({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Smartphone;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        "px-2.5 sm:px-3 py-1.5 text-[12px] font-semibold tracking-tight",
        "transition-all duration-200 ease-out motion-reduce:transition-none",
        "active:scale-[0.97]",
        active
          ? cn(
              "bg-gradient-to-br from-primary/22 via-primary/10 to-transparent",
              "text-foreground ring-1 ring-primary/40",
              "shadow-[0_4px_18px_-8px_oklch(0.78_0.13_200/0.55)]",
            )
          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
      )}
    >
      <Icon className="size-3.5" aria-hidden strokeWidth={active ? 2.2 : 1.85} />
      <span>{label}</span>
    </button>
  );
}

// ─── Preview pane (iframe + optional browser chrome) ────────────────

function PreviewPane({
  reloadKey,
  onReload,
  absoluteUrl,
  previewPath,
  showChrome,
  tall = false,
  compactEmbed = false,
}: {
  reloadKey: number;
  onReload: () => void;
  absoluteUrl: string;
  previewPath: string;
  showChrome: boolean;
  tall?: boolean;
  compactEmbed?: boolean;
}) {
  // Track iframe load state so we can dim the preview with a centered
  // spinner while the embedded site is fetching. Resets every time
  // `reloadKey` changes (i.e. when the advisor taps Refresh).
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
  }, [reloadKey]);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 glass-strong",
        "flex flex-col",
      )}
    >
      {showChrome && (
        <header className="yvity-on-dark flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-white/8 bg-[oklch(0.16_0.02_245)] text-white">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[oklch(0.72_0.18_15)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.85_0.16_78)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.78_0.16_162)]" />
          </div>
          <div
            className={cn(
              "ml-2 flex-1 min-w-0 inline-flex items-center gap-1.5 rounded-full",
              "px-3 py-1 bg-white/[0.08] border border-white/10",
              "text-[11px] text-white/85",
            )}
          >
            <Eye className="size-3 shrink-0 opacity-75" aria-hidden />
            <span className="truncate font-medium">{absoluteUrl.replace(/^https?:\/\//, "")}</span>
          </div>
          <button
            type="button"
            onClick={onReload}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1",
              "text-[11px] font-medium text-white/80",
              "border border-white/12 bg-white/[0.04]",
              "transition-all duration-200 ease-out hover:bg-white/[0.08] hover:text-white",
              "active:scale-[0.97]",
            )}
            aria-label="Refresh preview"
          >
            <RefreshCw className="size-3" aria-hidden />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>
      )}

      <div className="relative w-full">
        <iframe
          key={reloadKey}
          src={previewPath}
          title="Public profile preview"
          onLoad={() => setLoading(false)}
          className={cn(
            "w-full bg-background block",
            tall
              ? compactEmbed
                ? "h-[58dvh] sm:h-[65dvh]"
                : "h-[78dvh] sm:h-[82dvh] lg:h-[85dvh]"
              : compactEmbed
                ? "h-[50dvh] sm:h-[55dvh]"
                : "h-[68dvh] sm:h-[72dvh] lg:h-[78dvh]",
          )}
        />
        {loading && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center",
              "bg-background/70 backdrop-blur-sm",
              "transition-opacity duration-300",
            )}
            role="status"
            aria-live="polite"
            aria-label="Loading public profile preview"
          >
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Desktop view — compact horizontal share CTA bar ────────────────

function DesktopShareCtaBar({
  url,
  onReload,
  canShare,
  previewUrl,
}: {
  url: string;
  onReload: () => void;
  canShare: boolean;
  previewUrl: string;
}) {
  const display = useAdvisorDisplayProfile();
  const { share } = useShareProfileLink();
  const [copied, setCopied] = useState(false);
  const channels = useShareChannels(canShare ? url : previewUrl);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof (navigator as Navigator).share === "function";

  const copyLink = useCallback(async () => {
    if (!canShare) {
      await share();
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignored
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [canShare, share, url]);

  const nativeShare = useCallback(async () => {
    if (!canShare) {
      await share();
      return;
    }
    if (!canNativeShare) return;
    try {
      await (navigator as Navigator).share({
        title: `${display.name} — YVITY`,
        text: `${display.title}. ${display.ctaDescription}`,
        url,
      });
    } catch {
      // user dismissed
    }
  }, [canShare, canNativeShare, display, share, url]);

  return (
    <div className="ml-auto inline-flex flex-wrap items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={copyLink}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
          "text-[12px] font-semibold",
          "transition-all duration-200 ease-out active:scale-[0.97]",
          copied
            ? "bg-[oklch(0.78_0.16_152/0.15)] text-[oklch(0.78_0.16_152)] ring-1 ring-[oklch(0.78_0.16_152/0.45)]"
            : "bg-primary/15 text-primary ring-1 ring-primary/35 hover:bg-primary/22",
        )}
        aria-live="polite"
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Copy className="size-3.5" aria-hidden />
        )}
        {copied ? "Link copied" : canShare ? "Copy link" : "Share locked"}
      </button>

      {canNativeShare && (
        <button
          type="button"
          onClick={nativeShare}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
            "text-[12px] font-semibold text-foreground",
            "border border-white/12 bg-white/[0.05]",
            "transition-all duration-200 ease-out hover:bg-white/[0.1]",
            "active:scale-[0.97]",
          )}
        >
          <Share2 className="size-3.5" aria-hidden />
          Share
        </button>
      )}

      {/* Channel icon buttons */}
      <div className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] p-1">
        {channels.map((c) => (
          <a
            key={c.id}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share to ${c.label}`}
            title={c.label}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full",
              "transition-all duration-200 ease-out active:scale-[0.94]",
              c.tone,
            )}
          >
            <c.Icon className="size-3.5" />
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={onReload}
        aria-label="Refresh preview"
        title="Refresh preview"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full",
          "text-muted-foreground hover:text-foreground",
          "border border-white/12 bg-white/[0.04] hover:bg-white/[0.08]",
          "transition-all duration-200 ease-out active:scale-[0.95]",
        )}
      >
        <RefreshCw className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

// ─── Mobile view — full share panel on the right ────────────────────

function SharePanel({
  url,
  compactEmbed: _compactEmbed = false,
  canShare,
  previewUrl,
}: {
  url: string;
  compactEmbed?: boolean;
  canShare: boolean;
  previewUrl: string;
}) {
  const display = useAdvisorDisplayProfile();
  const { share } = useShareProfileLink();
  const [copied, setCopied] = useState(false);
  const channels = useShareChannels(canShare ? url : previewUrl);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof (navigator as Navigator).share === "function";

  const copyLink = useCallback(async () => {
    if (!canShare) {
      await share();
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // best effort
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [canShare, share, url]);

  const nativeShare = useCallback(async () => {
    if (!canShare) {
      await share();
      return;
    }
    if (!canNativeShare) return;
    try {
      await (navigator as Navigator).share({
        title: `${display.name} — YVITY`,
        text: `${display.title}. ${display.ctaDescription}`,
        url,
      });
    } catch {
      // user dismissed
    }
  }, [canShare, canNativeShare, display, share, url]);

  return (
    <aside
      className={cn(
        "rounded-2xl border border-white/10 glass-strong p-4 sm:p-5",
        "flex flex-col gap-5 self-start",
        "lg:sticky lg:top-32",
      )}
    >
      <header>
        <p className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground/60">
          <Share2 className="size-3" aria-hidden />
          Share profile
        </p>
        <h2 className="mt-1 text-base sm:text-lg font-semibold tracking-tight">Spread the word</h2>
        <p className="mt-0.5 text-[12px] text-foreground/70">
          {canShare
            ? "Copy the link or share directly to your favourite channels."
            : "Sharing is locked until YVITY approves your profile."}
        </p>
      </header>

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-foreground/60 inline-flex items-center gap-1.5">
          <Link2 className="size-3" aria-hidden />
          Profile link
        </p>
        <div className="flex items-stretch gap-2">
          <input
            type="text"
            readOnly
            value={url}
            aria-label="Public profile link"
            className={cn(
              "min-w-0 flex-1 rounded-lg border border-white/12 bg-white/[0.03] px-2.5 py-2",
              "text-[12px] text-foreground/90 font-mono",
              "focus:outline-none focus:ring-2 focus:ring-primary/35",
            )}
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            type="button"
            onClick={copyLink}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2",
              "text-[12px] font-semibold",
              "transition-all duration-200 ease-out active:scale-[0.97]",
              copied
                ? "bg-[oklch(0.78_0.16_152/0.15)] text-[oklch(0.78_0.16_152)] ring-1 ring-[oklch(0.78_0.16_152/0.45)]"
                : "bg-primary/15 text-primary ring-1 ring-primary/35 hover:bg-primary/22",
            )}
            aria-live="polite"
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
            {copied ? "Copied" : canShare ? "Copy" : "Locked"}
          </button>
        </div>
      </div>

      {canNativeShare && (
        <button
          type="button"
          onClick={nativeShare}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5",
            "text-sm font-semibold text-primary",
            "bg-gradient-to-br from-primary/18 via-primary/8 to-transparent",
            "ring-1 ring-primary/35 shadow-[0_4px_18px_-8px_oklch(0.78_0.13_200/0.55)]",
            "transition-all duration-200 ease-out hover:from-primary/25 hover:via-primary/12",
            "active:scale-[0.985]",
          )}
        >
          <Share2 className="size-4" aria-hidden />
          Share via…
        </button>
      )}

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-foreground/60">Share to</p>
        <div className="grid grid-cols-1 gap-1.5">
          {channels.map((c) => (
            <a
              key={c.id}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group/share flex items-center gap-2.5 rounded-xl px-3 py-2.5",
                "border border-transparent text-sm font-medium",
                "transition-all duration-200 ease-out",
                "active:scale-[0.985]",
                c.tone,
              )}
              aria-label={`Share to ${c.label}`}
            >
              <span
                aria-hidden
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/10"
              >
                <c.Icon className="size-3.5" />
              </span>
              <span className="flex-1 truncate">{c.label}</span>
              <ArrowUpRight
                className="size-3.5 opacity-50 group-hover/share:opacity-100 group-hover/share:translate-x-0.5 group-hover/share:-translate-y-0.5 transition-all duration-200"
                aria-hidden
              />
            </a>
          ))}
        </div>
      </div>

      <a
        href={previewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2",
          "text-[12px] font-medium",
          "text-muted-foreground hover:text-foreground",
          "border border-white/10 bg-white/[0.02] hover:bg-white/[0.05]",
          "transition-all duration-200 ease-out active:scale-[0.985]",
        )}
      >
        <ArrowUpRight className="size-3.5" aria-hidden />
        Open live page in new tab
      </a>
    </aside>
  );
}

// ─── Shared channel builder ──────────────────────────────────────────

type ShareChannelDef = {
  id: string;
  label: string;
  href: string;
  Icon: React.FC<{ className?: string }>;
  tone: string;
};

function useShareChannels(url: string): ShareChannelDef[] {
  const display = useAdvisorDisplayProfile();
  return useMemo(() => {
    const shareText = `Check out my profile on YVITY — ${display.title}. ${url}`;
    const encShare = encodeURIComponent(shareText);
    const encUrl = encodeURIComponent(url);
    const encMsgOnly = encodeURIComponent(
      `Hi! I'd love to share my YVITY profile with you — ${url}`,
    );

    return [
      {
        id: "whatsapp",
        label: "WhatsApp",
        href: `https://wa.me/?text=${encMsgOnly}`,
        Icon: WhatsAppIcon,
        tone: "bg-[oklch(0.78_0.16_152/0.12)] text-[oklch(0.78_0.16_152)] hover:bg-[oklch(0.78_0.16_152/0.2)]",
      },
      {
        id: "twitter",
        label: "X (Twitter)",
        href: `https://twitter.com/intent/tweet?text=${encShare}`,
        Icon: XIcon,
        tone: "bg-white/[0.05] text-foreground hover:bg-white/[0.1]",
      },
      {
        id: "facebook",
        label: "Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
        Icon: FacebookIcon,
        tone: "bg-[oklch(0.55_0.18_265/0.14)] text-[oklch(0.78_0.16_265)] hover:bg-[oklch(0.55_0.18_265/0.22)]",
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
        Icon: LinkedInIcon,
        tone: "bg-[oklch(0.55_0.16_240/0.14)] text-[oklch(0.78_0.13_240)] hover:bg-[oklch(0.55_0.16_240/0.22)]",
      },
      {
        id: "email",
        label: "Email",
        href: `mailto:?subject=${encodeURIComponent("My YVITY profile")}&body=${encShare}`,
        Icon: Mail,
        tone: "bg-[oklch(0.85_0.16_78/0.12)] text-[oklch(0.85_0.16_78)] hover:bg-[oklch(0.85_0.16_78/0.2)]",
      },
    ];
  }, [display.title, url]);
}

// Brand icons (WhatsApp, X, Facebook, LinkedIn) are imported from
// `@/components/icons/brand-icons` — the shared canonical artwork.

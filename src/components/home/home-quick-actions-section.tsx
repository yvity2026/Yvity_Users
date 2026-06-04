"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { FileDown, MessageSquareQuote, QrCode, Star } from "lucide-react";
import { toast } from "sonner";
import { RecommendAdvisorModal } from "@/components/testimonials/recommend-advisor-modal";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { downloadProfilePdf, downloadProfileQrCode } from "@/lib/profile/profile-downloads";
import { useTestimonialSubmit } from "@/lib/testimonial-submit-store";
import { cn } from "@/lib/utils";

type QuickActionId = "recommend" | "testimonial" | "pdf" | "qr";

type QuickActionDef = {
  id: QuickActionId;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  ring: string;
};

const actions: QuickActionDef[] = [
  {
    id: "recommend",
    label: "Recommend Advisor",
    description: "Share why you trust this advisor",
    icon: Star,
    accent: "from-[oklch(0.85_0.16_78)] to-[oklch(0.72_0.15_55)]",
    glow: "bg-[oklch(0.85_0.16_78/0.18)]",
    ring: "ring-[oklch(0.85_0.16_78/0.35)]",
  },
  {
    id: "testimonial",
    label: "Give Testimonial",
    description: "Text, audio or video feedback",
    icon: MessageSquareQuote,
    accent: "from-[oklch(0.78_0.16_162)] to-[oklch(0.62_0.12_185)]",
    glow: "bg-[oklch(0.78_0.16_162/0.18)]",
    ring: "ring-[oklch(0.78_0.16_162/0.35)]",
  },
  {
    id: "pdf",
    label: "Download Profile PDF",
    description: "Professional profile summary",
    icon: FileDown,
    accent: "from-[oklch(0.82_0.13_205)] to-primary",
    glow: "bg-[oklch(0.82_0.13_205/0.18)]",
    ring: "ring-[oklch(0.82_0.13_205/0.35)]",
  },
  {
    id: "qr",
    label: "Download QR Code",
    description: "Share offline or in print",
    icon: QrCode,
    accent: "from-[oklch(0.78_0.15_295)] to-[oklch(0.58_0.14_260)]",
    glow: "bg-[oklch(0.78_0.15_295/0.18)]",
    ring: "ring-[oklch(0.78_0.15_295/0.35)]",
  },
];

function QuickActionCard({
  action,
  disabled,
  busy,
  onClick,
}: {
  action: QuickActionDef;
  disabled?: boolean;
  busy?: boolean;
  onClick: () => void;
}) {
  const Icon = action.icon;

  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || busy}
        className={cn(
          "group relative flex h-full w-full flex-col items-center gap-3 overflow-hidden rounded-2xl border border-white/10 p-4 sm:p-[1.125rem]",
          "glass-strong text-center transition duration-200",
          "hover:-translate-y-0.5 hover:border-white/16 hover:shadow-[0_20px_40px_-24px_oklch(0_0_0/0.75)]",
          "active:scale-[0.98]",
          (disabled || busy) && "opacity-50 cursor-not-allowed hover:translate-y-0",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -top-10 -right-10 size-24 rounded-full blur-2xl opacity-50 transition group-hover:opacity-75",
            action.glow,
          )}
          aria-hidden
        />
        <span
          className={cn(
            "relative inline-flex size-11 sm:size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ring-1",
            action.accent,
            action.ring,
          )}
        >
          {/* Standardised glyph sizing (matches Hero service chips and
              other quick-action surfaces) — keeps the icon strokes
              visually aligned across the home page. */}
          <Icon className="size-5" strokeWidth={2.1} />
        </span>
        <span className="relative min-w-0">
          <span className="block text-xs sm:text-[13px] font-semibold leading-snug text-foreground">
            {busy ? "Preparing…" : action.label}
          </span>
          <span className="mt-1 block text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
            {action.description}
          </span>
        </span>
      </button>
    </li>
  );
}

export function HomeQuickActionsSection() {
  const { settings } = useAdvisorSettings();
  const { openGiveTestimonial } = useTestimonialSubmit();
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [busyId, setBusyId] = useState<QuickActionId | null>(null);

  const isDisabled = (id: QuickActionId): boolean => {
    if (id === "recommend") return !settings.leads.recommendationRequests;
    if (id === "testimonial") return !settings.leads.testimonialRequests;
    return false;
  };

  const handleAction = async (id: QuickActionId) => {
    if (isDisabled(id)) return;

    if (id === "recommend") {
      setRecommendOpen(true);
      return;
    }
    if (id === "testimonial") {
      openGiveTestimonial();
      return;
    }

    setBusyId(id);
    try {
      if (id === "pdf") await downloadProfilePdf();
      if (id === "qr") await downloadProfileQrCode();
    } catch {
      toast.error("Download failed", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <section className="w-full" aria-labelledby="quick-actions-heading">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Take action
        </p>
        <h2
          id="quick-actions-heading"
          className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.08]"
        >
          <span className="text-gradient-brand">Quick Actions</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Recommend, share feedback, or save this profile for offline use.
        </p>

        <ul className="mt-5 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {actions.map((action) => (
            <QuickActionCard
              key={action.id}
              action={action}
              disabled={isDisabled(action.id)}
              busy={busyId === action.id}
              onClick={() => void handleAction(action.id)}
            />
          ))}
        </ul>
      </section>

      <RecommendAdvisorModal open={recommendOpen} onClose={() => setRecommendOpen(false)} />
    </>
  );
}

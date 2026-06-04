"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2, Mail, Phone, Send, X } from "lucide-react";
import {
  contactInterestOptions,
  contactInterestTones,
  type ContactInterestId,
} from "@/lib/contact-config";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { useContact } from "@/lib/contact-store";
import { advisorProfile } from "@/lib/advisor-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

type QuickAction = {
  id: string;
  label: string;
  icon: LucideIcon | typeof WhatsAppIcon;
  tile: string;
  iconWrap: string;
  iconColor: string;
  href: () => string;
  external?: boolean;
};

const quickActions: QuickAction[] = [
  {
    id: "call",
    label: "Call",
    icon: Phone,
    tile: "bg-gradient-to-br from-[oklch(0.38_0.09_155)] to-[oklch(0.30_0.08_168)] hover:from-[oklch(0.42_0.10_155)] hover:to-[oklch(0.34_0.09_168)]",
    iconWrap: "bg-[oklch(0.88_0.14_155/0.22)] ring-1 ring-[oklch(0.92_0.08_155/0.35)]",
    iconColor: "text-[oklch(0.95_0.04_155)]",
    href: () => `tel:${advisorProfile.phone.replace(/\s/g, "")}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: WhatsAppIcon,
    tile: "bg-gradient-to-br from-[oklch(0.52_0.14_155)] to-[oklch(0.44_0.13_158)] hover:from-[oklch(0.56_0.15_155)] hover:to-[oklch(0.48_0.14_158)]",
    iconWrap: "bg-[oklch(0.95_0.06_155/0.25)] ring-1 ring-[oklch(0.98_0.04_155/0.4)]",
    iconColor: "text-white",
    href: () => `https://wa.me/${advisorProfile.whatsapp}`,
    external: true,
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    tile: "bg-gradient-to-br from-[oklch(0.40_0.09_205)] to-[oklch(0.32_0.08_220)] hover:from-[oklch(0.44_0.10_205)] hover:to-[oklch(0.36_0.09_220)]",
    iconWrap: "bg-[oklch(0.88_0.10_205/0.22)] ring-1 ring-[oklch(0.92_0.08_205/0.35)]",
    iconColor: "text-[oklch(0.95_0.04_205)]",
    href: () => `mailto:${advisorProfile.email}`,
  },
];

export function ContactSheet() {
  const { open, closeContact } = useContact();
  const { settings } = useAdvisorSettings();
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [interests, setInterests] = useState<ContactInterestId[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const visibleQuickActions = quickActions.filter((action) => {
    if (action.id === "call") return settings.contact.callButton;
    if (action.id === "whatsapp") return settings.contact.whatsAppButton;
    return true;
  });
  const showContactForm =
    settings.contact.contactForm &&
    settings.leads.acceptNewLeads &&
    settings.leads.publicProfileEnquiries;
  const headerMobile = settings.contact.showMobileNumber ? advisorProfile.phone : null;

  const toggleInterest = (id: ContactInterestId) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const resetForm = () => {
    setFullName("");
    setMobile("");
    setMessage("");
    setInterests([]);
    setError(null);
    setSent(false);
  };

  const handleClose = () => {
    closeContact();
    window.setTimeout(resetForm, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, mobile, interests, message }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send message. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-sheet-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={handleClose}
        aria-label="Close contact form"
      />

      <div className="relative z-10 flex w-full max-h-[94dvh] sm:max-h-[90vh] flex-col sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 sm:px-6 shrink-0">
          <div className="min-w-0 text-left">
            <h2 id="contact-sheet-title" className="text-xl sm:text-2xl font-bold tracking-tight">
              Get in Touch
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {advisorProfile.name} · {advisorProfile.location}
              {headerMobile && (
                <>
                  <br />
                  <span className="tabular-nums">{headerMobile}</span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 sm:px-6 pb-6">
          {sent ? (
            <div className="py-8 text-center animate-in fade-in duration-300">
              <p className="text-lg font-semibold text-foreground">Message sent</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                Thank you! {advisorProfile.name.split(" ")[0]} will get back to you shortly.
              </p>
              <Button onClick={handleClose} className="mt-6 rounded-full px-8">
                Done
              </Button>
            </div>
          ) : (
            <>
              {visibleQuickActions.length > 0 && (
                <div
                  className={cn(
                    "grid gap-2.5 sm:gap-3",
                    visibleQuickActions.length === 1 && "grid-cols-1",
                    visibleQuickActions.length === 2 && "grid-cols-2",
                    visibleQuickActions.length >= 3 && "grid-cols-3",
                  )}
                >
                  {visibleQuickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <a
                        key={action.id}
                        href={action.href()}
                        target={action.external ? "_blank" : undefined}
                        rel={action.external ? "noopener noreferrer" : undefined}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2.5 rounded-2xl py-4 shadow-md transition active:scale-[0.98]",
                          action.tile,
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex size-11 items-center justify-center rounded-xl",
                            action.iconWrap,
                          )}
                        >
                          <Icon className={cn("size-5", action.iconColor)} />
                        </span>
                        <span className="text-xs font-semibold text-white/95">{action.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {showContactForm && visibleQuickActions.length > 0 && (
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <p className="relative mx-auto w-fit px-3 text-xs text-muted-foreground bg-card">
                    or send a message
                  </p>
                </div>
              )}

              {showContactForm ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name">Full Name</Label>
                    <Input
                      id="contact-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-mobile">Mobile Number</Label>
                    <Input
                      id="contact-mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 00000 00000"
                      className="h-11 rounded-xl border-white/15 bg-white/[0.04]"
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Interested in</legend>
                    <div className="flex flex-wrap gap-2">
                      {contactInterestOptions.map((option) => {
                        const selected = interests.includes(option.id);
                        const tone = contactInterestTones[option.tone];
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleInterest(option.id)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                              selected ? tone.active : tone.idle,
                            )}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-message">Message (optional)</Label>
                    <Textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Any specific queries or requirements..."
                      rows={3}
                      className="rounded-xl border-white/15 bg-white/[0.04] resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      "h-12 w-full rounded-2xl text-sm font-semibold",
                      "bg-[oklch(0.82_0.16_78)] text-primary hover:bg-[oklch(0.86_0.15_78)]",
                      "shadow-lg shadow-[oklch(0.82_0.16_78/0.25)]",
                    )}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="size-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                !visibleQuickActions.length && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Contact options are currently unavailable. Please try again later.
                  </p>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

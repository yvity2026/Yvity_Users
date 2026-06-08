"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import {
  Calendar,
  CalendarClock,
  ChevronDown,
  Clock,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Quote,
  Tag,
} from "lucide-react";
import {
  priorityEmoji,
  priorityLabel,
  sourceLabel,
  statusLabel,
  STATUS_STYLES,
} from "@/lib/leads/config";
import type { Lead } from "@/lib/leads/types";
import { getLeadServiceIcon, getLeadToneStyle } from "@/lib/leads/service-types";
import {
  formatAddedDate,
  formatLastActivity,
  serviceLabel,
  telHref,
  whatsAppHref,
} from "@/lib/leads/utils";
import { cn } from "@/lib/utils";

type LeadListCardProps = {
  lead: Lead;
  onManage: () => void;
  onEdit: () => void;
  /** Zero-based index for staggered entrance animation. */
  index?: number;
  /** Initial open state. Defaults to collapsed. */
  defaultOpen?: boolean;
};

/**
 * Accordion-style lead card.
 *
 * Collapsed state shows only:
 *   • Service-coloured icon + lead name + service · city sub-line
 *   • Status badge
 *   • Compact Call and WhatsApp quick actions
 *   • Chevron indicator
 *
 * Expanded state reveals all metadata chips, the original enquiry message,
 * notes, and the Edit / Manage actions. The same component is used on mobile
 * and desktop — sizes adapt via responsive utility classes.
 *
 * Colour treatment mirrors the "services in home section" feel: every card
 * gets its service-tone accent ribbon, icon tint and subtle hover wash so the
 * pipeline feels visually structured at a glance.
 */
export function LeadListCard({
  lead,
  onManage,
  onEdit,
  index = 0,
  defaultOpen = false,
}: LeadListCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const style = STATUS_STYLES[lead.status];
  const priority = lead.priority ?? "medium";
  const tone = getLeadToneStyle(lead.serviceType);
  const ServiceIcon = getLeadServiceIcon(lead.serviceType);
  const waMessage = `Hi ${lead.fullName.split(" ")[0]}, following up regarding your enquiry on my YVITY profile.`;
  const sectionId = `lead-body-${lead.id}`;
  const subtitle = [serviceLabel(lead.serviceType), lead.city].filter(Boolean).join(" · ");

  const hasFollowUp = Boolean(lead.followUpDate || lead.followUpType);
  const messageText = lead.message?.trim() ?? "";
  const notesText = lead.notes?.trim() ?? "";
  const hasMessage = Boolean(messageText);
  const hasNotes = Boolean(notesText) && notesText !== messageText;

  return (
    <article
      className={cn(
        "group relative w-full overflow-hidden",
        "rounded-2xl border border-white/10 glass-strong",
        // Animate only the visual chrome that actually changes on
        // hover — `transition-all` was forcing every property
        // (transform / backdrop-filter) to re-evaluate on every
        // mouse move, which spiked CPU on long pipelines.
        "transition-[border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none",
        "hover:border-white/20 hover:shadow-xl hover:shadow-black/15",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none",
        open && "border-white/20 shadow-lg shadow-black/20",
      )}
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      {/* Left tone ribbon — gives every card a service-coloured edge. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 bottom-0 w-1",
          tone.stripe,
          "opacity-90",
        )}
      />

      {/* Subtle hover tint over the whole card. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-colors duration-500",
          tone.hoverTint,
        )}
      />

      {/* ──────────── Header (always visible, click to toggle) ──────────── */}
      <div className="relative flex items-stretch gap-1 pl-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={sectionId}
          className={cn(
            "flex flex-1 min-w-0 items-center gap-2.5 sm:gap-3 text-left",
            "py-3 pl-2.5 pr-1 sm:py-4 sm:pl-3",
            "transition-colors duration-200 hover:bg-white/[0.03] active:bg-white/[0.06]",
            "rounded-l-xl",
          )}
        >
          <span
            className={cn(
              "inline-flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl ring-1",
              tone.iconBg,
              tone.iconRing,
            )}
          >
            <ServiceIcon className={cn("size-5", tone.icon)} strokeWidth={2.1} />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] sm:text-base font-bold tracking-tight truncate">
              {lead.fullName}
            </h3>

            {/* Subtitle row.
                Mobile: service text + status pill side-by-side (pill never shrinks).
                Desktop: just the service · city text (pill lives in the right group). */}
            <div className="mt-0.5 flex items-center gap-1.5 min-w-0">
              <p className="text-[11.5px] sm:text-xs text-muted-foreground truncate min-w-0">
                {subtitle}
              </p>
              <StatusPill
                status={lead.status}
                badgeClass={style.badge}
                dotClass={style.dot}
                className="sm:hidden shrink-0"
              />
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pr-2 sm:pr-3">
          {/* Status pill — desktop only (mobile shows it in subtitle row). */}
          <StatusPill
            status={lead.status}
            badgeClass={style.badge}
            dotClass={style.dot}
            className="hidden sm:inline-flex"
          />

          <QuickAction href={telHref(lead.mobile)} label={`Call ${lead.fullName}`} variant="call">
            <Phone className="size-[18px]" strokeWidth={2.3} />
          </QuickAction>
          <QuickAction
            href={whatsAppHref(lead.mobile, waMessage)}
            label={`WhatsApp ${lead.fullName}`}
            variant="whatsapp"
            external
          >
            <MessageCircle className="size-[18px]" strokeWidth={2.3} />
          </QuickAction>

          {/* Chevron — visual indicator only. The whole header row is the
              toggle target (above), so making this a button too would
              double-announce expand state to screen readers. */}
          <span
            aria-hidden
            className={cn(
              "inline-flex size-9 sm:size-10 items-center justify-center rounded-lg shrink-0",
              "text-muted-foreground",
              "transition-transform duration-300",
            )}
          >
            <ChevronDown
              className={cn("size-[18px] transition-transform duration-300", open && "rotate-180")}
            />
          </span>
        </div>
      </div>

      {/* ──────────── Body (collapsible) ──────────── */}
      <div
        id={sectionId}
        className={cn(
          "grid transition-[grid-template-rows] duration-400 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "relative border-t border-white/8",
              "px-4 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5 pl-5 sm:pl-6",
              "space-y-3 sm:space-y-4",
            )}
          >
            {/* Metadata chips */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <MetaChip icon={Phone} label={lead.mobile} />
              {lead.city && <MetaChip icon={MapPin} label={lead.city} />}
              <MetaChip icon={Tag} label={serviceLabel(lead.serviceType)} />
              <MetaChip
                icon={null}
                label={`${priorityLabel(priority)} priority`}
                leading={priorityEmoji(priority)}
              />
              <MetaChip
                icon={null}
                label={sourceLabel(lead.channel)}
                leading={lead.channel === "yvity_public_profile" ? "🌐" : "✍️"}
              />
              <MetaChip icon={Calendar} label={`Added ${formatAddedDate(lead.createdAt)}`} />
              <MetaChip icon={Clock} label={formatLastActivity(lead.lastActivityAt)} />
            </div>

            {/* Follow-up reminder (if scheduled) */}
            {hasFollowUp && (
              <div
                className={cn(
                  "flex items-start gap-2 rounded-xl border px-3 py-2.5",
                  "bg-[oklch(0.82_0.13_205/0.06)] border-[oklch(0.82_0.13_205/0.25)]",
                )}
              >
                <CalendarClock className="size-4 mt-0.5 shrink-0 text-[oklch(0.82_0.13_205)]" />
                <p className="text-[12px] sm:text-xs leading-snug">
                  <span className="font-semibold text-[oklch(0.88_0.12_205)]">
                    Follow-up scheduled
                  </span>
                  {lead.followUpType && (
                    <>
                      {" "}
                      · <span className="capitalize">{lead.followUpType.replace(/_/g, " ")}</span>
                    </>
                  )}
                  {lead.followUpDate && (
                    <>
                      {" "}
                      ·{" "}
                      <span>
                        {new Date(lead.followUpDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                        {lead.followUpTime ? `, ${lead.followUpTime}` : ""}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Original enquiry message (platform leads) */}
            {hasMessage && (
              <div className={cn("rounded-xl border px-3 py-2.5", tone.chipBg, "border-white/10")}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Quote className={cn("size-3.5", tone.chipText)} />
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-[0.16em] font-bold",
                      tone.chipText,
                    )}
                  >
                    Enquiry message
                  </span>
                </div>
                <p className="text-[12.5px] sm:text-[13px] text-foreground/90 leading-relaxed">
                  {lead.message}
                </p>
              </div>
            )}

            {/* Notes (advisor-private) */}
            {hasNotes && (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-[12.5px] sm:text-[13px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            )}

            {/* Footer actions */}
            <div
              className={cn(
                "pt-2 flex items-center gap-2 md:justify-end",
                "border-t border-white/8",
              )}
            >
              <button
                type="button"
                onClick={onEdit}
                className={cn(
                  "inline-flex flex-1 md:flex-none items-center justify-center gap-2",
                  "h-9 md:h-9 px-4 rounded-xl text-[13px] font-medium",
                  "border border-white/12 bg-white/[0.03]",
                  "text-muted-foreground hover:text-foreground hover:bg-white/[0.07] hover:border-white/20",
                  "active:scale-[0.98] transition-all duration-200",
                )}
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={onManage}
                className={cn(
                  "inline-flex flex-1 md:flex-none items-center justify-center gap-2",
                  "h-9 md:h-9 px-5 rounded-xl text-[13px] font-semibold",
                  "border border-[oklch(0.82_0.13_205/0.45)] bg-[oklch(0.82_0.13_205/0.12)]",
                  "text-[oklch(0.88_0.12_205)] hover:bg-[oklch(0.82_0.13_205/0.22)]",
                  "hover:border-[oklch(0.82_0.13_205/0.6)] shadow-sm shadow-[oklch(0.82_0.13_205/0.15)]",
                  "active:scale-[0.98] transition-all duration-200",
                )}
              >
                Manage
                <ChevronDown className="size-3.5 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function StatusPill({
  status,
  badgeClass,
  dotClass,
  className,
}: {
  status: Lead["status"];
  badgeClass: string;
  dotClass: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border whitespace-nowrap",
        "px-1.5 py-0.5 sm:px-2 sm:py-1",
        "text-[10px] sm:text-[11px] font-semibold leading-none",
        badgeClass,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full shrink-0", dotClass)} />
      {statusLabel(status)}
    </span>
  );
}

function MetaChip({
  icon: Icon,
  label,
  leading,
  className,
}: {
  icon: ComponentType<{ className?: string }> | null;
  label: string;
  leading?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-white/10",
        "bg-white/[0.04] px-2 py-1 text-[11.5px] sm:text-xs text-foreground/90",
        className,
      )}
    >
      {leading ? (
        <span className="text-[13px] leading-none">{leading}</span>
      ) : Icon ? (
        <Icon className="size-3 sm:size-3.5 shrink-0 text-[oklch(0.82_0.13_205)]" />
      ) : null}
      {/* Cap the chip on every breakpoint so a single long value
          (e.g. a verbose service or distant city) can't push the row
          beyond the card's width on desktop. */}
      <span className="truncate max-w-[180px] sm:max-w-[260px] md:max-w-[320px]">{label}</span>
    </span>
  );
}

function QuickAction({
  href,
  label,
  variant,
  external,
  children,
}: {
  href: string;
  label: string;
  variant: "call" | "whatsapp";
  external?: boolean;
  children: ReactNode;
}) {
  const isCall = variant === "call";

  return (
    <a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        // 44px+ tap target on mobile (WCAG AA), 44px on desktop too.
        "inline-flex size-11 items-center justify-center rounded-xl border",
        "transition-all duration-200 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
        isCall
          ? cn(
              "border-[oklch(0.82_0.13_205/0.5)] bg-[oklch(0.82_0.13_205/0.15)]",
              "text-[oklch(0.88_0.12_205)] shadow-sm shadow-[oklch(0.82_0.13_205/0.2)]",
              "hover:bg-[oklch(0.82_0.13_205/0.28)] hover:border-[oklch(0.82_0.13_205/0.75)]",
              "focus-visible:ring-[oklch(0.82_0.13_205/0.6)]",
            )
          : cn(
              "border-[oklch(0.52_0.14_155/0.55)] bg-[oklch(0.52_0.14_155/0.18)]",
              "text-[oklch(0.78_0.12_155)] shadow-sm shadow-[oklch(0.52_0.14_155/0.2)]",
              "hover:bg-[oklch(0.52_0.14_155/0.32)] hover:border-[oklch(0.56_0.15_155/0.8)]",
              "focus-visible:ring-[oklch(0.52_0.14_155/0.5)]",
            ),
      )}
    >
      {children}
    </a>
  );
}

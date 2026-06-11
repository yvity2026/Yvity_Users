"use client";

import Link from "next/link";
import { Bell, CheckCircle2, ExternalLink, PartyPopper, Sparkles } from "lucide-react";
import { DashboardPageEmpty } from "@/components/dashboard/dashboard-page-states";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";

function formatWhen(iso) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function NotificationIcon({ kind }) {
  if (kind === "profile_approved") {
    return <PartyPopper size={20} className="text-[#F59E0B]" />;
  }
  return <Bell size={20} className="text-[#0A4A4A]" />;
}

export default function DashboardNotifications({ showHeader = true, className = "" }) {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <div className={cn(showHeader ? "mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8" : className)}>
      {showHeader ? (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
              Notifications
            </h1>
            <p className="mt-2 font-poppins text-sm text-[#6B7280] sm:text-base">
              Account updates, profile approvals, and workspace alerts.
            </p>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-2 rounded-full border border-[#E4E2DB] bg-white px-4 py-2 font-poppins text-xs font-semibold text-[#0A4A4A] shadow-sm transition hover:border-[#0A4A4A]/20"
            >
              <CheckCircle2 size={14} />
              Mark all read
            </button>
          ) : null}
        </div>
      ) : unreadCount > 0 ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="inline-flex items-center gap-2 rounded-full border border-[#E4E2DB] bg-white px-3 py-1.5 font-poppins text-xs font-semibold text-[#0A4A4A] shadow-sm"
          >
            <CheckCircle2 size={14} />
            Mark all read
          </button>
        </div>
      ) : null}

      {loading ? (
        <section className="space-y-3" role="status" aria-busy="true" aria-label="Loading notifications">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-[24px] border border-[#E4E2DB] bg-white"
            />
          ))}
          <span className="sr-only">Loading notifications</span>
        </section>
      ) : notifications.length === 0 ? (
        <DashboardPageEmpty
          icon={Bell}
          title="No notifications yet"
          description="When your profile is approved or something needs your attention, it will appear here."
        />
      ) : (
        <section className="space-y-3">
          {notifications.map((item) => {
            const content = (
              <article
                className={cn(
                  "rounded-[24px] border bg-white p-5 shadow-sm transition hover:shadow-md",
                  item.read ? "border-[#E4E2DB]" : "border-[#0A4A4A]/20 ring-1 ring-[#F59E0B]/20",
                )}
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F8F6F1]">
                    <NotificationIcon kind={item.kind} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="font-cormorant text-xl font-bold text-[#0A4A4A]">
                        {item.title}
                      </h2>
                      {!item.read ? (
                        <span className="rounded-full bg-[#FFFBEB] px-2.5 py-0.5 font-poppins text-[10px] font-semibold uppercase tracking-wide text-[#B45309]">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-poppins text-sm leading-relaxed text-[#6B7280]">
                      {item.message}
                    </p>
                    <p className="mt-3 font-poppins text-xs text-[#9CA3AF]">
                      {formatWhen(item.createdAt)}
                    </p>
                  </div>
                </div>
              </article>
            );

            if (item.href) {
              const opensInNewTab = item.kind === "profile_approved";
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  target={opensInNewTab ? "_blank" : undefined}
                  rel={opensInNewTab ? "noopener noreferrer" : undefined}
                  onClick={() => {
                    if (!item.read) void markRead(item.id);
                  }}
                  className="block"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.read) void markRead(item.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !item.read) void markRead(item.id);
                }}
              >
                {content}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

export function DashboardApprovalBanner() {
  const { notifications, loading, markRead } = useNotifications();
  const approval = notifications.find((n) => n.kind === "profile_approved" && !n.read);

  if (loading || !approval) return null;

  return (
    <section className="rounded-3xl border border-[oklch(0.85_0.16_78/0.35)] bg-gradient-to-r from-[oklch(0.85_0.16_78/0.14)] via-white/5 to-[oklch(0.82_0.13_205/0.12)] p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[oklch(0.85_0.16_78/0.2)] text-[var(--yvity-accent-gold-strong)]">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--yvity-accent-gold-strong)]">
              Profile approved
            </p>
            <h3 className="mt-1 text-lg font-bold text-foreground">{approval.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{approval.message}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {approval.href ? (
            <Link
              href={approval.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[oklch(0.85_0.16_78)] px-4 py-2 text-xs font-semibold text-[#0A4A4A] transition hover:opacity-90"
            >
              View My Profile
              <ExternalLink className="size-3.5" />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void markRead(approval.id)}
            className="shrink-0 rounded-full border border-border bg-muted/60 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            Got it
          </button>
        </div>
      </div>
    </section>
  );
}

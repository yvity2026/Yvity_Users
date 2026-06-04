"use client";

import Link from "next/link";
import { Bell, Bookmark, MessageSquare, ShieldCheck } from "lucide-react";

const ACTIVITY_SECTIONS = [
  {
    icon: Bell,
    title: "Notifications",
    description: "Account updates, identity reminders, and workspace alerts.",
    href: "/dashboard/activity",
    badge: "Soon",
  },
  {
    icon: Bookmark,
    title: "Saved activity",
    description: "Profiles you saved and recent bookmark changes.",
    href: "/dashboard/saved",
  },
  {
    icon: MessageSquare,
    title: "Reviews & feedback",
    description: "Reviews you wrote and responses on your profile.",
    href: "/dashboard",
  },
  {
    icon: ShieldCheck,
    title: "Identity & trust",
    description: "Verification status and annual identity refresh.",
    href: "/dashboard/identity-refresh",
  },
];

export default function DashboardActivity() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8">
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
          Activity
        </h1>
        <p className="mt-2 font-poppins text-sm text-[#6B7280] sm:text-base">
          Everything that happened around your account — saves, reviews, alerts,
          and workspace updates.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ACTIVITY_SECTIONS.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.title}
              href={section.href}
              className="rounded-2xl border border-[#E4E2DB] bg-white p-5 shadow-sm transition hover:border-[#0A4A4A]/20 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F4F4] text-[#0A4A4A]">
                  <Icon size={20} />
                </div>
                {section.badge ? (
                  <span className="rounded-full bg-[#FFFBEB] px-2.5 py-1 font-poppins text-[10px] font-semibold uppercase tracking-wide text-[#B45309]">
                    {section.badge}
                  </span>
                ) : null}
              </div>
              <h2 className="font-cormorant text-xl font-bold text-[#0A4A4A]">
                {section.title}
              </h2>
              <p className="mt-1 font-poppins text-sm text-[#6B7280]">
                {section.description}
              </p>
            </Link>
          );
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-dashed border-[#E4E2DB] bg-[#F8F6F1] px-6 py-10 text-center">
        <p className="font-cormorant text-xl font-bold text-[#0A4A4A]">
          Your activity feed is coming next
        </p>
        <p className="mx-auto mt-2 max-w-md font-poppins text-sm text-[#6B7280]">
          Phase-1 keeps search on Home. Activity will show a unified timeline
          once backend events are connected.
        </p>
      </section>
    </div>
  );
}

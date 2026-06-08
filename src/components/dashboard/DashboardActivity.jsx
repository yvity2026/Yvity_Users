"use client";

import Link from "next/link";
import { Bell, Bookmark, MessageSquare, ShieldCheck } from "lucide-react";
import DashboardNotifications from "@/components/dashboard/DashboardNotifications";

const ACTIVITY_SECTIONS = [
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
        <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">Activity</h1>
        <p className="mt-2 font-poppins text-sm text-[#6B7280] sm:text-base">
          Notifications, saves, reviews, and workspace updates in one place.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="font-cormorant text-2xl font-bold text-[#0A4A4A]">Notifications</h2>
        <p className="mt-1 font-poppins text-sm text-[#6B7280]">
          Profile approvals, account updates, and workspace alerts.
        </p>
      </div>

      <DashboardNotifications showHeader={false} />

      <div className="mt-10 mb-4 flex items-center gap-2">
        <Bell size={18} className="text-[#0A4A4A]" />
        <h2 className="font-cormorant text-2xl font-bold text-[#0A4A4A]">More activity</h2>
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
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F4F4] text-[#0A4A4A]">
                <Icon size={20} />
              </div>
              <h2 className="font-cormorant text-xl font-bold text-[#0A4A4A]">{section.title}</h2>
              <p className="mt-1 font-poppins text-sm text-[#6B7280]">{section.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

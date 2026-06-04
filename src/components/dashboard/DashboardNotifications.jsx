import { Bell } from "lucide-react";

export default function DashboardNotifications() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 sm:py-8">
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl font-bold text-[#0A4A4A] sm:text-4xl">
          Notifications
        </h1>
        <p className="mt-2 font-poppins text-sm text-[#6B7280] sm:text-base">
          Updates about your account, saved profiles, and workspace.
        </p>
      </div>

      <section className="rounded-[28px] border border-[#E4E2DB] bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F6F1] text-[#0A4A4A]">
          <Bell size={24} />
        </div>
        <h2 className="font-cormorant text-2xl font-bold text-[#0A4A4A]">
          No notifications yet
        </h2>
        <p className="mx-auto mt-2 max-w-md font-poppins text-sm text-[#6B7280]">
          When something needs your attention — identity refresh, workspace
          updates, or saved profile activity — it will appear here.
        </p>
      </section>
    </div>
  );
}

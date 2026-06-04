import { AdminVerificationsModule } from "@/components/admin/admin-verifications-module";

export const metadata = {
  title: "Verification Review · YVITY Admin",
};

export default function AdminVerificationsPage() {
  return (
    <main className="pb-16">
      <div className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Admin</p>
          <h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">
            Verification Review
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Review supporting documents for services, career, certifications, and achievements.
          </p>
        </div>
        <AdminVerificationsModule />
      </div>
    </main>
  );
}

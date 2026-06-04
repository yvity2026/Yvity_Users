import { IrdaiApprovalsModule } from "@/components/admin/irdai-approvals-module";

export const metadata = {
  title: "IRDAI Approvals · YVITY Admin",
};

export default function IrdaiApprovalsPage() {
  return (
    <main className="pb-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Admin</p>
          <h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">IRDAI Approvals</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Review advisor IRDAI certificates and paid-plan submissions from YVITY Gold. Approving
            activates the public profile; rejecting sends the advisor back to action required with a
            reason.
          </p>
        </div>
        <IrdaiApprovalsModule />
      </div>
    </main>
  );
}

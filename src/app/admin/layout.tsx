import Link from "next/link";
import { YvityLogo } from "@/components/brand/yvity-logo";
import type { ReactNode } from "react";

const links = [
  { href: "/admin/irdaiapprovals", label: "IRDAI Approvals" },
  { href: "/admin/verifications", label: "Verifications" },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <YvityLogo size={32} showTagline />
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="http://localhost:3000/admin/irdaiapprovals"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 transition"
            >
              YVITY Dashboard (3000)
            </a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

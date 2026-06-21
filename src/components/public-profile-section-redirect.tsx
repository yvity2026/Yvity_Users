"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";

/**
 * Redirects old top-level section paths (e.g. /my-career) to the slug-prefixed
 * equivalent (e.g. /krishna-mohan-noti/my-career).
 */
export function PublicProfileSectionRedirect({ section }: { section: string }) {
  const homeHref = usePublicProfileNavHome();
  const router = useRouter();

  useEffect(() => {
    if (homeHref && homeHref !== "/profile") {
      router.replace(`${homeHref}/${section}`);
    }
  }, [homeHref, router, section]);

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-muted-foreground">
      Redirecting…
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePublicProfileNavHome } from "@/hooks/use-public-profile-nav-home";

/**
 * Redirects old top-level section paths (e.g. /my-career) to the slug-prefixed
 * equivalent (e.g. /krishna-mohan-noti/my-career).
 * No-ops when already at the slug-prefixed URL.
 */
export function PublicProfileSectionRedirect({ section }: { section: string }) {
  const homeHref = usePublicProfileNavHome();
  const router = useRouter();
  const pathname = usePathname();

  const alreadyAtSlug = Boolean(homeHref && homeHref !== "/profile" && pathname.startsWith(homeHref + "/"));

  useEffect(() => {
    if (homeHref && homeHref !== "/profile" && !alreadyAtSlug) {
      router.replace(`${homeHref}/${section}`);
    }
  }, [homeHref, router, section, alreadyAtSlug]);

  if (alreadyAtSlug) return null;

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-sm text-muted-foreground">
      Redirecting…
    </main>
  );
}

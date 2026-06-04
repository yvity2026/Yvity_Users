"use client";

import { useEffect, useState } from "react";

/**
 * Detects whether the current page was loaded as a "visitor preview" — i.e.
 * embedded inside the advisor workspace's `Public Profile` iframe.
 *
 * The advisor workspace renders the iframe with `?preview=public`. When that
 * query parameter is present, auth-aware site chrome (Navbar, SiteChrome)
 * should pretend the viewer is logged out so the iframe looks identical to
 * what a real visitor sees before logging in.
 *
 * Implementation detail: we read `window.location.search` from inside a
 * `useEffect` (rather than using `useSearchParams()`) so the surrounding
 * static page does NOT get forced into dynamic rendering at build time.
 */
export function useIsVisitorPreview(): boolean {
  const [isVisitorPreview, setIsVisitorPreview] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      setIsVisitorPreview(params.get("preview") === "public");
    } catch {
      // Malformed search — treat as a normal visit.
      setIsVisitorPreview(false);
    }
  }, []);

  return isVisitorPreview;
}

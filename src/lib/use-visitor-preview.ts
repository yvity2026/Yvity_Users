"use client";

import { useEffect, useState } from "react";

function readVisitorPreviewFromLocation(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("preview") === "public";
  } catch {
    return false;
  }
}

/**
 * Detects whether the current page was loaded as a "visitor preview" — i.e.
 * embedded inside the advisor workspace's `Public Profile` iframe.
 *
 * The advisor workspace renders the iframe with `?preview=public`. When that
 * query parameter is present, auth-aware site chrome (Navbar, SiteChrome)
 * should pretend the viewer is logged out so the iframe looks identical to
 * what a real visitor sees before logging in.
 */
export function useIsVisitorPreview(): boolean {
  const [isVisitorPreview, setIsVisitorPreview] = useState(readVisitorPreviewFromLocation);

  useEffect(() => {
    setIsVisitorPreview(readVisitorPreviewFromLocation());
  }, []);

  return isVisitorPreview;
}

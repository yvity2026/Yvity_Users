/** Server- and client-safe unique id helper (do not import from "use client" modules in API routes). */
export function uid(prefix = "id"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

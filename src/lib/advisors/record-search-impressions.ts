/** Fire-and-forget search impression telemetry for client-side result lists. */
export async function recordSearchImpressionsClient(
  advisorIds: string[],
  source: "dashboard_home" | "dashboard_explore" | "landing_search",
): Promise<void> {
  const ids = [...new Set(advisorIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) return;

  try {
    await fetch("/api/advisors/search-impressions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ advisorIds: ids, source }),
    });
  } catch {
    // Non-blocking — search UX should not fail if telemetry fails.
  }
}

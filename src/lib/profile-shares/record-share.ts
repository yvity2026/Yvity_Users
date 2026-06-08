/** Fire-and-forget share telemetry — only logged-in users reach the API. */
export async function recordProfileShare(advisorUserId: string | undefined | null): Promise<void> {
  const id = advisorUserId?.trim();
  if (!id) return;

  try {
    await fetch("/api/profile-shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ advisorUserId: id }),
    });
  } catch {
    // Non-blocking — share UX should still succeed if telemetry fails.
  }
}

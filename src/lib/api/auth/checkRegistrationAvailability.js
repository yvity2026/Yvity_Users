export async function checkRegistrationAvailability({ phone = "", email = "" } = {}) {
  const res = await fetch("/api/auth/check-registration", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, email }),
  });

  const data = await res.json();
  return res.ok
    ? data
    : { ...data, error: data.error || "Unable to check registration availability" };
}

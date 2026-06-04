export async function registerUser(formData) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  return res.ok ? data : { ...data, error: data.error || "Registration failed" };
}

export async function verifyEmailOtp(email, token) {
  const res = await fetch("/api/auth/verify-email-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });
  const data = await res.json();
  return res.ok ? data : { error: data.error || "Email OTP verification failed" };
}

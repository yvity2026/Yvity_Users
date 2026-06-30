export async function verifyOtp(phone, token, deviceToken = "", flow = "login") {
  console.info("[client:auth] verifyOtp called", {
    phone,
    tokenLength: String(token || "").length,
  });
  const res = await fetch("/api/auth/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, token, deviceToken, flow }),
  });
  const data = await res.json();
  return res.ok ? data : { ...data, error: data.error || "OTP verification failed" };
}

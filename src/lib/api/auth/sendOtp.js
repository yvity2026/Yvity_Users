export async function sendOtp(phone, flow = "login", options = {}) {
  console.info("[client:auth] sendOtp called", { phone });
  const res = await fetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, flow, ...options }),
  });
  const data = await res.json();
  return res.ok ? data : { ...data, error: data.error || "Unable to send OTP" };
}

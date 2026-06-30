export async function sendEmailOtp(email, flow = "register") {
  const res = await fetch("/api/auth/otp/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, flow }),
  });
  const data = await res.json();
  return res.ok ? data : { error: data.error || "Unable to send email OTP" };
}

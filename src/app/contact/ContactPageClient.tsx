"use client";

import { useState } from "react";
import Navbar from "@/yvity-landing/app/components/Navbar";
import Footer from "@/yvity-landing/app/components/Footer";
import { Mail, MessageSquare, Clock, CheckCircle } from "lucide-react";

export default function ContactPageClient() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] font-poppins">
      <Navbar />

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">

        {/* Header */}
        <div className="mb-10 text-center lg:mb-14">
          <p className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.18em] text-[#F59E0B]">
            Get in touch
          </p>
          <h1 className="font-cormorant text-4xl font-bold leading-tight text-[#0A4A4A] sm:text-5xl">
            Contact Support
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#4B5563] sm:text-base">
            Have a question, issue, or feedback? We're here to help. Reach us by email or fill in the form below.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">

          {/* Left — info cards */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <div className="rounded-2xl border border-[#E4E2DB] bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A4A4A]/8">
                <Mail className="h-5 w-5 text-[#0A4A4A]" />
              </div>
              <h3 className="mb-1 font-poppins text-sm font-semibold text-[#0A4A4A]">Email Support</h3>
              <p className="mb-3 text-xs leading-relaxed text-[#6B7280]">
                For account issues, billing, or general queries.
              </p>
              <a
                href="mailto:support@yvity.com"
                className="font-poppins text-sm font-semibold text-[#0A4A4A] underline-offset-2 hover:underline"
              >
                support@yvity.com
              </a>
            </div>

            <div className="rounded-2xl border border-[#E4E2DB] bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B]/12">
                <Clock className="h-5 w-5 text-[#D97706]" />
              </div>
              <h3 className="mb-1 font-poppins text-sm font-semibold text-[#0A4A4A]">Response Time</h3>
              <p className="text-xs leading-relaxed text-[#6B7280]">
                We respond to all queries within <strong className="text-[#0A4A4A]">24–48 business hours</strong>, Monday to Saturday, 9 AM – 6 PM IST.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E4E2DB] bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A4A4A]/8">
                <MessageSquare className="h-5 w-5 text-[#0A4A4A]" />
              </div>
              <h3 className="mb-1 font-poppins text-sm font-semibold text-[#0A4A4A]">Common Topics</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-xs text-[#6B7280]">
                {["Profile verification & approval", "Membership & billing", "YVITY Score queries", "Technical issues", "Account access"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#F59E0B]" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-[#E4E2DB] bg-white p-7 shadow-sm sm:p-9">
              {status === "sent" ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0A4A4A]/8">
                    <CheckCircle className="h-8 w-8 text-[#0A4A4A]" />
                  </div>
                  <h3 className="font-cormorant text-2xl font-bold text-[#0A4A4A]">Message sent!</h3>
                  <p className="max-w-sm text-sm leading-relaxed text-[#6B7280]">
                    We've received your message and sent a confirmation to your email. We'll get back to you within 24–48 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-2 rounded-full bg-[#0A4A4A] px-6 py-2.5 text-sm font-semibold text-[#F59E0B] transition hover:opacity-90"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h2 className="font-cormorant text-2xl font-bold text-[#0A4A4A]">Send us a message</h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#374151]">Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        className="rounded-xl border border-[#E4E2DB] bg-[#F8F6F1] px-4 py-2.5 text-sm text-[#0A4A4A] outline-none placeholder:text-[#9CA3AF] focus:border-[#0A4A4A] focus:ring-2 focus:ring-[#0A4A4A]/10"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#374151]">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="rounded-xl border border-[#E4E2DB] bg-[#F8F6F1] px-4 py-2.5 text-sm text-[#0A4A4A] outline-none placeholder:text-[#9CA3AF] focus:border-[#0A4A4A] focus:ring-2 focus:ring-[#0A4A4A]/10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#374151]">Subject <span className="text-red-500">*</span></label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="rounded-xl border border-[#E4E2DB] bg-[#F8F6F1] px-4 py-2.5 text-sm text-[#0A4A4A] outline-none focus:border-[#0A4A4A] focus:ring-2 focus:ring-[#0A4A4A]/10"
                    >
                      <option value="">Select a topic</option>
                      <option>Profile verification & approval</option>
                      <option>Membership & billing</option>
                      <option>YVITY Score query</option>
                      <option>Technical issue</option>
                      <option>Account access</option>
                      <option>Feature request</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#374151]">Message <span className="text-red-500">*</span></label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your issue or question in detail..."
                      required
                      rows={5}
                      className="resize-none rounded-xl border border-[#E4E2DB] bg-[#F8F6F1] px-4 py-3 text-sm text-[#0A4A4A] outline-none placeholder:text-[#9CA3AF] focus:border-[#0A4A4A] focus:ring-2 focus:ring-[#0A4A4A]/10"
                    />
                  </div>

                  {status === "error" && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="rounded-full bg-gradient-to-r from-[#0A4A4A] via-[#0D5555] to-[#0A4A4A] px-8 py-3 text-sm font-bold text-[#F59E0B] shadow-[0_4px_16px_rgba(10,74,74,0.2)] ring-1 ring-[#F59E0B]/40 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

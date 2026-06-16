import type { Metadata } from "next";
import Navbar from "@/yvity-landing/app/components/Navbar";
import Footer from "@/yvity-landing/app/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — YVITY",
  description: "Learn how YVITY collects, uses, and protects your personal data in compliance with India's Digital Personal Data Protection Act (DPDP) 2023.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F1] font-poppins">
      <Navbar />

      <main className="mx-auto w-full max-w-[860px] px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-36">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#F59E0B]">Legal</p>
          <h1 className="font-cormorant text-4xl font-bold leading-tight text-[#0A4A4A] sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-[#6B7280]">Last updated: June 2025 &nbsp;·&nbsp; Effective date: June 2025</p>
        </div>

        <div className="prose-yvity rounded-3xl border border-[#E4E2DB] bg-white px-7 py-10 shadow-sm sm:px-10 sm:py-12">

          <section className="mb-8">
            <p className="text-sm leading-relaxed text-[#374151]">
              YVITY ("we", "us", "our") is a SaaS platform that connects insurance advisors with clients across India. We operate at <strong>yvity.com</strong> and are committed to protecting your privacy. This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and your rights as a data principal under India's <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and applicable IT rules.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#374151]">
              By accessing or using YVITY, you agree to the practices described in this policy. If you do not agree, please discontinue use of our platform.
            </p>
          </section>

          <HR />

          <H2>1. Who We Are</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            YVITY is a technology platform designed to help IRDAI-registered insurance advisors build a verified professional profile, showcase their expertise, and connect with prospective clients. We are headquartered in India and operate exclusively within Indian jurisdiction.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#374151]">
            For privacy-related inquiries, contact us at: <a href="mailto:support@yvity.com" className="font-semibold text-[#0A4A4A] underline-offset-2 hover:underline">support@yvity.com</a>
          </p>

          <HR />

          <H2>2. Information We Collect</H2>

          <H3>2.1 Information You Provide Directly</H3>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li><strong>Registration data:</strong> Mobile number and/or email address used for OTP-based sign-up.</Li>
            <Li><strong>Profile information:</strong> Full name, professional photo (selfie), designation, city, bio, years of experience, and area of specialisation.</Li>
            <Li><strong>Career & education:</strong> Work history, educational qualifications, and professional certifications (e.g., IRDAI licence/certificate details).</Li>
            <Li><strong>Service listings:</strong> Insurance products and services you offer, pricing, and descriptions.</Li>
            <Li><strong>Gallery & media:</strong> Images you upload to showcase your work or office.</Li>
            <Li><strong>Testimonials & recommendations:</strong> Client testimonials and peer recommendations you submit or receive.</Li>
            <Li><strong>Payment information:</strong> Billing details submitted during membership plan purchase (processed securely by Razorpay — we do not store card numbers).</Li>
            <Li><strong>Support messages:</strong> Name, email, and message content when you contact support.</Li>
            <Li><strong>Verification documents:</strong> IRDAI certificate and other documents uploaded for profile verification.</Li>
          </ul>

          <H3>2.2 Information We Collect Automatically</H3>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li><strong>Usage data:</strong> Pages visited, features used, profile views, search appearances, and interaction timestamps.</Li>
            <Li><strong>Device & technical data:</strong> IP address, browser type, operating system, and device identifiers.</Li>
            <Li><strong>Session data:</strong> Login sessions managed via secure, HTTP-only cookies.</Li>
            <Li><strong>Activity signals:</strong> Login frequency and engagement patterns used to calculate your YVITY Score.</Li>
          </ul>

          <H3>2.3 Information From Third Parties</H3>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li><strong>WhatsApp (Meta):</strong> Delivery status of OTP and transactional messages sent through the WhatsApp Business API.</Li>
            <Li><strong>Razorpay:</strong> Payment confirmation, order status, and transaction identifiers for membership purchases.</Li>
          </ul>

          <HR />

          <H2>3. How We Use Your Information</H2>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li><strong>To provide the platform:</strong> Create and manage your advisor profile, enable discovery by clients, and power your YVITY Score.</Li>
            <Li><strong>For authentication:</strong> Verify your identity via OTP (WhatsApp or email) every time you log in.</Li>
            <Li><strong>Profile verification:</strong> Review uploaded documents to verify IRDAI credentials and approve your public profile.</Li>
            <Li><strong>Payment processing:</strong> Process membership plan payments via Razorpay and deliver invoices by email and WhatsApp.</Li>
            <Li><strong>Notifications:</strong> Send account updates, payment receipts, verification status, and platform announcements.</Li>
            <Li><strong>Platform improvement:</strong> Analyse aggregate usage patterns to improve features (no personal profiling for advertising).</Li>
            <Li><strong>Security & fraud prevention:</strong> Detect suspicious login activity and prevent unauthorised access.</Li>
            <Li><strong>Legal compliance:</strong> Retain records as required by applicable Indian law, including the DPDP Act and IT (Intermediary Guidelines) Rules.</Li>
          </ul>

          <HR />

          <H2>4. Legal Basis for Processing</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            Under the DPDP Act, 2023, we process your personal data on the following bases:
          </p>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li><strong>Consent:</strong> You consent when you register and accept these terms. You may withdraw consent at any time by deleting your account.</Li>
            <Li><strong>Contractual necessity:</strong> Processing required to deliver the services you signed up for (profile hosting, OTP login, payment invoices).</Li>
            <Li><strong>Legitimate interests:</strong> Platform security, fraud detection, and aggregate analytics.</Li>
            <Li><strong>Legal obligation:</strong> Compliance with Indian law, including responding to lawful government requests.</Li>
          </ul>

          <HR />

          <H2>5. How We Store and Protect Your Data</H2>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li><strong>Infrastructure:</strong> All data is stored in Supabase (PostgreSQL) hosted on secure cloud infrastructure with encryption at rest and in transit (TLS 1.2+).</Li>
            <Li><strong>Access controls:</strong> Production database access is restricted to server-side services only. No client-side code can access the database directly.</Li>
            <Li><strong>Authentication tokens:</strong> Session tokens are stored in secure, HTTP-only cookies to prevent XSS theft.</Li>
            <Li><strong>OTP validity:</strong> OTP codes expire after 10 minutes and are single-use.</Li>
            <Li><strong>Payment security:</strong> Card and payment data is handled entirely by Razorpay (PCI-DSS compliant). YVITY never stores raw payment card details.</Li>
            <Li><strong>Document storage:</strong> Verification documents are stored in access-controlled cloud storage, accessible only to authorised YVITY administrators.</Li>
          </ul>

          <HR />

          <H2>6. Sharing Your Information</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            We do not sell your personal data. We share it only in the following limited circumstances:
          </p>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li><strong>Public profile:</strong> Information you explicitly add to your profile (name, photo, bio, services, testimonials, gallery) is visible to anyone who visits your public profile URL.</Li>
            <Li><strong>Service providers:</strong> Razorpay (payments), Meta/WhatsApp Business API (messaging), Resend or SMTP providers (email delivery). These processors handle data only as directed by us.</Li>
            <Li><strong>Legal requirements:</strong> We may disclose data to law enforcement or regulatory authorities where required by law or to protect the rights and safety of YVITY and its users.</Li>
            <Li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of YVITY, user data may be transferred to the acquiring entity with appropriate notice to users.</Li>
          </ul>

          <HR />

          <H2>7. Data Retention</H2>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li>Active accounts: Data retained for the duration of your account.</Li>
            <Li>Deleted accounts: Personal data is removed within 30 days of account deletion, except where retention is required by law (e.g., financial records retained for 7 years as required by Indian accounting law).</Li>
            <Li>OTP records: Retained for 90 days for security auditing, then purged.</Li>
            <Li>Payment records: Retained for 7 years as required by Indian financial regulations.</Li>
          </ul>

          <HR />

          <H2>8. Cookies and Tracking</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            YVITY uses essential cookies only:
          </p>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li><strong>Session cookies:</strong> Maintain your login state. Deleted when you log out or close your browser.</Li>
            <Li><strong>Preference cookies:</strong> Remember UI preferences (e.g., dark/light mode).</Li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-[#374151]">
            We do not use advertising cookies, cross-site tracking pixels, or third-party analytics services (e.g., Google Analytics) that track you across websites.
          </p>

          <HR />

          <H2>9. Your Rights Under DPDP Act, 2023</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            As a data principal, you have the following rights. To exercise any of these, email <a href="mailto:support@yvity.com" className="font-semibold text-[#0A4A4A] underline-offset-2 hover:underline">support@yvity.com</a> with your registered email or phone number:
          </p>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#374151]">
            <Li><strong>Right to access:</strong> Request a copy of the personal data we hold about you.</Li>
            <Li><strong>Right to correction:</strong> Request correction of inaccurate or incomplete data.</Li>
            <Li><strong>Right to erasure:</strong> Request deletion of your personal data (subject to legal retention obligations).</Li>
            <Li><strong>Right to withdraw consent:</strong> Withdraw consent at any time; this will result in account deletion and cessation of services.</Li>
            <Li><strong>Right to grievance redressal:</strong> Lodge a complaint with our Grievance Officer (contact below) or with the Data Protection Board of India.</Li>
            <Li><strong>Right to nominate:</strong> Nominate a trusted person to exercise your rights in the event of death or incapacity.</Li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-[#374151]">
            We will respond to verifiable requests within 30 days.
          </p>

          <HR />

          <H2>10. Children's Privacy</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            YVITY is intended for adults and licensed insurance professionals. We do not knowingly collect personal data from individuals under the age of 18. If we become aware that a minor has provided us with personal data, we will delete it promptly.
          </p>

          <HR />

          <H2>11. Data Transfers</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            Our primary data storage is within India. Where third-party service providers (e.g., email delivery services) process data outside India, we ensure appropriate contractual safeguards are in place consistent with the DPDP Act and applicable rules.
          </p>

          <HR />

          <H2>12. Grievance Officer</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            In accordance with the IT Act, 2000 and the DPDP Act, 2023, our Grievance Officer can be reached at:
          </p>
          <div className="mt-3 rounded-xl bg-[#F8F6F1] p-4 text-sm text-[#374151]">
            <p className="font-semibold text-[#0A4A4A]">Grievance Officer — YVITY</p>
            <p className="mt-1">Email: <a href="mailto:support@yvity.com" className="font-semibold text-[#0A4A4A] underline-offset-2 hover:underline">support@yvity.com</a></p>
            <p>Jurisdiction: India</p>
            <p className="mt-1 text-xs text-[#6B7280]">We acknowledge complaints within 48 hours and resolve them within 30 days.</p>
          </div>

          <HR />

          <H2>13. Changes to This Policy</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            We may update this Privacy Policy from time to time. When we make material changes, we will notify you via email or a prominent notice on the platform at least 14 days before the change takes effect. Continued use of YVITY after the effective date constitutes acceptance of the revised policy.
          </p>

          <HR />

          <H2>14. Contact Us</H2>
          <p className="text-sm leading-relaxed text-[#374151]">
            For any privacy-related questions or to exercise your rights, contact us at:
          </p>
          <div className="mt-3 rounded-xl bg-[#F8F6F1] p-4 text-sm text-[#374151]">
            <p className="font-semibold text-[#0A4A4A]">YVITY Support</p>
            <p className="mt-1">Email: <a href="mailto:support@yvity.com" className="font-semibold text-[#0A4A4A] underline-offset-2 hover:underline">support@yvity.com</a></p>
            <p>Platform: <a href="https://yvity.com/contact" className="font-semibold text-[#0A4A4A] underline-offset-2 hover:underline">yvity.com/contact</a></p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function HR() {
  return <hr className="my-8 border-[#E4E2DB]" />;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 font-cormorant text-2xl font-bold text-[#0A4A4A]">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-5 font-poppins text-sm font-semibold text-[#0A4A4A]">{children}</h3>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
      <span>{children}</span>
    </li>
  );
}

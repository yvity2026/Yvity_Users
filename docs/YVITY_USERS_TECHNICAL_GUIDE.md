# YVITY Users — Technical Onboarding Guide

**Product:** YVITY Users (Advisor & Customer Platform)  
**Repository:** Yvity_Users  
**Audience:** New engineers, QA, and technical stakeholders  
**Last updated:** June 2026

---

## Table of Contents

1. [What is YVITY Users?](#1-what-is-yvity-users)
2. [Who Are the Users?](#2-who-are-the-users)
3. [Registration — Step by Step](#3-registration--step-by-step)
4. [After Registration — Dashboard](#4-after-registration--dashboard)
5. [My Space — Advisor Workspace](#5-my-space--advisor-workspace)
6. [Public Profile — What Visitors See](#6-public-profile--what-visitors-see)
7. [YVITY Score — How It Is Calculated](#7-yvity-score--how-it-is-calculated)
8. [Contact, Leads & Request Call Back](#8-contact-leads--request-call-back)
9. [Profile Approval (IRDAI) Workflow](#9-profile-approval-irdai-workflow)
10. [Membership Plans & Limits](#10-membership-plans--limits)
11. [Data Storage & Key APIs](#11-data-storage--key-apis)
12. [Developer Quick Reference](#12-developer-quick-reference)

---

## 1. What is YVITY Users?

YVITY Users is a Next.js web application where:

- **Insurance advisors** build a verified, shareable public profile (services, career, achievements, testimonials, gallery, intro video).
- **Customers** discover advisors, compare YVITY Scores, and contact advisors.
- **YVITY** verifies identity (selfie + OTP), IRDAI credentials, and content to build trust.

The app has three major surfaces:

| Surface | URL pattern | Purpose |
|---------|-------------|---------|
| Marketing / landing | `/` | Brand site, find advisors, register |
| Logged-in dashboard | `/dashboard/*` | Home, My Space, profile, saved advisors |
| Public advisor profile | `/{slug}` | Live profile visitors see and share |

---

## 2. Who Are the Users?

### 2.1 Customer (default role)

Every person who completes registration starts as a **customer**.

- Can browse advisors on Dashboard Home and Explore.
- Can save advisor profiles.
- Can submit contact forms on public profiles.
- Does **not** have an advisor workspace until they opt in.

**Role in session:** `roles: ["customer"]`

### 2.2 Advisor (opt-in role)

A customer becomes an advisor when they start **My Space setup**.

- Adds `advisor` to roles: `["customer", "advisor"]`.
- Gets a workspace to manage career, services, testimonials, etc.
- Gets a public profile slug (e.g. `/krishna-mohan-noti-167ec15f`).
- Must complete setup and (for paid plans) pass IRDAI admin approval before the profile goes fully live.

**Advisor account statuses:**

| Status | Meaning |
|--------|---------|
| *(none)* | Customer only — no advisor profile submitted |
| `under_review` | Silver/Gold submitted; waiting for admin IRDAI approval |
| `active` | Approved — public profile live, full score unlocked |
| `action_required` | Admin rejected; advisor must fix and resubmit |

### 2.3 Admin (operational)

Admin pages exist for IRDAI approvals and content verification:

- `/admin/irdaiapprovals` — approve/reject advisor profiles
- `/admin/verifications` — review career, achievements, etc.

*Note: Admin APIs currently gate on signed-in session; dedicated admin RBAC is planned.*

---

## 3. Registration — Step by Step

**Entry:** `/register` or the global registration modal from the landing page.

### Step 1 — Verify mobile

1. User enters **name** and **Indian mobile number**.
2. App sends OTP via WhatsApp → `POST /api/auth/send-otp`.
3. User enters OTP → `POST /api/auth/verify-otp`.
4. Server sets `yvity_phone_verified` cookie.

### Step 2 — About you & email

1. User enters **date of birth**, **gender**, **email**.
2. Email OTP sent → verified via email OTP APIs.
3. Server sets `yvity_email_verified` cookie.

### Step 3 — Your profile

1. User enters **city**, **state**, **profession** (e.g. "Life Insurance Advisor").
2. Validated client-side only.

### Step 4 — Identity check (selfie)

1. User captures or uploads a **selfie**.
2. Uploaded via `POST /api/auth/upload-selfie`.
3. This selfie becomes the **default profile photo** everywhere (public profile, cards, dashboard) until changed via Profile & account (requires mobile + email OTP).

### Final submit

1. `POST /api/auth/register` checks both OTP cookies, creates user record, sets session cookie.
2. Response: `{ redirectUrl: "/dashboard" }`.
3. User lands on **Dashboard Home**.

**Key files:** `src/app/api/auth/register/route.ts`, `src/components/auth/RegistrationModal.jsx`

---

## 4. After Registration — Dashboard

**Route:** `/dashboard`  
**Gate:** Must be logged in (`src/app/dashboard/layout.tsx` redirects otherwise).

### Layout

- **Top bar** — logo, navigation, profile avatar.
- **Bottom nav (mobile)** — Home, My Network, My Space.

### Main sections

| Route | Name | What the user sees |
|-------|------|-------------------|
| `/dashboard` | **Home** | Greeting, advisor search, featured/recommended advisors, service chips |
| `/dashboard/my-space` | **My Space** | Advisor workspace hub (see Section 5) |
| `/dashboard/profile` | **Profile & account** | Name, contact, selfie, identity refresh |
| `/dashboard/activity` | **Notifications** | Approval alerts, leads, testimonials |
| `/dashboard/saved` | **Saved** | Bookmarked advisor profiles |
| `/dashboard/explore` | **Explore** | Full advisor search results |
| `/dashboard/identity-refresh` | **Identity refresh** | Annual selfie re-verification |

### Customer vs advisor on Home

- **Customer:** Sees "Find verified advisors", search, advisor cards.
- **Advisor (with active workspace):** Same discovery UI plus onboarding prompts if setup is incomplete.

**Key files:** `src/components/dashboard/DashboardShell.jsx`, `src/components/dashboard/DashboardHome.jsx`

---

## 5. My Space — Advisor Workspace

**Route:** `/dashboard/my-space`

This is the advisor's **control centre** for building and managing their YVITY presence.

### 5.1 State machine (what you see first)

```
Not an advisor yet
    → "Setup My Space" card
    → POST /api/auth/advisor-intent (adds advisor role)
    → Opens Setup My Profile wizard

Setup incomplete
    → Same setup wizard / banner

Under review (Silver/Gold)
    → IRDAI pending banner
    → Workspace visible in "review mode" (limited sharing/score)

Active advisor
    → Full YVITY Gold workspace
```

**Key file:** `src/lib/advisor/workspaceSetupStatus.js`

### 5.2 Setup wizard (5 steps)

| Step | Title | What happens |
|------|-------|--------------|
| 1 | Industry & Services | Select insurance categories (Life, Health, General, Mutual Funds) |
| 2 | Service Details | Per-service provider, experience, clients, documents |
| 3 | Verification Documents | Upload IRDAI / license documents |
| 4 | Choose Plan | Free, Silver, or Gold |
| 5 | Review & Submit | Submit → `POST /api/customer/setprofile` |

**After submit:**

- **Free plan** → `account_status: active` immediately (profile can go live).
- **Silver/Gold** → Razorpay payment → `account_status: under_review` until admin approves.

**Key files:** `src/components/advisor/setup-profile/SetupMyProfileFlow.jsx`, `src/app/api/customer/setprofile/route.ts`

### 5.3 Full workspace sections

Once setup is done, My Space opens **YvityGoldMySpaceDashboard** with a card grid and drill-in sections:

| Section | Purpose |
|---------|---------|
| **Dashboard** | YVITY Score snapshot, profile health, quick actions, leads summary |
| **Public Profile** | Mobile/desktop preview of live profile + share tools |
| **Leads** | Inbound enquiries from contact form and manual entries |
| **My Career** | Professional journey timeline |
| **Services** | Insurance products offered (Life, Health, etc.) |
| **Achievements** | MDRT, COT, awards |
| **Testimonials** | Text, audio, video client reviews |
| **Gallery** | Photo gallery |
| **YVITY Score** | Detailed score breakdown and improvement tips |
| **Settings** | Visibility toggles, contact buttons, leads, theme |

**Key files:** `src/components/advisor/advisor-my-space-workspace.tsx`, `src/lib/my-space-sections.ts`, `src/lib/advisor-nav.ts`

### 5.4 Typical advisor journey (summary)

```
Register → Dashboard Home → My Space → Setup wizard (5 steps)
    → Edit sections (Career, Services, Testimonials…)
    → Preview public profile
    → (If paid) Wait for IRDAI approval
    → Share live URL /{slug}
    → Receive leads & grow YVITY Score
```

---

## 6. Public Profile — What Visitors See

### 6.1 URL

Each approved advisor gets a unique slug:

```
https://yvity-users.vercel.app/krishna-mohan-noti-167ec15f
```

Legacy routes like `/services`, `/my-career` still work when browsing inside an advisor's profile context (cookie sets which advisor's data to load).

### 6.2 Page structure (home tab)

1. **Profile header** — photo, name, designation, MDRT badge, rating, experience, Call / Request Call Back / Share.
2. **Trust section** — YVITY Score, intro video.
3. **Community trust stats** — profile views, recommendations, testimonials, shares.
4. **Quick actions** — links to services, career, testimonials.
5. **Why choose me** — strengths derived from profile data.
6. **Latest highlights** — recent achievements/testimonials.
7. **Career teaser** — journey preview.
8. **Bottom CTA card** — advisor photo, highlights, contact buttons.

### 6.3 Section pages

| Page | Banner shows |
|------|--------------|
| My Career | Journey headline + stats (experience, rating, company, verified) |
| Services | Service categories grid |
| Achievements | Awards count, MDRT status, experience |
| Testimonials | Review counts by type + average rating |
| Gallery | Photo stats |

Each section page ends with the same **advisor CTA card** (contact actions).

### 6.4 Visibility controls

Advisors can hide sections via **Settings → Visibility** (career, gallery, intro video, etc.). Plan limits may also cap testimonials/gallery counts on the public view.

### 6.5 Who can see what

| Viewer | Access |
|--------|--------|
| Anonymous visitor | Live approved profile only |
| Profile owner | Own profile even if under review; preview mode `?preview=public` |
| Owner in workspace | iframe preview before approval |

**Key files:** `src/app/[slug]/page.tsx`, `src/components/home/profile-home-hero.tsx`, `src/lib/server/public-view-context.ts`

---

## 7. YVITY Score — How It Is Calculated

**Maximum score:** 100 points across three categories.

### 7.1 Identity (30 points)

| Signal | Points |
|--------|--------|
| Profile photo (selfie) uploaded | 10 |
| Mobile + email verified | 5 |
| IRDAI license approved by admin | 5 |
| Intro video uploaded (plan-gated) | 10 |

*If IRDAI is uploaded but pending approval, identity shows "awaiting admin" — points unlock on approval.*

### 7.2 Visibility (30 points)

| Signal | Points |
|--------|--------|
| Public profile active (approved) | 10 |
| Advisor self-shares (1 pt per 5 shares, max 5) | 5 |
| Client shares (1 pt per unique sharer, max 5) | 5 |
| Profile strength (completeness) | 5 |
| Monthly login days | 5 |

**Important:** Visibility points (especially shares) only accrue **after IRDAI approval**.

### 7.3 Trust (40 points)

| Signal | Points |
|--------|--------|
| Testimonials (text / audio / video) | up to 15 |
| Verified OTP recommendations | up to 15 |
| Achievements (MDRT, COT, TOT tiers) | up to 10 |

### 7.4 Score decay (post-approval)

After a **30-day grace period** from account creation, inactive months reduce score:

| Inactivity | Penalty per month |
|------------|-------------------|
| 0 profile views | −1 (cap −10) |
| Fewer than 5 self-shares | −1 (cap −5) |
| 0 client shares | −1 (cap −5) |
| 0 login days | −1 (cap −5) |

Maximum total decay penalty: **−25 points**.

### 7.5 Where score appears

- Public profile trust card
- Advisor card on Find Advisors / Dashboard Home
- My Space → Dashboard overview
- My Space → YVITY Score module (detailed breakdown)

**Key files:** `src/lib/advisor-score/build.ts`, `src/lib/advisor-score/decay.ts`, `src/lib/advisor-score/share-points.ts`

---

## 8. Contact, Leads & Request Call Back

### 8.1 Visitor flow

1. Visitor clicks **Request Call Back** on public profile (header, CTA card, or mobile bar).
2. **Get in Touch** modal opens with:
   - Quick actions: **Call**, **WhatsApp**, **Email** (each toggled in advisor settings).
   - **Contact form:** name, mobile, interests, message → **Send Message**.
3. Form submits to `POST /api/contact`.
4. Inquiry is stored and **synced to Leads** in My Space.

### 8.2 When the form shows

The callback form appears when:

- Contact form is enabled in advisor settings, **and**
- Profile is **IRDAI-approved (live)**, **or** lead settings allow public enquiries.

### 8.3 Leads in My Space

Advisors see leads in **My Space → Leads**:

- Origin: YVITY public profile, referral, or manual entry.
- Status tracking and follow-up.

**Key files:** `src/components/contact/contact-sheet.tsx`, `src/app/api/contact/route.ts`, `src/lib/server/leads-persistence.ts`

---

## 9. Profile Approval (IRDAI) Workflow

```
Advisor submits setup (Silver/Gold)
        ↓
account_status = under_review
        ↓
Admin opens /admin/irdaiapprovals
        ↓
    ┌───────────┴───────────┐
    ↓                       ↓
 APPROVE                 REJECT
    ↓                       ↓
active + approved_at    action_required
    ↓                       ↓
Public slug live        Advisor fixes & resubmits
Full YVITY Score
Notifications sent
```

**On approval:**

- Public URL goes live at `/{slug}`.
- Service verification badges sync.
- Advisor receives in-app, email, and WhatsApp notification.

**Key files:** `src/app/api/admin/approvals/route.ts`, `src/lib/server/admin-irdai-approvals.ts`, `src/lib/advisor/profile-approval.ts`

---

## 10. Membership Plans & Limits

| Feature | Free | Silver | Gold |
|---------|------|--------|------|
| Public profile | ✓ | ✓ | ✓ |
| IRDAI approval required | No (instant active) | Yes | Yes |
| Testimonials (audio/video) | 2 audio, 1 video | Unlimited audio, 5 video | Unlimited |
| Gallery photos | 5 | 25 | Unlimited |
| Intro video | ✗ | 30s (trust strip) | 120s (hero) |
| Recommendations | 1 | 15 | Unlimited |
| Leads visible | 5 | 25 | Unlimited |
| Profile themes | YVITY Brand only | +1 theme | All themes |
| YVITY verified service badge | ✗ | ✓ | ✓ |
| Appear in search | ✗ | ✗ | ✓ |
| Profile analytics | ✗ | ✗ | ✓ |
| Featured advisor eligibility | ✗ | ✗ | ✓ |

**Note:** If `account_status` is not `active`, effective plan limits downgrade to **Free** regardless of payment.

**Key files:** `src/lib/advisor-membership/plan-limits.ts`, `src/lib/advisor/planFeatures.ts`

---

## 11. Data Storage & Key APIs

### 11.1 Persistence modes

| Mode | When |
|------|------|
| **Local JSON** (`.data/` folder) | Default for local dev |
| **Supabase** | When Supabase env vars are configured |

Override: `YVITY_FORCE_LOCAL_DATA=true`  
Local writes are disabled on Vercel production.

### 11.2 Main data domains

| Domain | Local file | Notes |
|--------|------------|-------|
| Users | `.data/registration.json` | Name, phone, email, selfie URL |
| Advisor profiles | `.data/advisor-profiles.json` | Slug, status, plan |
| Services, career, etc. | `.data/{type}-{userId}.json` | Per-advisor sections |
| Settings | `.data/advisor-settings-{userId}.json` | Visibility, contact toggles |
| Leads | `.data/leads.json` | Synced from contact inquiries |
| Score activity | score activity store | Views, shares, logins for decay |

### 11.3 Essential API routes

| Area | Routes |
|------|--------|
| Auth | `/api/auth/register`, `me`, `send-otp`, `verify-otp`, `profile-photo` |
| Advisor | `/api/advisor/auth/me`, `score-activity`, `plan-limits` |
| Sections | `/api/career`, `services`, `achievements`, `gallery`, `testimonials`, `settings` |
| Public | `/api/public-view`, `public/advisor-display`, `public/profile-stats` |
| Contact | `/api/contact` |
| Leads | `/api/leads` |
| Admin | `/api/admin/approvals` |
| Payments | `/api/payments/razorpay/order`, `verify` |

### 11.4 Public view cookie

When a visitor opens `/{slug}`, the app sets `yvity-view-advisor` cookie so section APIs know **which advisor's data** to load on `/services`, `/my-career`, etc.

**Key file:** `src/lib/server/public-view-context.ts`

---

## 12. Developer Quick Reference

### Run locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Important env vars

- Supabase URL + keys → enables cloud persistence
- Razorpay keys → Silver/Gold payments
- WhatsApp / email OTP providers → registration OTP

### Key directories

```
src/app/              Next.js routes (pages + API)
src/components/       React UI (dashboard, advisor, sections, home)
src/lib/                Business logic (score, approval, sections, server)
src/context/            React context (auth, public profile view)
src/hooks/              Client hooks
.data/                  Local JSON persistence (dev)
docs/                   Documentation (this guide)
```

### Architecture flow (one page)

```
Landing → Register (4 steps) → Dashboard Home
                                    ↓
                              My Space setup (5 steps)
                                    ↓
                         Free: active  |  Paid: under_review
                                    ↓
                              Admin IRDAI approve
                                    ↓
                         Public profile /{slug} + YVITY Score
                                    ↓
                         Visitors → Contact → Leads
```

---

## Appendix — Glossary

| Term | Meaning |
|------|---------|
| **YVITY Score** | 0–100 credibility score based on identity, visibility, trust |
| **Slug** | URL-safe advisor identifier (e.g. `krishna-mohan-noti-167ec15f`) |
| **IRDAI** | Insurance regulator; license verification gate for paid plans |
| **MDRT** | Million Dollar Round Table — achievement tier |
| **Selfie** | Identity verification photo; default public profile picture |
| **My Space** | Advisor workspace inside `/dashboard/my-space` |
| **Public profile** | Visitor-facing page at `/{slug}` |
| **Lead** | Inbound enquiry from contact form or referral |

---

*For questions about this codebase, start with `src/components/providers.tsx` (app shell), `src/context/AuthUserContext.tsx` (auth), and `src/lib/server/public-view-context.ts` (public profile data routing).*

**© YVITY — Internal technical documentation**

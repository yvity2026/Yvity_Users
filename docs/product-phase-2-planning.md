# Product planning — saved for later implementation

Captured from product discussion (June 2026). Not implemented yet.

---

## Phase 2a: Leader ↔ Advisor account linking (separate accounts, separate billing)

### Model

- **Two fully separate YVITY accounts** (e.g. team leader + advisor spouse).
- **Each pays separately** — full profile, full verification, own subscription.
- **No merged public page** — leader slug and advisor slug stay distinct.
- **Linking** connects accounts for dashboard navigation and delegated work only.

### Leader dashboard

1. **Map my advisor profile** (button)
   - Search bar (name / mobile / public slug).
   - Select advisor → **Map to my profile**.
   - **OTP sent to advisor account mobile** → verify → link active.
   - Card appears: **My advisor profile** → one-tap opens advisor dashboard (delegate mode).

2. **My team / My network** — **Phase 2b** (same link engine later; directory + caps by plan; not in first slice).

### Advisor dashboard

- **My leader profile** (button) — only if an active link exists where this user is the advisor side.
- One-tap switch back to leader dashboard (mirror of leader flow).

### Switch & OTP policy (decided)

| Event | OTP required? |
|-------|----------------|
| Initial map / link | Yes → advisor mobile |
| Normal switch (trusted device) | No — one tap |
| Trust refresh | Yes — **twice per year** (~every 6 months rolling from last OTP) |
| New device | OTP (security; separate from twice-yearly refresh) |
| Advisor revokes link | Immediate — leader loses switch until new map + OTP |

### Revoke (decided)

- **Advisor → Settings → Connected leaders** → Remove access.
- **Immediate**: end delegate sessions, hide switch on leader dashboard, require new link to restore.

### Delegate permissions (decided)

Leader in advisor context: **delegated management**, not account takeover.

**Blocked (advisor-only, always):**

- Billing / plan / payments
- User identity: legal name, mobile, email, selfie, password, main IRDAI profile upload
- Account deletion / deactivation
- Service add / edit / delete (company, capacity, licence holder, consent)

**Allowed:**

- Public profile share, QR, copy link
- Gallery upload / edit
- Achievements add / edit
- Request testimonials, request recommendations
- Other content / engagement (leads TBD in 2b)
- Read notifications

**UI:** persistent banner — *Managing [Advisor name]'s profile — linked by their permission* + exit to leader profile.

**Server:** enforce permissions in API; audit log all delegate actions.

### Krishna + wife scenario (reference)

| Account | Public role | Share with |
|---------|-------------|------------|
| Leader (Krishna) | Team / agents, peer testimonials | Agents, partners |
| Advisor (wife / Varalakshmi) | Clients, client testimonials, her code | Clients |

Client business on wife's code; leader code for agency structure — **separate profiles**, link for day-to-day switching.

### Technical sketch (when building)

- Table: `profile_account_links` (`leader_user_id`, `advisor_user_id`, `status`, `linked_at`, `revoked_at`, `last_trust_otp_at`)
- APIs: link request, OTP verify, switch/delegate session, revoke, trust refresh
- Permission matrix per route + `audit_log`

---

## Phase 1.x / near-term: Operational display name (advisor settings)

### Problem

Profile/legal name matches **licence holder** (e.g. N Varalakshmi) but **another person runs client business** (e.g. Krishna Mohan Noti). Customers know Krishna for reviews, shares, callbacks — not only the name on the certificate.

### Proposed settings (below photo / mobile / email)

**Toggle:** *Would you like to display a name along with your profile name?* — **Yes / No** (default **No**).

| Setting | Public header & CTA cards |
|---------|---------------------------|
| **No** | Profile name only (registered / licence name) |
| **Yes** | Show **operational display name** entered in new field |

**New field (when Yes):** e.g. *Name clients know you by* — free text, e.g. `Krishna Mohan Noti` (separate from profile name; do not duplicate profile name in UI copy).

**Example**

- Profile name (account): `N Varalakshmi`
- Operational display name: `Krishna Mohan Noti`
- Public hero: primary line **Krishna Mohan Noti**; secondary line e.g. *Profile: N Varalakshmi* or licence holder already on service cards
- Licence holder on service rows unchanged (`Licence holder: N Varalakshmi (Self)` or relationship as configured)

### Compliance / transparency (required)

- **Licence holder** must remain visible (service cards + optional subtitle).
- Intro video should align with who meets clients.
- Admin review if display name + licence name mismatch without consent / Other licence holder flow.

### Suggested field names (implementation)

- `profileName` — existing registered name (IRDAI / account)
- `publicDisplayNameEnabled` — boolean
- `publicDisplayName` — string when enabled

### Where it applies when enabled

- Profile home hero (H1)
- Section advisor CTA blocks
- Share preview text (optional)
- **Not** a replacement for legal name in admin, verification, or documents

---

## Related (already discussed / partial in codebase)

- Per-service **Licence holder: Self / Other** + consent letter — `src/lib/advisor/service-license-holder.ts`, setup flow in `SetupMyProfileFlow.jsx`
- Team leader capacity on services — `serviceCapacity.ts`, `profile-hero-stat.ts`

---

## Status

| Item | Status |
|------|--------|
| Account linking + delegate switch | Planned — Phase 2a |
| My team / network | Planned — Phase 2b |
| Operational display name in settings | Planned — Phase 1.x / before or with 2a |

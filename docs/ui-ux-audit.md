# YVITY — UI/UX Audit

Compact, triage-friendly checklist covering the Public Profile and the
Advisor Workspace. Each finding is one or two lines, severity-tagged and
paired with a one-line suggested fix so the next step (decide what to
implement) is immediate.

No code changes have been made in this pass — this is purely the audit
document. Once you mark up which items to fix, I will switch to agent
mode and implement them.

---

## Legend

**Severity**

- `[high]` — broken / blocks user / accessibility violation
- `[med]` — visible inconsistency or friction
- `[low]` — polish

**Categories**

- `consistency` — visual / behavioural drift across surfaces
- `layout` — composition issue inside a single surface
- `responsive` — mobile / tablet / desktop reflow problem
- `a11y` — accessibility (contrast, focus, target size, semantics, labels)
- `motion` — animations, transitions, `prefers-reduced-motion` coverage
- `content` — copy, labels, terminology
- `nav` — navigation / IA / routing
- `state` — loading, empty, error, success, optimistic update
- `perf` — paint / layer / re-render cost

---

## 1. Public Profile

### 1.1 Home — hero / `ProfileHeaderBanner`

File: [src/components/home/profile-home-hero.tsx](src/components/home/profile-home-hero.tsx)

- `[high] a11y` Call Now button uses `text-primary` (brand teal) on a gold gradient — very low contrast, gets worse in Warm-Ivory / Clean-White where the gold lightens. Suggested fix: switch label to `text-background` or a dark slate so it inverts per theme.
- `[high] layout` `shadow-[oklch(0.85_0.16_78/0.35)]` on the same CTA is not a valid `box-shadow` (missing offset + blur), so the shadow silently does not render. Suggested fix: `shadow-[0_10px_30px_-12px_oklch(0.85_0.16_78/0.35)]`.
- `[med] content` Star rating only renders integer stars (`i < Math.floor(rating)`); a 4.5★ rating shows as 4 filled stars beside the numeric "4.5". Suggested fix: render a half-star at the floor index when `rating % 1 >= 0.25`.
- `[med] a11y` `ScoreInfoButton` is a `size-7` (28px) hit target, below the 44px guideline. Suggested fix: pad the touch area or wrap in an `inline-flex p-2 -m-2` hit box.
- `[med] a11y` Trust-card play overlay disables `<button>` but keeps the 70%-opacity play circle inside, so sighted users cannot tell it is disabled. Suggested fix: add a `cursor-default` plus tooltip "No intro video uploaded yet".
- `[med] content` `splitDisplayName()` drops the `text-gradient-brand` treatment entirely for single-word names, breaking the documented branding rule. Suggested fix: gradient the whole name in that case.
- `[low] perf` `HomeAdvisorPhoto` stacks two filtered halos (radial-gradient + `blur-2xl`) outside avatar bounds — high GPU layer cost. Suggested fix: collapse into a single halo.
- `[low] consistency` Hero mixes `bg-white/[0.04]` / `bg-white/[0.06]` / `bg-white/[0.03]` for the same "subtle surface" intent. Suggested fix: pick one opacity token for chip / pill surfaces.
- `[low] cleanup` `IntroVideoStrip`, `ReachOutToAdvisorSection`, `PublicProfileFooter` exist in `src/components/home/` but are not imported by `ProfileHomeHero`. Suggested fix: delete or re-wire them.

### 1.2 Trust strip — `HomeTrustSection`

File: [src/components/home/home-trust-section.tsx](src/components/home/home-trust-section.tsx)

- `[med] a11y` `YvityScoreProgressBar` sets `aria-valuenow={undefined}` while loading, which several screen readers announce as indeterminate even though the visual is 0. Suggested fix: set `aria-busy="true"` and keep `aria-valuenow={0}` until ready.
- `[low] consistency` "/ 100" suffix uses `text-muted-foreground` — contrast in Warm-Ivory drops to roughly 3.4:1 against the ivory glass. Suggested fix: bump to `text-foreground/60`.
- `[low] perf` Two stacked overlays (`bg-gradient` track + sheen) animate `transition-[width]` simultaneously. Suggested fix: drop the sheen overlay.

### 1.3 Community Trust

File: [src/components/home/community-trust-section.tsx](src/components/home/community-trust-section.tsx)

- `[med] responsive` `grid-cols-2 lg:grid-cols-4` skips `md`; iPad-portrait stays 2-up with large empty gutters. Suggested fix: `md:grid-cols-4` (or `md:grid-cols-2 lg:grid-cols-4` if 4-up is too wide on small md).

### 1.4 Why Choose Me

File: [src/components/home/why-choose-me-section.tsx](src/components/home/why-choose-me-section.tsx)

- `[low] a11y` `border-b border-white/8` renders at ~0.08 alpha — invisible in Warm-Ivory / Clean-White (below WCAG 1.4.11 non-text minimum). Suggested fix: `border-foreground/10`.

### 1.5 Quick Actions

File: [src/components/home/home-quick-actions-section.tsx](src/components/home/home-quick-actions-section.tsx)

- `[med] state` PDF / QR failures fall back to `window.alert(...)` — inconsistent with the rest of the app's modal / toast UX. Suggested fix: surface inline error using the same banner style as the recommend modal.
- `[low] consistency` Action icons use `size-[1.35rem]` arbitrary size — off-grid against the rest of the system (`size-5` / `size-[1.125rem]`). Suggested fix: snap to `size-5`.

### 1.6 Latest Highlights

File: [src/components/home/latest-highlights-section.tsx](src/components/home/latest-highlights-section.tsx)

- `[med] a11y` `ViewAllLink` text links have no visible focus ring. Suggested fix: `focus-visible:ring-2 focus-visible:ring-primary/40 rounded`.
- `[low] state` Section renders nothing when both latest items are missing, leaving an awkward gap. Suggested fix: render a neutral empty-state nudge.

### 1.7 Reach-advisor CTA — `SectionAdvisorCta`

File: [src/components/sections/section-advisor-cta.tsx](src/components/sections/section-advisor-cta.tsx)

- `[med] content` Same hardcoded 4-stars-plus-dimmed pattern as the hero (`i === 4 && opacity-40`) — bypasses `advisorProfile.rating`. Suggested fix: shared `StarRating` component driven by the rating value.
- `[low] consistency` Inline 2×2 / 1×4 stat tiles use a bespoke layout — not the canonical `StatCard`. Suggested fix: replace with `StatCard` (icon-left, growth/value/label rows).

### 1.8 Section profile banner

File: [src/components/sections/section-profile-banner.tsx](src/components/sections/section-profile-banner.tsx)

- `[med] consistency` Stat tiles are hand-rolled (icon-top, value, label) — diverges from `StatCard`. Suggested fix: swap to `StatCard` to share hover lift, growth pill and accent treatment.

### 1.9 Sub-page wrappers

Files: [src/app/services/page.tsx](src/app/services/page.tsx), [src/app/gallery/page.tsx](src/app/gallery/page.tsx), [src/app/my-career/page.tsx](src/app/my-career/page.tsx), [src/app/achievements/page.tsx](src/app/achievements/page.tsx), [src/app/testimonials/page.tsx](src/app/testimonials/page.tsx)

- `[med] consistency` `/services` is `<ServicesShowcase />` with no `<main>` wrapper and no `<h1>`, while `/my-career` wraps in `<main>` + `<h1>My Career</h1>`. Suggested fix: standardise — every public route has `<main>` + a page `<h1>` + `SectionProfileBanner` block.
- `[med] a11y` Loading states are plain text ("Loading profile…" / "Loading gallery…") — no skeleton. Suggested fix: small reusable `<PageSkeleton />` used by every public route.

### 1.10 Achievements showcase

File: [src/components/sections/achievements-showcase.tsx](src/components/sections/achievements-showcase.tsx)

- `[med] state` Uses native `confirm("Delete this achievement?")`; inconsistent with the otherwise modal-based delete flows. Suggested fix: tiny `<ConfirmDialog />` reused everywhere we delete.
- `[med] responsive` Editable sticky toolbar uses `top-16` — inside the workspace `embedded` mode the toolbar sits underneath the sticky `AdvisorWorkspaceHeader` and can overlap. Suggested fix: contextual offset via a `--header-h` CSS var or remove sticky when `embedded`.
- `[low] responsive` Grid jumps `sm:grid-cols-2 → lg:grid-cols-4` with no `md` step. Suggested fix: add `md:grid-cols-3`.

### 1.11 Testimonials showcase

File: [src/components/sections/testimonials-showcase.tsx](src/components/sections/testimonials-showcase.tsx)

- `[med] state` Same native `confirm("Delete your reply?")` anti-pattern. Suggested fix: shared `<ConfirmDialog />`.
- `[low] consistency` Empty-state copy differs from Achievements ("No testimonials match these filters." vs "No achievements in this category yet."). Suggested fix: shared empty-state copy template.

### 1.12 Services showcase + cards

Files: [src/components/sections/services-showcase.tsx](src/components/sections/services-showcase.tsx), [src/components/sections/service-detail-card.tsx](src/components/sections/service-detail-card.tsx), [src/components/sections/service-dashboard-card.tsx](src/components/sections/service-dashboard-card.tsx)

- `[low] a11y` `ServiceDetailCard` accordion header has both a parent `<button>` and a nested chevron button (`aria-expanded` set on both); screen readers announce two collapsible controls. Suggested fix: keep the header as the toggle, make the chevron `aria-hidden`.
- `[low] consistency` `BannerOnlyServiceCard` (Mutual Funds) does not adopt the accordion pattern, so the row hierarchy on mobile feels inconsistent. Suggested fix: optional — extend `ServiceDetailCard` to accept a `bannerOnly` mode so visual shell stays identical.

### 1.13 Gallery showcase

File: [src/components/gallery/gallery-showcase.tsx](src/components/gallery/gallery-showcase.tsx)

- `[med] a11y` `GalleryShowcase` renders a `<main>` element while parent `<GalleryPage>` also renders `<main>` — nested `<main>` is an a11y violation (one landmark per page only). Suggested fix: change inner element to `<section>`.
- `[med] responsive` `CategoryFilterBar` sticky `top-16` collides with the embedded workspace header on `md+`. Suggested fix: same `--header-h` CSS-var approach as achievements.
- `[low] state` Loading state is plain text "Loading gallery…". Suggested fix: shared `<PageSkeleton />`.
- `[low] state` `addPhoto` seeds the new item with a remote Unsplash URL; failures in air-gapped environments leave a broken card. Suggested fix: ship a tiny local placeholder asset.
- `[low] consistency` Featured spotlight uses `rounded-[2rem]`; the rest of the page uses `rounded-3xl`. Suggested fix: snap to `rounded-3xl`.
- `[low] a11y` Lightbox prev/next buttons translate outside the dialog on desktop (`-translate-x-14`). On `<lg` they live inside — fine — but on small `md` screens the negative translate can sit outside the safe area. Suggested fix: clamp via `lg:-translate-x-14` only.

### 1.14 Recommend Advisor modal

File: [src/components/testimonials/recommend-advisor-modal.tsx](src/components/testimonials/recommend-advisor-modal.tsx)

- `[high] content` `Demo OTP: 123456` hint is shown in the modal body — leaks demo behaviour in production builds and looks unprofessional. Suggested fix: gate behind `process.env.NODE_ENV !== "production"` (or remove and rely on a "Did not receive code?" link).
- `[med] a11y` Chip selection is a list of isolated `<button>`s. Screen readers cannot tell that multiple chips can be selected. Suggested fix: wrap in `role="group"` + `aria-multiselectable="true"`, or use `role="listbox"` semantics.
- `[low] state` After successful OTP, the OTP block stays expanded with the verified badge. Suggested fix: collapse to a single "✓ Mobile verified · 98***12345" row to save vertical space.

### 1.15 Intro-Video upload modal

File: [src/components/intro-video/intro-video-upload-modal.tsx](src/components/intro-video/intro-video-upload-modal.tsx)

- `[med] state` "Remove current intro video" persists immediately with no confirmation step. Suggested fix: confirm-then-remove (reuse the shared `<ConfirmDialog />`).
- `[low] consistency` Error banner color `text-[oklch(0.85_0.16_15)]` is hardcoded, not theme-aware. Suggested fix: use `text-destructive` and let theme tokens drive the hue.
- `[low] motion` Modal entry animation differs subtly from Add-Lead modal (`slide-in-from-bottom-4 sm:fade-in` vs `slide-in-from-bottom`). Suggested fix: extract a shared `useModalEntryAnimation` to standardise.

---

## 2. Advisor Workspace

### 2.1 Shell — `AdvisorDashboard`

File: [src/components/advisor-dashboard.tsx](src/components/advisor-dashboard.tsx)

- `[med] a11y` Two `<header>` landmarks render on the same page (mobile top bar + dashboard welcome `<header>`). Suggested fix: change the inner one to `<section>` (sidebar already correctly uses `<aside>`).
- `[med] a11y` Two `<h1>` per page — workspace header H1 plus dashboard welcome H1. Heading order violated on every workspace route. Suggested fix: demote the dashboard one to `<h2>`.
- `[med] motion` `key={'body-${topSection}-${profileSection}'}` remounts the active module on every navigation, replaying `animate-in fade-in` — combined with sidebar / bottom-nav transitions, mobile users see ~6 animations per tap. Suggested fix: animate only on first mount, drop the entrance on subsequent tab swaps.
- `[low] perf` Decorative blur halos sit inside the main scroll container and re-paint each scroll frame. Suggested fix: pull into a `position: fixed` decorative layer.

### 2.2 Workspace header

File: [src/components/advisor/advisor-workspace-header.tsx](src/components/advisor/advisor-workspace-header.tsx)

- `[med] content` Eyebrow "Advisor workspace" + title "{Name} Workspace" repeats "Workspace" twice. Suggested fix: drop the eyebrow or rename to "Console".
- `[low] responsive` Default tagline `line-clamp-1 md:line-clamp-2` may truncate mid-word on certain widths. Suggested fix: use `text-balance` and shorten default copy.

### 2.3 Desktop sidebar

File: [src/components/advisor/advisor-sidebar.tsx](src/components/advisor/advisor-sidebar.tsx)

- `[low] a11y` `aria-current="page"` is set on the Profile parent **and** the active child simultaneously — assistive tech announces two current pages. Suggested fix: only the leaf carries `aria-current`.
- `[low] consistency` Logout button uses bespoke red `oklch(0.72_0.18_15)` directly, bypassing the `--destructive` token. Suggested fix: migrate to `text-destructive` so light themes adapt.
- `[low] nav` Profile group auto-expands on entry but never auto-collapses on exit. Acceptable; confirm intent.

### 2.4 Mobile bottom nav + bottom sheet

File: [src/components/advisor/advisor-mobile-bottom-nav.tsx](src/components/advisor/advisor-mobile-bottom-nav.tsx)

- `[med] a11y` Each primary tab carries `aria-label={item.label}` AND a visible text label of the same value — screen readers announce the label twice. Suggested fix: drop `aria-label` from tabs that have visible text.
- `[med] nav` Profile tab re-opens the sub-section sheet on every tap (even when Profile is active) but the tap is silent — there is no way to dismiss the sheet via the same tab. Suggested fix: tap-active-Profile closes the sheet, or render the chevron as a visual cue.
- `[low] motion` Active state animates 5 properties simultaneously (background, ring, shadow, icon scale, indicator dot). Suggested fix: drive everything off a single `[data-active="true"]` attribute so reduce-motion can opt all out via one selector.
- `[low] visual` Active dot is `size-1` (4px). Easy to miss. Suggested fix: bump to `size-1.5` or move the glow into the icon row.

### 2.5 Dashboard Overview

File: [src/components/advisor/dashboard/advisor-dashboard-overview.tsx](src/components/advisor/dashboard/advisor-dashboard-overview.tsx)

- `[high] layout` `QuickAction` icon uses `size-4.5` — not a valid Tailwind class. The icon falls back to its intrinsic SVG size. Suggested fix: `size-[1.125rem]` or `size-5`.
- `[med] consistency` Lead-Summary tiles are inline implementations instead of the canonical `StatCard`. Suggested fix: replace with `StatCard accent="cyan|emerald|amber"` so they share growth pill, hover lift, skeleton and a11y.
- `[med] state` Loading skeleton renders 6 grey blocks while the live body has 8 sections. Suggested fix: render skeletons that approximate real sections (welcome card + 6 KPI + 4 lead-summary).
- `[med] consistency` `runAction(action)` hardcodes the string id `"health-intro-video"` — fragile. Suggested fix: add a typed `action.kind: "open-intro-video"` field on `DashboardAction`.
- `[low] consistency` `ProgressRing` size differs between Dashboard (72px) and Insights (88px / 48px). Suggested fix: standardise to `ProgressRing.sm = 48`, `md = 80`.
- `[low] motion` Mini 7-day bar chart has `transition-all` with no animation trigger — pointless. Suggested fix: drop the `transition-all`.

### 2.6 Public-Profile preview

File: [src/components/advisor/public-profile/public-profile-preview-module.tsx](src/components/advisor/public-profile/public-profile-preview-module.tsx)

- `[med] a11y` Decorative traffic-light dots in the faux browser chrome (`size-2.5` red/yellow/green) look clickable on touch screens. Suggested fix: desaturate to a single neutral dot triple and keep `aria-hidden`.
- `[med] state` Iframe shows no shimmer / skeleton while loading. Suggested fix: absolute-positioned spinner that hides on `iframe.onLoad`.
- `[low] responsive` Mobile view on `<lg` collapses share panel below the iframe (78dvh tall) — share controls live below the fold. Suggested fix: swap order or shrink iframe to ~60dvh on small screens.
- `[low] perf` Inline brand-icon SVGs (WhatsApp / X / Facebook / LinkedIn) are defined here AND also implied for the other share entry points. Suggested fix: extract to `components/icons/brand-icons.tsx` and reuse everywhere.

### 2.7 Leads — list

File: [src/components/advisor/leads/lead-list-card.tsx](src/components/advisor/leads/lead-list-card.tsx)

- `[med] nav` Whole header is a toggle button AND a separate chevron button toggles too — two click targets for the same action confuse a11y tools. Suggested fix: keep the header as toggle, make chevron `aria-hidden`.
- `[med] a11y` Call / WhatsApp action buttons render at `size-9` (36px) on mobile, below the 44px target. Suggested fix: bump to `size-11`.
- `[low] a11y` Whole-card `hoverTint` overlay tones the body, dropping text contrast in Warm-Ivory below ~4.0:1. Suggested fix: cap tint opacity to ~6% on light themes.

### 2.8 Leads — Add-Lead modal

File: [src/components/advisor/leads/add-lead-modal.tsx](src/components/advisor/leads/add-lead-modal.tsx)

- `[med] state` Success state auto-closes after 800ms — too quick on slow devices. Suggested fix: extend to ~1500ms or require a "Done" tap.
- `[med] a11y` No Escape-key handler closes the form (Escape only triggers if focus is inside a `<Dialog>`; this is a hand-rolled modal). Suggested fix: add a single `keydown` listener on mount.
- `[low] consistency` `SERVICE_TONE_ACTIVE` map duplicates the tone palette in `lib/leads/service-types`. Suggested fix: import from one source of truth.
- `[low] consistency` `SectionLabel` uses uppercase tracking while the rest of the app uses sentence-case `<Label>`. Suggested fix: pick one label style across the workspace.

### 2.9 Profile Management — sub-section host

File: [src/components/advisor/profile/profile-management-sheet.tsx](src/components/advisor/profile/profile-management-sheet.tsx)

- `[low] consistency` Sub-section accordion cards in the workspace differ subtly in size from the sidebar sub-rows. Suggested fix: share spacing tokens / row heights.

### 2.10 Insights

File: [src/components/advisor/insights/advisor-insights-module.tsx](src/components/advisor/insights/advisor-insights-module.tsx)

- `[med] content` Header eyebrow says "Phase 1" — leaks internal milestone naming to advisors. Suggested fix: replace with "Snapshot" or remove.
- `[med] content` Footer disclaimer "Profile views and service engagement use Phase-1 estimates until live analytics are connected." exposes pre-launch status. Suggested fix: reword as "Approximate values — full analytics roll out soon." or hide for `production`.
- `[low] responsive` Profile Performance grid `lg:grid-cols-5` with `col-span-2 md:col-span-1` on the 5th tile creates a 2-1-1 rhythm on `md`. Suggested fix: either 4 cards or 6.
- `[low] consistency` "Open leads" / "Manage" CTAs are bare `<button>`s with `text-primary` and no focus ring. Suggested fix: wrap in the shared `DashboardLinkButton`.
- `[low] consistency` ServiceRow on mobile renders Views / Leads label inline next to value; pattern not reused elsewhere. Suggested fix: factor into a shared `<KeyValueRow />`.

### 2.11 Membership

File: [src/components/advisor/membership/advisor-membership-module.tsx](src/components/advisor/membership/advisor-membership-module.tsx)

- `[med] state` `handleInvoice()` for view / download falls back to `window.alert(...)` — same anti-pattern as PDF quick action. Suggested fix: shared toast component for "feature coming soon" cases.
- `[med] consistency` Upgrade button uses gold hardcoded `border-[oklch(0.85_0.16_78/0.45)] text-[oklch(0.92_0.14_78)]`; in Clean-White / Warm-Ivory the cyan-tinted theme loses the gold accent identity. Suggested fix: introduce `--accent-gold` / `--on-accent-gold` tokens.
- `[low] responsive` Plan compare table is `hidden lg:block`; mobile users see only the 3 plan cards (no feature parity). Acceptable, but document or render a compact comparison list on `md`.
- `[low] consistency` `RenewalReminder` urgent banner uses 12% opacity background; visibility is weak in light themes. Suggested fix: bump opacity or add an icon.

### 2.12 Settings — module + group

Files: [src/components/advisor/settings/advisor-settings-module.tsx](src/components/advisor/settings/advisor-settings-module.tsx), [src/components/advisor/settings/settings-ui.tsx](src/components/advisor/settings/settings-ui.tsx)

- `[high] content` "Recommendation requests" description currently reads "Enable advisor-initiated testimonial request workflows." That's the testimonials feature, not the new chip-based recommendation flow. Suggested fix: update copy to "Allow visitors to recommend you via the chip-based recommendation form."
- `[med] state` Saving indicator is a tiny inline "Saving…" label — easy to miss. Suggested fix: add a transient toast on save success / failure (the Recommend modal already has a small one — promote to global).
- `[med] a11y` `emphasis="warning"` applies `bg-[oklch(0.85_0.16_78/0.06)]` — invisible in Warm-Ivory / Clean-White. Suggested fix: bump opacity to ~16% **or** add an `AlertTriangle` icon and a "Profile not accepting leads" badge.
- `[low] consistency` `SettingsGroup` shows a chevron only on mobile — desktop has no collapse affordance. Suggested fix: either add chevron to desktop or document that desktop is always-open.

### 2.13 Profile Appearance

File: [src/components/advisor/settings/profile-appearance-section.tsx](src/components/advisor/settings/profile-appearance-section.tsx)

- `[low] visual` Selected theme uses `bg-primary/8` — barely visible in Warm-Ivory. Suggested fix: bump to `bg-primary/15` on light themes (or use `data-[selected]` styling).
- `[low] consistency` "Default" pill placement varies per thumbnail aspect. Suggested fix: place it directly under the theme name with a fixed alignment.

---

## 3. Cross-cutting / system-wide

### 3.1 Themes — `globals.css` + `lib/profile-themes.ts`

Files: [src/app/globals.css](src/app/globals.css), [src/lib/profile-themes.ts](src/lib/profile-themes.ts)

- `[med] consistency` `text-white/N` is used in 100+ places for the "subtle text on glass" intent — but it does **not** invert in light themes, so the same elements turn invisible in Warm-Ivory / Clean-White. Suggested fix: project-wide replace `text-white/N` → `text-foreground/N` (or `text-muted-foreground`).
- `[med] consistency` Same issue for `border-white/N` (>150 occurrences). Suggested fix: replace with `border-foreground/N` or the `--border` token.
- `[low] consistency` Several components add `border border-white/10` **on top of** `glass-strong`, doubling the border in light themes. Suggested fix: rely on `glass-strong`'s built-in border and drop the additional class.
- `[low] consistency` Themes correctly invert glass / shadow tokens (`--yvity-glass-*`) but the per-component hardcoded `bg-[oklch(...)]` and `text-[oklch(...)]` colors bypass tokens entirely. Suggested fix: promote the per-accent oklch values into theme-aware vars (`--accent-cyan-soft`, `--accent-amber-strong`, etc.).

### 3.2 Typography

- `[med] consistency` `globals.css` defines a typography system (`.yvity-display`, `.yvity-section-h`, `.yvity-card-h`, `.yvity-sub-h`) — but almost no component actually uses it. Hero, Insights, Settings, Membership each hand-roll their own sizes. Suggested fix: migrate page H1s, section H2s and card H3s to the utility classes.
- `[low] consistency` Eyebrow labels mix `text-[10px]` / `text-[11px]` / `text-xs` / `text-[10.5px]`. Suggested fix: a single `.yvity-eyebrow` utility.

### 3.3 Spacing & radius rhythm

- `[low] consistency` `rounded-2xl sm:rounded-3xl` used inconsistently — public cards use the responsive pair, dashboard cards use `rounded-3xl` flat. Suggested fix: pick one per surface category and document.
- `[low] consistency` Common spacing values `gap-3 / gap-5 / p-3 / p-5 / p-6` are reused but with no documented step pattern. Suggested fix: add a quick "spacing scale" note to the type system block in `globals.css`.

### 3.4 Motion + reduced-motion coverage

- `[high] motion` `globals.css` already enforces `animation-duration: 0.001ms !important` and `transition-duration: 0.001ms !important` under `prefers-reduced-motion` — this **does** cover `animate-in *`. Good. *Re-classification of an earlier finding: this is healthy.*
- `[med] motion` Workspace body remounts on every nav, replaying `animate-in fade-in` ~300ms — perceived latency on every tap (see 2.1). Suggested fix: animate only on first mount.
- `[low] perf` `transition-all` used liberally on glass cards. Suggested fix: replace with targeted `transition-[transform,box-shadow,border-color]` (or `transition-colors transition-transform`) so paint-heavy properties don't transition.

### 3.5 Touch targets

- `[high] a11y` System-wide: ~8 distinct icon-only buttons measure 28–36px (`size-7` / `size-8` / `size-9`) — Score Info, Sidebar preview row, Bottom-sheet close, LeadList chevron, LeadList Call / WhatsApp, Preview-pane refresh, Share-CTA close, traffic-light chrome refresh. Below WCAG 2.5.5. Suggested fix: bulk-bump to `size-11` or pad an invisible hit area.

### 3.6 Focus visibility

- `[med] a11y` Many clickable cards (Latest Highlights, Achievements grid items, Lead-Summary tiles, dashboard QuickAction tiles, dashboard Health items) have no `focus-visible:ring-*`. Keyboard navigation through the workspace is largely invisible. Suggested fix: add a shared `cardFocusRing` utility (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background`) and apply to every interactive card.

### 3.7 Empty / loading / error states

- `[med] state` Skeleton vs. spinner vs. plain text is mixed across modules. Suggested fix: standardise:
  - List / grid loading → shimmer skeleton blocks (already used by Dashboard and Insights).
  - Modal action loading → submit button shows verb-ing state with disabled.
  - Section error → small inline banner with Retry (only Leads has this today).
- `[low] state` Empty states use 3 different visual treatments (dashed border + icon, dashed border + text, nothing). Suggested fix: shared `<EmptyState icon label hint cta />` component.

### 3.8 Horizontal overflow risks

- `[med] responsive` Decorative halos at `size-[480px]` placed absolute inside `<main>` — workspace adds `overflow-x-clip` to contain, but the home page only adds `overflow-x-hidden`. Verify at 320px viewport. Suggested fix: also add `overflow-x-clip` on `<main>` of home for safety.
- `[low] responsive` `MetaChip` truncates to `max-w-[180px]` on mobile, clipping common Indian name + city combinations. Suggested fix: allow wrap or bump max-width.

### 3.9 Content / terminology

- `[med] content` "Subscription" (sidebar Menu / bottom-sheet) vs "Membership" (workspace label + module filename). Suggested fix: pick one user-facing term.
- `[med] content` Badge text appears as "YVITY Verified" (hero pill) **and** "Verified by YVITY" (services) in the same page. Suggested fix: standardise on the documented form "Verified by YVITY".
- `[low] content` Internal-team strings ("Phase 1", "Phase-1 estimates", "Welcome back" eyebrow) leak through. Suggested fix: audit eyebrow strings.

### 3.10 Architecture / cleanup

- `[low] cleanup` Three orphan home components (`ReachOutToAdvisorSection`, `PublicProfileFooter`, `IntroVideoStrip`) — none imported by `ProfileHomeHero`. Suggested fix: delete or re-wire.
- `[low] cleanup` Two parallel star-rating snippets (hero + CTA card) hardcode the dimmed 5th star. Suggested fix: extract `<StarRating value={advisor.rating} />`.
- `[low] cleanup` Three places implement the Web-Share-API try / clipboard fallback (`ProfileHeaderBanner.handleShare`, `AdvisorDashboardOverview.handleShareProfile`, `PublicProfilePreviewModule.copyLink`). Suggested fix: `useShareProfileLink()` hook.

---

## Appendix — Top 10 quick wins

Mechanical edits that take minimal time and unblock several pages each. Sorted by severity then by implementation effort.

| #  | File                                                                                                                                       | Fix                                                                                                                       | Why                                              |
| -- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1  | [src/components/advisor/dashboard/advisor-dashboard-overview.tsx](src/components/advisor/dashboard/advisor-dashboard-overview.tsx)         | `size-4.5` → `size-[1.125rem]` (or `size-5`)                                                                              | Quick Action icons currently fall back to intrinsic size |
| 2  | [src/components/home/profile-home-hero.tsx](src/components/home/profile-home-hero.tsx)                                                     | Replace `shadow-[oklch(...)]` with `shadow-[0_10px_30px_-12px_oklch(0.85_0.16_78/0.35)]`                                  | Hero CTA depth currently absent                  |
| 3  | [src/components/home/profile-home-hero.tsx](src/components/home/profile-home-hero.tsx)                                                     | Call-Now button: `text-primary` → `text-background` (or dark slate) so label reads on the gold gradient                   | A11y contrast in every theme                     |
| 4  | [src/components/testimonials/recommend-advisor-modal.tsx](src/components/testimonials/recommend-advisor-modal.tsx)                         | Remove `Demo OTP: 123456` hint from production builds                                                                     | Professionalism + security optics                |
| 5  | [src/components/advisor/settings/advisor-settings-module.tsx](src/components/advisor/settings/advisor-settings-module.tsx)                 | Fix copy on "Recommendation requests" row (currently describes testimonials)                                              | Settings clarity                                 |
| 6  | [src/components/advisor/insights/advisor-insights-module.tsx](src/components/advisor/insights/advisor-insights-module.tsx)                 | Replace "Phase 1" eyebrow and footer disclaimer with user-facing copy                                                     | Stops leaking internal milestone naming          |
| 7  | [src/components/advisor-dashboard.tsx](src/components/advisor-dashboard.tsx) + [advisor-dashboard-overview.tsx](src/components/advisor/dashboard/advisor-dashboard-overview.tsx) | Demote dashboard `<h1>` to `<h2>`; convert inner `<header>` to `<section>`                                                | One H1 per page; one banner landmark             |
| 8  | [src/components/advisor/leads/lead-list-card.tsx](src/components/advisor/leads/lead-list-card.tsx)                                         | Mark chevron `aria-hidden`; bump Call / WhatsApp to `size-11`                                                             | Dedupes a11y; meets 44px touch target            |
| 9  | [src/components/home/community-trust-section.tsx](src/components/home/community-trust-section.tsx) + dashboard Lead Summary                | Replace hand-rolled stat tiles with the shared `StatCard`                                                                 | Visual consistency, free hover / a11y / skeleton |
| 10 | Project-wide grep                                                                                                                          | Bulk-replace `text-white/N` → `text-foreground/N` and `border-white/N` → `border-foreground/N` where the intent is "subtle on surface" | Warm Ivory / Clean White finally invert correctly |

---

## What this audit deliberately does not cover

- No automated a11y scan (axe, Lighthouse) — visual / behavioural inspection only.
- No deep deep-dive into individual visitor sub-flows (Give Testimonial, Contact Form OTP) beyond what is shared with Recommend Advisor.
- No new screenshots — every finding cites the source file so you can open the surface directly.
- No code changes in this pass — once you mark which items to fix, I'll switch to agent mode and implement them.

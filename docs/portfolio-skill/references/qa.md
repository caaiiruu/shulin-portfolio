# QA Rules
Breakpoints: 1419 / 871 / 430.
Shared-owner changes regress Voucher / DBS / Booking.
Check navigator, keyboard, touch, clipping/overflow, equal-height rows, mobile natural height, evidence readability, confidentiality, and duplicate legacy sections.
Human PASS requires user review.

## Project Floating Navigator geometry

### Active item visibility

At mobile viewport 430, the active/focused Project navigator item must be fully contained in the visible rail, never appear as a clipped fragment, and be centred where available scroll space permits. Testing `aria-current` or an active class alone is not sufficient.

### First item

Set `scrollLeft = 0` with canonical left safe-area containment.

### Last item

Set `scrollLeft = maxScroll` with canonical right safe-area containment.

### Intermediate item

Use `target = itemCenter - rail.clientWidth / 2`, then `scrollLeft = clamp(target, 0, maxScroll)`. Account for safe-area / rail padding exactly once.

### Active-state convergence

All active-state changes invoke one shared reposition path: scroll-driven section synchronization, click, mobile tap, keyboard Enter, keyboard Space, focus, back navigation, forward navigation, initial floating-nav appearance, and resize / viewport change. Do not maintain separate centring behaviour for click and scroll synchronization.

### Forbidden navigator fixes

Do not use project-specific offsets, fixed `scrollLeft` values, negative margin, `translateX`, accumulated scrolling, timer-based positioning, extra blank trailing items, or oversized padding used only to hide clipping. Use deterministic absolute positioning plus clamp.

### Required navigator QA data

For every item at 430, record label, item left X, item right X, rail visible left X, rail visible right X, `scrollLeft`, `maxScroll`, centre delta, and clipping state.

## Typography and casing Human gate

At 1419, 871, and 430 verify page-title hierarchy, section-title hierarchy, card/group-title hierarchy, semantic-label hierarchy, body/supporting hierarchy, natural content-title casing, uppercase semantic-label grammar, natural navigator-label casing, no mobile section title consuming excessive viewport height, and no group title visually competing with its section title. The same semantic role must consume the shared owner / token.

## Shared visual convergence

- Maintain one canonical Structured Evidence visual family; do not add a duplicate family.
- Do not create a full rounded qualitative Outcome card family.
- Core System Insight cloud backgrounds may be full-bleed, but text uses the canonical readable inner gutter.
- Reading edge and evidence edge remain semantically distinct.
- Human screenshot evidence overrides automated PASS when they conflict.

## R163.3 shared Project Detail parity

At 1419 / 871 / 430, certify Voucher, DBS, Booking, and CTBC through the same shared owners.

- Core System Insight: content column centered; eyebrow, headline, and body all compute to centered alignment; readable width retained; mobile inner gutter retained.
- My Accountability: exactly two primary semantic groups in the order I OWNED THE OUTCOME then SHARED DECISIONS; tablet remains two columns while readable; mobile stacks in that order; an optional partner-owned boundary sits below and never becomes a third primary column.
- Record geometry, computed alignment, grid columns, source-role mapping, boundary position, overflow, and mobile order. Automated state or owner checks alone are insufficient.

## Engineering control-plane certification

Canonical Engineering QA must protect all of the following:
- canonical QA remains in the workflow push target
- canonical QA remains in the workflow pull-request target
- PR validation checks out and records the exact PR head SHA
- runtime generation, SSOT/design validation, tests, routes, build, artifact validation, Chromium runtime, static serving, and browser certification remain blocking core checks
- artifact upload is evidence retention only and may remain non-blocking; quota failure must be reported separately and must never convert a genuine engineering failure into PASS

## Active-asset ProjectCard / visual certification

For `real-active` ProjectCards and public visual assets, semantic expectations must derive from the active canonical asset/runtime metadata: actual asset status, intrinsic/declared semantic ratio, media classification, and responsive presentation rules.

Do not hard-code historical placeholder/fallback semantics against a currently real-active asset.

Placeholder-specific assertions may run only when the runtime actually classifies that asset as placeholder/fallback.

This rule does not weaken ProjectCard QA: active assets must still satisfy their exact desktop/tablet/mobile geometry, object-fit, overflow, and responsive contracts.

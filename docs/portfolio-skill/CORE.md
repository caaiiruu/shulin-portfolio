# CORE — Mandatory Work Rules

Read this file + `registry.json` before every Work Order.

1. Truth: latest user → Human screenshot → real GitHub QA → deployment → SSOT → approved architecture → old chat.
2. SSOT: `public/site/content/portfolio-content.json`
3. Public IA:
   Hero → At a Glance + Info Grid → What Made This Hard → Contribution → Core System Insight → Design Decisions → Evidence → Outcomes → My Accountability → Related Work
4. Public Problem Types are retired; problem terms are search-only metadata.
5. Fit new projects into DBS/Booking shared architecture before adding capacity.
6. Evidence ≠ Outcomes. Research counts belong in Evidence.
7. Accountability: I LED / I CO-DECIDED / PARTNER-OWNED.
8. No heavy whole-image blur; use semantic redaction.
9. Preferred execution: capability preflight → verify actual canonical QA HEAD → isolated project branch → PR directly to canonical QA → automatic Engineering QA → Vercel Preview → exact-head QA → Human review → merge.
10. Never assume repo attachment, local Git auth, `gh`, or workflow dispatch. Do not repeat scratch `.git` recovery or unauthenticated clone loops; use an already-supported canonical alternative after capability detection.
11. QA: 1419 / 871 / 430. Shared changes regress Voucher / DBS / Booking.
12. Engineering PASS != Human PASS.
13. Verify real GitHub HEAD before trusting stale Work-session state.
14. Semantic consistency: one role uses one shared treatment; content headings keep natural authored casing, uppercase is reserved for semantic micro-labels, and active/focused Project Floating Navigator items remain fully visible and centre where scroll space permits.
15. Core System Insight uses a centered-content composition: centered eyebrow, headline, and body within a centered readable column.
16. My Accountability uses two equal primary columns—owned outcome and shared decisions—with any partner-owned boundary subordinate below.
17. Project titles must NOT use the repeated `From X to Y` construction. Express transformation through a concise, recruiter-readable title that identifies the product/problem space and distinctive system or capability signal without a fixed naming formula. Avoid generic `Improving…`, `Redesigning…`, or `Designing…` labels when they merely describe design activity rather than the product problem or system change.
18. Canonical governance changes must never live only in chat. When a Human-approved rule changes, sync it before the next migration into: `CORE.md` + the relevant `references/*` file + `SKILL.md` + `registry.json` version/state + `CHANGELOG.md`. The latest explicit Human rule supersedes older wording everywhere; contradictory legacy guidance must be removed or marked superseded.

## 19. Public timeline presentation

- Public Project Detail timelines use the short-form actual project period.
- Prefer `Dec 2020–Nov 2021`, `2022–2025`, or the closest source-supported period.
- Do not publish duration-only values when an actual period is known.
- Never infer missing dates from duration.

## 20. Canonical CI control plane

Canonical QA is `qa/r146-r43-preview-2026-08-06`.

The canonical Engineering QA workflow must preserve:
- QA in `push.branches`
- QA in `pull_request.branches`
- exact PR-head checkout / recorded validated SHA
- blocking runtime generation, validation, tests, build, Chromium, static-server, and browser certification
- artifact upload as non-blocking evidence retention only

Do not weaken a blocking engineering check to solve artifact quota or CI convenience.

## 21. Content / Asset ownership

- No public content implementation without `public/site/content/portfolio-content.json` ownership.
- No public asset implementation without `public/site/content/portfolio-asset-manifest.json` ownership.
- Chat, handoff, screenshot, and package material is input, not production SSOT.
- Content `contentVersion` must exist; Asset Manifest `contentVersion` must match it.
- Runtime/validation must never pin one historical Content revision.
- Same-commit Content / Asset atomicity is prospective from the canonical Git activation boundary in `registry.json`; legacy pre-boundary commits remain historical evidence, while every governed commit after activation is blocking.
- A new branch cannot bypass atomicity by starting from pre-activation history.
- Engineering-only governance changes do not require a fake contentVersion bump.

## 22. Active-asset QA

Real-active ProjectCard / visual assertions derive semantic expectations from current canonical runtime/asset metadata. Placeholder-specific assertions may run only for actual placeholder/fallback assets. Do not weaken responsive geometry or visual certification.

## 23. Work execution capability preflight

Before mutation, record connector read/write, branch/PR write, workflow dispatch/rerun/log access, local repo, local Git auth, `gh`, and binary/blob write availability. Choose the execution path only after this preflight.

## 24. Normal project pipeline

Normal work branches from the actual canonical QA HEAD and opens an isolated PR directly back to canonical QA. Stacked repair PRs are exception handling only, not the normal project path.

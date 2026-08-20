---
name: portfolio-operating-system
version: 2026-08-20-v2.7
status: canonical
description: Complete operating skill for Shulin Chou's recruiter-first portfolio content architecture, shared Project Detail system, evidence governance, GitHub-native execution, QA, and Chat↔Work collaboration.
---

# Portfolio Operating System

## 0. Purpose

Use this skill for all portfolio content, Project Detail migrations, evidence preparation, shared-system changes, GitHub execution, QA, and Chat↔Work handoff.

Primary objective:
Build a recruiter-first portfolio that is:
- fast to understand
- factually grounded
- system-oriented
- clear about ownership
- reusable
- deterministic
- regression-safe
- easy for AI agents to execute without re-reading long chat history

Do not optimize for storytelling length. Optimize for recruiter relevance, decision speed, credibility, and system-level evidence.

---

# 1. Truth hierarchy

When information conflicts, use this order:

1. User's latest explicit instruction
2. Latest Human screenshot / actual interaction evidence
3. Real GitHub QA branch / commit state
4. Actual QA deployment
5. Canonical SSOT
6. Latest Human-approved shared architecture
7. Latest checkpoint / handoff
8. Older conversation claims
9. Model memory / inference

Never let stale Work-session memory override GitHub reality.

Canonical SSOT:
`public/site/content/portfolio-content.json`

Canonical Asset Manifest:
`public/site/content/portfolio-asset-manifest.json`

Architecture A:
canonical source
→ deterministic generation
→ generated runtime
→ QA deployment

Production:
DO NOT MODIFY unless explicitly authorized.

---

# 2. Current public Project Detail architecture

Use this canonical public order:

1. Hero
2. At a Glance + Info Grid
3. What Made This Hard
4. Contribution
5. Core System Insight
6. Design Decisions
7. Evidence that shaped the decisions
8. Outcomes
9. My Accountability
10. Related Work

## Superseded standalone public sections

Do NOT restore unless explicitly reopened:
- Problem Types
- Why It Mattered
- Business Impact
- Research Strategy
- Delivery and Measurement
- Status and Disclosure

Why It Mattered is absorbed into What Made This Hard.
Business Impact is absorbed into Outcomes.
Problem terms are search metadata only.

---

# 3. Search metadata vs public content

Problem terms exist for search relevance, not public presentation.

Use `searchIndexV2.problemTags` or the current canonical equivalent.

Examples:
- mortgage application
- application information architecture
- resumable application
- multi-party workflow
- booking conversion
- fragmented trip context
- regulated self-service

Do NOT surface these as public Hero chips.

---

# 4. Hero and At a Glance

## Hero title

Hard rule:
Do NOT use the repeated `From X to Y` construction.

Do not force one naming grammar across all projects.

Use a concise, recruiter-readable title that quickly communicates:
- project identity
- domain / problem space
- distinctive system, capability, or product change

Prefer product/system meaning over design-activity phrasing.
Avoid formulaic or generic naming such as:
- `From X to Y`
- `Improving the ... experience`
- `Redesigning ...`
- `Designing ...` when it merely describes the designer's activity

Transformation may still be communicated semantically, but not through a repeated fixed syntax.

Cross-project title gate:
- flagship titles should not all share the same grammar
- each title should expose a distinct hiring signal
- avoid poetic ambiguity and internal jargon
- do not imply unsupported scope such as `omni`, `platform`, `global`, or `end-to-end`
- use natural authored casing

## At a Glance
Most important recruiter summary.

Where supported, include:
- ownership / role
- consequential action
- system scale
- outcome or system change

Avoid method-only phrasing:
- conducted UX research
- iterative design
- created wireframes

Prefer product judgment and ownership.

---

# 5. Info Grid

Fields:
- TYPE
- SCOPE
- AUDIENCE
- TIMELINE

Allowed TYPE values only:
- Internal System
- Incentive System
- Transaction System
- Marketplace Platform
- 0→1 Product

AUDIENCE = product/service users.
Do NOT use Product / Engineering / PM / Operations as audience unless they are actual direct users of the product.

TIMELINE = project duration.
A measurement window must never replace project duration.

---

# 6. What Made This Hard

Purpose:
Explain business urgency + why the problem required non-trivial product judgment.

Structure:
- optional business-context intro
- usually 3 distinct complexities

Complexities should differ by dimension:
- system/product structure
- user decision difficulty
- regulatory/operational/market/technical constraint

Do not describe the solution here.

Layout:
- equal-height cards at multi-column widths
- dynamic based on tallest content
- mobile returns to natural height
- no brittle fixed heights

---

# 7. Contribution

Purpose:
Show personal leverage and ownership, not repeat At a Glance or Outcomes.

Preferred shared grammar:
- Headline
- BEFORE
- KEY INTERVENTION
- AFTER
- WHERE I CHANGED THE SYSTEM
- Supporting statement

Do not render duplicate Contribution sections.

Fit content to the existing shared Contribution grammar before requesting new shared capacity.

---

# 8. Core System Insight

Purpose:
Show the scalable system insight that changed the design direction.

Core System Insight is insight-first, not artifact-first or metric-first.

Required cognitive structure:
1. `INSIGHT` — the reusable system truth discovered
2. `WHAT THIS CHANGED` — how that truth redirected the product or operating model
3. `VISUAL PROOF` — evidence that makes the change inspectable

Visual proof may be a simplified Journey Map, system model, state model, architecture, before/after transformation, or transaction model. Do not mandate Journey Maps across projects.

Good examples:
- application state instead of screen
- customer trip instead of organizational vertical
- shared decision model instead of departmental flow
- reusable rule/state instead of campaign-specific UI

Avoid repeating What Made This Hard or Decisions.

Use shared readable width; do not let desktop text collapse into excessively narrow columns.

---

# 9. Design Decision contract

Flagship projects usually need ~3 consequential decisions.

Each Decision may contain:
1. Title
2. WHAT I DECIDED
3. WHY THIS CHOICE
4. Optional third block
5. OUTCOME
6. Evidence visual, if safe and relevant
7. Delivery boundary, if the distinction between shipped / validated / out-of-scope is materially important

## Optional third block
Use only one when independently meaningful:
- TRADE-OFF ACCEPTED
- WHAT THIS REQUIRED
- CONSTRAINT MANAGED
- RISK MANAGED

## Trade-off
Valid only when:
We gave up / reduced A to gain / protect B.

Do not mislabel:
- requirement
- dependency
- constraint
- explored alternative
- stakeholder preference

## Delivery boundary
Use when an important part of the story must explicitly distinguish:
- shipped vs proposed
- validated vs not validated
- in-scope vs out-of-scope

A generic shared renderer may optionally support Delivery Boundary for featured decisions.

Do NOT add project-specific Delivery Boundary UI.

---

# 10. Evidence that shaped the decisions

Evidence answers:
Why was this decision credible?

Evidence is NOT Outcome.

Possible evidence:
- interviews / usability tests
- workshops
- behavioral analytics
- transaction history
- customer service evidence
- information inventory
- state dependencies
- traffic source analysis
- regulatory / policy constraints
- workflow maps
- analysis reports

Research/delivery counts belong here, not Outcomes.

Do not invent counts or metrics.

## Structured non-image evidence
The shared Evidence system should support text-based structured evidence groups when important project evidence is not numeric and not an image.

Generic evidence group contract:
- heading
- concise summary / bullets
- optional supporting label
- no placeholder image requirement

Examples:
- Application Inventory
- Journey-State Evidence
- Entry-Context Analysis
- Lending / Guidance Boundaries

Do not force non-image evidence into fake metric cards or placeholder images.

## Recruiter-facing decision-support evidence
When Evidence exists primarily to explain why a Decision was necessary, prefer the compressed shared pattern:
- recruiter-readable headline
- one concise supporting sentence
- weak semantic decision link such as `LED TO DECISION 01`

Do not expose research-documentation layers such as separate OBSERVED / DESIGN IMPLICATION / SUPPORTS DECISION fields unless the project genuinely requires that depth and Human review approves it.

---

# 11. Outcomes

Purpose:
What changed, and what proves it?

Business Impact is integrated here.

## Quantitative projects
Use Voucher-style numeric hierarchy:
- summary
- prominent metrics
- labels
- supporting statement
- optional system-level closing statement

Use approximate public values where appropriate.

Do not use research counts as Outcomes.

## Qualitative / system-change projects
Use qualitative system Outcome cards when verified post-launch KPI does not exist.

The shared qualitative Outcome renderer should optionally support:
- section-level headline / system-change statement
- qualitative outcome cards
- closing scope / measurement-boundary statement

This is a generic capability, not CTBC-specific.

Do not force a qualitative project into numeric grammar.

Never fabricate:
- conversion
- adoption
- launch
- revenue
- efficiency
- completion rate

---

# 12. Accountability

Use shared:
- I LED
- I CO-DECIDED
- PARTNER-OWNED

when canonical data exists.

Partner-owned is important because it shows attribution discipline.

Do not inflate partner work into individual ownership.

Presentation uses the shared two-primary-column model:
- I LED → I OWNED THE OUTCOME
- I CO-DECIDED → SHARED DECISIONS
- PARTNER-OWNED → optional subordinate boundary

---

# 13. Evidence image governance

Public-safe does not mean visually destroyed.

Do NOT heavy-blur whole images.

Use semantic redaction:
- opaque mask PII
- localized blur for sensitive text only
- approximate metrics when appropriate
- redraw dense/raw tables
- face-only anonymization when necessary

Preserve:
- UI hierarchy
- component outline
- screen type
- workflow structure
- chart shape
- before/after difference
- interaction model

Target:
Preserve ~70–80% structural readability while hiding 100% confidential content.

Recruiter should understand the image type within ~3 seconds, but should not recover sensitive content by zooming.

---

# 14. Image formatting / DBS parity

Use DBS EvidenceFrame / StructuredEvidence geometry and ownership.

Typical public evidence canvas may be 1600×900 where appropriate.

Requirements:
- no key-content crop
- preserve ratio
- light neutral surface when appropriate
- no project-specific image renderer

Image polish may be deferred after content architecture migration if clarity is sufficient.

---

# 15. Shared-system governance

New project first maps into DBS / Booking approved shared architecture.

Correct order:
1. Audit real shared owner
2. Map new project into existing slot
3. Fit copy to existing grammar
4. Reuse existing Evidence / Outcomes / Accountability primitives
5. Identify only essential meaning that cannot be represented
6. Report a generic capacity gap
7. Human approval required before shared owner changes

Do NOT let one project redesign the shared architecture.

Never create:
- project-specific renderer
- project conditional
- duplicate component
- duplicate CSS owner
- globals.css patch
- page-level shared component implementation

---

# 16. Approved generic shared capacity extensions

Current generic shared capacity includes or may be extended with Human approval for:

1. Optional What Made This Hard intro
2. Optional Partner-owned Accountability
3. Semantic quantitative Outcomes hierarchy
4. Optional Delivery Boundary in featured Design Decisions
5. Qualitative Outcomes with:
   - section headline
   - qualitative cards
   - closing scope/measurement statement
6. Structured non-image Evidence groups
7. Recruiter-facing decision-support Evidence

These are generic system capabilities.

Do not implement them as project-only branches.

When added:
- preserve existing output when fields are absent
- regression-test Voucher / DBS / Booking
- keep component ownership centralized

---

# 17. Chat ↔ Work responsibilities

## Chat
Owns:
- content architecture
- copy
- recruiter-first hierarchy
- evidence selection
- image meaning
- confidentiality intent
- outcome / attribution boundaries
- Human approval

## Work
Owns:
- implementation
- component reuse
- responsive layout
- asset optimization
- GitHub
- CI
- deployment
- QA

Work must NOT:
- rewrite approved copy
- invent data
- drop content silently
- change evidence meaning
- move assets without reporting conflict
- redesign shared architecture for convenience

If content cannot fit:
Report `Content Integration Conflict` or `Shared Capacity Issue`.

---

# 18. Execution capability preflight and canonical path

Before choosing any implementation strategy, Work must record:

```text
Repository read via GitHub connector: YES / NO
GitHub connector writes: YES / NO
Branch create/update: YES / NO
PR create/update: YES / NO
Workflow dispatch: YES / NO
Workflow rerun: YES / NO
Workflow logs: YES / NO
Local repo available: YES / NO
Local Git auth available: YES / NO
gh CLI available: YES / NO
Binary/blob write available: YES / NO
```

Never assume repo attachment, local Git auth, `gh`, or workflow dispatch. Never repeat unauthenticated clone or empty-scratch `.git` recovery loops.

After capability detection, use an already-supported canonical path. GitHub-native execution remains preferred when the required connector capabilities are present; a local repo is not required when the connector-native path works.

Canonical normal project pipeline:

```text
verify actual QA HEAD
→ create isolated project branch from QA
→ update Content SSOT / Asset Manifest when applicable
→ generate runtime
→ open PR directly to canonical QA
→ automatic Engineering QA
→ Vercel Preview
→ exact PR-head QA
→ responsive review at canonical breakpoints
→ Human approval
→ merge
```

Canonical QA:
`qa/r146-r43-preview-2026-08-06`

Stacked repair PRs are exception handling only. PR #3 is not the normal project-mutation target.

Known failed paths to avoid:
- scratch empty `.git`
- fake Git init
- unauthenticated clone retry loops
- parallel repo copies
- full large-SSOT replacement through a connector path proven to truncate

For large SSOT, use the smallest deterministic mutation supported by the active tooling. No rollback. No force push.

GitHub Actions clean checkout is the trusted remote engineering environment.

---

# 19. QA and CI control plane

Required breakpoints:
- 1419
- 871
- 430

If shared owner changes:
Regression-test Voucher / DBS / Booking.

Check:
- section order
- navigator
- repeated click
- backward / forward
- keyboard Enter / Space
- touch
- scroll sync
- clipping / overflow
- equal-height rows
- mobile natural height
- Evidence readability
- image loading
- confidentiality
- no legacy duplicate sections

Canonical Engineering QA must preserve:
- canonical QA in workflow `push.branches`
- canonical QA in workflow `pull_request.branches`
- PR-triggered checkout / validated SHA tied to the exact PR head SHA
- blocking runtime generation and two-pass determinism
- blocking SSOT/design validation, canonical tests, route tests, production build, artifact validation, Chromium runtime, static-server startup, and browser certification
- artifact upload as non-blocking evidence retention only when repository policy treats quota as secondary

Artifact-storage quota failure does not invalidate Engineering QA when every core engineering check passed; it must still be reported separately.

Engineering PASS != Human PASS.

---

# 20. Work-session state hygiene

Before trusting a Work response that reports:
- old QA HEAD
- old blocker
- old round number

verify actual GitHub branch state.

Do not restart completed work because a stale session reports an older state.

---

# 21. Project migration workflow

For each project:

1. Resolve canonical project ID
2. Audit facts / ownership / outcome boundaries
3. Remove stale public Problem Types
4. Rewrite into current IA
5. Keep problem terms search-only
6. Select consequential Decisions
7. Map Evidence
8. Choose quantitative or qualitative Outcome grammar
9. Define Accountability
10. Map to shared components
11. Report true generic gaps only
12. Verify actual canonical QA HEAD and capability preflight
13. Create an isolated project branch from canonical QA
14. Update Content SSOT and Asset Manifest in the same implementation round when applicable
15. Generate runtime and open PR directly to canonical QA
16. Automatic Engineering QA
17. Vercel Preview + exact PR-head responsive/runtime QA
18. Human review
19. Merge only after approval
20. Freeze content/architecture; defer optional image polish only when non-blocking

---

# 22. Recruiter-first quality gate

Flagship projects should visibly prove relevant combinations of:
- product judgment
- systems thinking
- ambiguity handling
- information architecture
- state modeling
- cross-functional decision making
- cross-market judgment
- regulated/risk judgment
- evidence-led decisions
- measurable business value or credible system change
- attribution discipline

Do not add generic self-praise.
Show these through decisions, evidence, outcomes, and boundaries.

---

# 23. Canonical governance maintenance

Human-approved rules must never remain only in chat or a one-off Work Order.

When a canonical rule changes, update before the next project migration:
1. `CORE.md` — compact mandatory rule
2. the relevant `references/*` file — detailed semantics and examples
3. `SKILL.md` — complete operating rule
4. `registry.json` — version/state/machine-readable flags where applicable
5. `CHANGELOG.md` — what changed and what was superseded

Maintenance rules:
- latest explicit Human instruction supersedes older canonical wording
- remove or explicitly mark contradictory legacy guidance as superseded
- bump Skill version for semantic governance changes
- do not bump merely for project copy changes
- Work must read `CORE.md` + `registry.json` before every Work Order and consult the relevant reference before mutation
- after governance sync, verify all five canonical surfaces agree
- do not allow one project-specific preference to become global governance unless Human explicitly approves it as a shared rule

---

# 24. Content / Asset SSOT and active-asset governance

Hard rules:
- No public content implementation without canonical Content SSOT ownership: `public/site/content/portfolio-content.json`.
- No public asset implementation without canonical Asset Manifest ownership: `public/site/content/portfolio-asset-manifest.json`.
- Chat, handoff, screenshot, and package material is not production SSOT until written into the canonical repository owner.
- Content `contentVersion` must exist and be non-empty.
- Asset Manifest `contentVersion` must equal Content `contentVersion`.
- Runtime generation and governance validation must never require one historical fixed Content revision. Validate schema, required roster/package contract, Content/Manifest identity, asset resolution, and deterministic generation instead.
- If a Content change introduces a new content revision, the Asset Manifest must be updated atomically and resolve to the same revision.
- Public project asset implementation must update the Asset Manifest in the same atomic implementation change.
- Engineering-only governance changes do not require a fake Content version bump.
- Deterministic generation must return the public runtime to the canonical owners; direct generated-runtime edits are not a substitute for Content SSOT ownership.

## SSOT atomicity activation boundary

Same-commit Content / Asset Manifest atomicity is prospective from the canonical Git activation boundary stored in `registry.json` as `ssotGovernance.ssotAtomicityEnforcedFrom`.

Rules:
- the boundary is a full Git commit SHA and must be interpreted through Git ancestry only
- legacy commits genuinely before that boundary remain historical evidence and are not retroactively reclassified as present-day SSOT-05/06 violations
- every governed commit at or after the boundary remains blocking under SSOT-05/06
- normal QA-targeted PRs validate their merge-base-to-head introduced commit range
- QA post-merge validation must not replay unrelated pre-governance history merely because another comparison branch is old
- a branch created from pre-activation history cannot bypass atomicity: when it targets governed canonical history, its newly introduced commits are still enforced
- no SHA ignore list, date threshold, commit-message matching, output truncation, `continue-on-error`, or blanket historical exemption may replace ancestry-aware selection

Active-asset QA:
- `real-active` ProjectCards/public visuals derive semantic expectations from current canonical asset/runtime metadata
- placeholder/fallback assertions may only run when runtime state is actually placeholder/fallback
- do not broadly weaken responsive geometry, object-fit, overflow, or visual certification

For later Payment implementation, approved content and approved assets must be written into Content SSOT and Asset Manifest in the same implementation round whenever both change.

---

# 25. Superseded rules

The following are retired unless explicitly reopened:
- public Problem Type chips
- any `From X to Y` project-title construction as a portfolio naming pattern
- standalone Why It Mattered
- standalone Business Impact
- standalone Research Strategy
- research counts as Outcomes
- forcing all projects into numeric Outcomes
- whole-image heavy blur
- mandatory local repo-attached Work gate
- repeated scratch recovery
- allowing new projects to expand shared architecture before parity mapping
- centered-column-left-copy
- three-equal-column accountability
- PR #3 as the normal project implementation target
- stacked repair PRs as the normal project workflow
- historical fixed Content revision validation
- retroactive SSOT atomicity over pre-governance repository history

## Public timeline presentation

Project Detail Info Grids must show the short-form actual project period when canonical dates exist. Duration-only values are superseded for public presentation. Never infer missing dates.

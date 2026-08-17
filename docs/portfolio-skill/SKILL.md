---
name: portfolio-operating-system
version: 2026-08-17-v2
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
Do not force one naming grammar across all projects.
`From X to Y` is optional, not mandatory.

Use a title that quickly communicates:
- project identity
- domain / problem space
- system or transformation

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

These are generic system capabilities.

Do not implement them as CTBC-only branches.

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

# 18. GitHub-native execution

Known recurring problem:
Work scratch environments may have empty `.git` and no package.json.

Do NOT repeatedly restart local repo-recovery loops when GitHub-native execution is available.

Preferred path:
GitHub connector-native data
→ QA branch
→ blob/tree/commit
→ PR #3
→ GitHub Actions clean checkout
→ validation/build/browser QA
→ Vercel QA
→ Human review

Known failed paths to avoid:
- scratch empty `.git`
- fake Git init
- unauthenticated clone retry loops
- parallel repo copies
- full ~1.4MB SSOT replacement through connector path proven to truncate

For large SSOT:
- fetch current blob/tree
- apply targeted deterministic mutation
- create/verify Git blob
- create tree/commit
- fast-forward QA branch
- no rollback
- no force push

GitHub Actions is the trusted clean checkout.

---

# 19. QA

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

Engineering PASS != Human PASS.

Artifact-upload quota failure does not invalidate engineering QA if all engineering steps passed; report separately.

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

For each remaining project:

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
12. Implement via GitHub-native path
13. QA
14. Human review
15. Freeze content/architecture
16. Defer optional image polish if non-blocking

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

# 23. Superseded rules

The following are retired unless explicitly reopened:
- public Problem Type chips
- mandatory `From X to Y`
- standalone Why It Mattered
- standalone Business Impact
- standalone Research Strategy
- research counts as Outcomes
- forcing all projects into numeric Outcomes
- whole-image heavy blur
- mandatory local repo-attached Work gate
- repeated scratch recovery
- allowing new projects to expand shared architecture before parity mapping

# Content Rules
- At a Glance = ownership + action + scale + outcome/system change.
- Audience = product/service users, not implementation stakeholders.
- What Made This Hard absorbs business context.
- Contribution = personal leverage.
- Core System Insight = scalable underlying model.
- Usually 3 consequential Decisions.
- Every Decision: WHAT I DECIDED / WHY / optional third block / OUTCOME.
- Delivery Boundary may be used when shipped/validated/scope distinction matters.
- Never invent metrics or ownership.

## Project title writing

Project titles must be recruiter-readable and specific to the project's distinctive product/system problem.

Hard rule:
- Do NOT use the repeated `From X to Y` construction.

A title should quickly communicate:
- project or product identity
- domain / problem space
- distinctive system, capability, or product change

Prefer product/system meaning over design-activity phrasing.

Avoid formulaic titles such as:
- `From X to Y`
- `Improving the ... experience`
- `Redesigning ...`
- `Designing ...` when it merely describes the designer's activity

Transformation may still be communicated semantically, but titles must not rely on one repeated syntax across projects.

Cross-project quality gate:
- flagship titles should not all share the same grammar
- each title should expose a distinct hiring signal
- avoid poetic ambiguity and internal jargon
- avoid implying unsupported scope such as `omni`, `platform`, `global`, or `end-to-end` unless source truth supports it
- natural authored casing only

## Typography role hierarchy

Canonical semantic hierarchy:

1. Page title
2. Section title
3. Card / group title
4. Semantic label / eyebrow
5. Body copy
6. Supporting / secondary copy
7. Navigator label

A lower semantic level must not visually compete with a higher one. Do not promote a card/group title to section-title styling merely for emphasis.

### Page title casing

Use natural authored casing. Do not apply uppercase transformation.

### Section title casing

Use natural heading casing, such as At a Glance, What Made This Hard, Core System Insight, Design Decisions, Evidence that shaped the decisions, Outcomes, and My Accountability. Do not use all caps.

### Card / group title casing

Use Title Case or natural sentence case, such as Application Inventory, Journey-State Evidence, Entry-Context Analysis, Lending / Guidance Boundaries, One staged information model, and Resumable application flow. Do not use decorative all caps.

### Semantic micro-label casing

Uppercase is reserved for compact system labels: TYPE, SCOPE, AUDIENCE, TIMELINE, WHAT I DECIDED, WHY THIS CHOICE, WHAT THIS REQUIRED, TRADE-OFF ACCEPTED, CONSTRAINT MANAGED, RISK MANAGED, OUTCOME, DELIVERY BOUNDARY, I LED, I CO-DECIDED, and PARTNER-OWNED. These labels remain visually subordinate to content titles.

### Navigator label casing

Use natural Title Case, such as Overview, Complexity, Decisions, Evidence, and Impact. Do not uppercase navigator labels.

### Authored casing vs CSS transform

Normal content headings should be authored correctly in canonical content. Do not rely on `text-transform: uppercase` for section titles, card/group titles, Evidence group headings, qualitative Outcome headings, or navigator items. CSS uppercase is acceptable only for stable semantic micro-label roles.

### Localization safety

Do not globally uppercase multilingual elements. Chinese and future localized content must preserve authored form. Do not make casing rules dependent on English-only assumptions.

## Core System Insight presentation

Equivalent Core System Insight content uses the shared `centered-content-composition`: centered eyebrow, centered headline, and centered supporting copy inside one centered readable column. A full-bleed cloud/background does not widen the text column. Project-specific alignment rules and the superseded `centered-column-left-copy` treatment are forbidden.

## My Accountability presentation

Use one shared `two-primary-column-accountability` composition. Map I LED to I OWNED THE OUTCOME and I CO-DECIDED to SHARED DECISIONS. Preserve their strongest concise ownership statements as headlines and supporting facts below. If PARTNER-OWNED is materially present, keep it as a subordinate PARTNER-OWNED BOUNDARY below the two primary columns; never render it as a third equal-weight primary column.

## Timeline presentation

Public Project Detail Info Grids display a short-form actual project period, not duration-only copy. Use the closest source-supported period and never calculate or invent dates from duration.

## Canonical Content / Asset ownership

Hard rules:
- No public content implementation without canonical Content SSOT ownership: `public/site/content/portfolio-content.json`.
- No public asset implementation without canonical Asset Manifest ownership: `public/site/content/portfolio-asset-manifest.json`.
- Chat, handoff text, evidence packages, screenshots, and temporary files are inputs only; they are not production SSOT until written into the canonical repository owner.
- Direct edits to generated public runtime are not a substitute for Content SSOT mutation. Deterministic generation must reproduce a clean runtime from canonical owners.
- Public project asset changes must update the Asset Manifest in the same governed commit.
- `portfolio-content.json.contentVersion` must exist and be non-empty.
- `portfolio-asset-manifest.json.contentVersion` must equal the Content SSOT `contentVersion`.
- A legitimate Content revision must never require editing a validator merely to replace one historical fixed revision string.
- If a Content change introduces a new content revision, the Asset Manifest must be updated in the same governed commit and resolve to that same revision.
- Same-commit Content / Asset atomicity is prospective from `registry.json:ssotGovernance.ssotAtomicityEnforcedFrom`, which is a full Git commit SHA and is interpreted only through Git ancestry.
- Commits genuinely before the activation boundary remain historical evidence and are not retroactively reclassified as present violations.
- Every governed commit at or after activation remains blocking under SSOT-05/06.
- A new commit cannot bypass atomicity merely because its branch started from pre-activation history; when the target/base is governed, newly introduced branch commits are still validated.
- Engineering-only governance changes do not require a fake Content version bump.

For later Payment implementation, approved public content and approved public assets must enter their canonical owners in the same implementation round whenever both change.

## Permanent root-cause closure contract

SSOT, generation, governance, presentation, and QA defects are closed only when the reusable failure class is prevented, not when one visible symptom is patched. Work must verify real state, prove root cause, identify the single canonical owner, remove conflicting owners, make all consumers derive from that owner, add prospective machine enforcement, search the repository for recurrence, run dependency-scoped regression, and record exact-state evidence.

For Content/current-version defects specifically:
- current identity is `Content.contentVersion === Manifest.contentVersion`
- generated runtime is deterministic output of current canonical Content plus Manifest
- live consumers must not pin a historical current revision
- Content-only version mutation fails after activation
- Manifest-only version mutation fails after activation
- aligned Content+Manifest mutation passes
- the activation SHA has one live owner: `registry.json:ssotGovernance.ssotAtomicityEnforcedFrom`
- duplicate live activation/current-state owners, branch bypasses, skip flags, and revision exceptions fail governance

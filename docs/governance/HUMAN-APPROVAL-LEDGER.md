# Human Approval Ledger

Status: `RECOVERY_IN_PROGRESS`

Record the latest Human-approved state by area. Do not mark any entry VERIFIED without evidence and an exact recoverable source reference.

## Required fields per entry

- Area ID
- Latest approved state
- Status
- Human evidence
- Source owner
- Exact commit/blob/tree if recoverable
- Preview/deployment evidence
- Supersedes
- Current Production comparison

## Known locked requirements to recover/verify

### Home
- Hero copy
- Hero motion
- CTA
- Header overlay relationship
- Domains anchor behavior
- Company/client presentation

### Search
- closed state
- expanded state
- approved shortcuts
- result hierarchy
- result metadata
- no-result Contact state
- close/Escape behavior
- responsive sizing

### Experiments
- latest approved listing cards
- latest approved card content
- each Experiment detail uses its own approved content
- localization

### Profile
- Career Timeline — current canonical CV is factual SSOT
- latest Critique / View Experiment presentation
- TWO separate Red Dot award cards
- each Red Dot card contains its own Red Dot logo
- Golden Pin presentation
- RSA presentation
- latest Interests / activities presentation
- Spotify CTA contains its approved destination link
- CV integration

### Project details
- all canonical routes
- Hero
- At a Glance
- Info Grid
- Decisions
- Evidence
- Outcomes
- Before / After where applicable
- Section Navigator
- EN / ZH

### Global
- clean public routes
- Header
- Footer
- shared navigation
- shared components
- responsive behavior at 1419 / 871 / 430

## Hard rule

Missing evidence = `NOT VERIFIED`, never PASS.

## Phase 4 explicit Human correction

Company Wall belongs only to Homepage: four Teams I Joined and six Selected Client Engagements. Do not add it to Profile. Profile career facts follow the current canonical CV. Search eight shortcuts and approved order, Contact no-result, fresh /#domains, seven Experiment records/details, Critique, two Red Dot cards/assets, exact Spotify href, clean routes and shared project structures remain locked. Candidate remains NOT HUMAN VERIFIED; no Production approval.

### CV factual provenance (governance only)

{
  "path": "assets/docs/Shulin-Chou-CV.pdf",
  "sha256": "b235a40a423fa0e287c2496c285814f6d7e01f08bb97e51a8995893ea69d29dd",
  "page": 1,
  "authority": "Human Phase 4: canonical CV controls employer, role, employment type and dates",
  "unspecifiedEmploymentType": "omit; do not infer full-time or freelance"
}

Existing Voucher ecosystem, DBS internal operations and Global rollout timeline link labels are preserved. Employment types absent from the CV are omitted rather than inferred.

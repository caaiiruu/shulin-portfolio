# Human Approval Ledger

Status: `DAILY_HOURS_CSV2_PRODUCTION_RELEASED / PHASE_2A_RECORDED`

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

## Daily Hours Phase 0.5–0.6 scoped approvals

These records authorize Phase 1 implementation only. Traditional Chinese remains an explicit Human content gate for localization and release. These records do not approve a Preview, Production promotion, public IA change, or a fourteenth canonical project.

## Daily Hours Phase 2A Production release approval

- Area ID: `DH-WEB-1.0 / CSV2-1.0 / PUBLIC_LOCALE_MODE`
- Latest approved state: `Daily Hours is released as one CSV2 Work identity; public portfolio is temporarily EN-only; ZH content and localization infrastructure are preserved`
- Status: `DAILY_HOURS_CSV2_PRODUCTION_RELEASED`
- Human evidence: `Phase 2A instruction dated 2026-09-15 explicitly authorizes the EN-only gate, Preview validation, and Production promotion after all gates pass`
- Source owner: `release/daily-hours-v2-pilot`
- Release commit/tree: `7b6c4f47b6f1bba1e4d4048649305f22999b2976 / 4d09a13f477d44de829e91cf10adb798f5e1c387`
- Preview evidence: `dpl_A5wbWTxGKfX4XiRqz1pn3Jsw6xCZ / READY / PASSED_1419_871_430`
- Production evidence: `dpl_GQBCPGW6wFQNgsAJaxqDKvfPf7xh / READY / https://shulinchou.com/ / PASSED_1419_871_430`
- Public locale: `EN_ONLY_TEMPORARY`; `ZH_CONTENT=PRESERVED`; `ZH_PUBLIC_SWITCH=DISABLED`
- Public identity: `Work Daily Hours=1`; `Experiment Daily Hours=0`; internal Experiment provenance preserved
- Roster: `13 legacy + 1 CSV2`
- Motion: `DH-MOTION-0.0 VIDEO_PENDING`; `heroFilm=null`; `playCta.enabled=false`
- Supersedes: `DH-WEB-1.0 FUTURE_RELEASE_BLOCKED` and `BLOCKED_BY_ZH_WORK_CARD_COPY`
- Future localization: `May be re-enabled only in a separately scoped release`
- Freeze: `P0/P1 Production bug, explicitly scoped film release, or explicitly scoped localization re-enable only`

### CSV2-1.0 — Case Study Presentation System v2 pilot

- Area ID: `CSV2-1.0`
- Latest approved state: `Approved as the Daily Hours-only presentation-system pilot identity`
- Status: `APPROVED_FOR_PHASE_1_IMPLEMENTATION`
- Human evidence: `Phase 0.5 instruction dated 2026-09-15`
- Source owner: `Human Phase 0.5 handoff; implementation must later enter existing canonical repository owners`
- Exact commit/blob/tree if recoverable: `Baseline commit f0c4ca0a770d7adb1f29d39a2a514c8715e1944e; tree d66980327f1313c4827a50303dccb86330816d01`
- Preview/deployment evidence: `Source Production deployment dpl_2LBWUMectR5hDG8Jkm7xj3eiGRwE; no Preview created`
- Supersedes: `No prior CSV2 approval identity`
- Current Production comparison: `Not present as a production Case Study v2 system; Production remains unchanged`

### DH-CONTENT-1.0 — Daily Hours approved content

- Area ID: `DH-CONTENT-1.0`
- Latest approved state: `English core copy and positioning below are approved; Traditional Chinese remains pending`
- Status: `EN_CORE_COPY_APPROVED`
- ZH status: `ZH_PENDING_HUMAN_APPROVAL`
- Human evidence: `Phase 0.5 instruction dated 2026-09-15`
- Source owner: `Human Phase 0.5 handoff; governance-only until Phase 1 writes approved content to the canonical Content SSOT`
- Exact commit/blob/tree if recoverable: `Not yet present in the Production Content SSOT; Phase 1 baseline tree d66980327f1313c4827a50303dccb86330816d01`
- Preview/deployment evidence: `No Preview created; not Production`
- Supersedes: `Candidate/donor copy is non-authoritative`
- Current Production comparison: `Daily Hours remains only the current Experiment; /work/daily-hours is not approved for publication`
- Hero: `Track work. Decide what’s worth it.`
- First Question: `I could track every hour.` / `But was the project actually healthy?`
- Problem close: `The problem wasn’t missing data. It was missing interpretation.`
- Reframe: `Time is an input.` / `The decision is the product.`
- Next Question: `What should stay flexible—and what should become a system for other freelancers?`
- Positioning: `An independent freelance project-economics and decision workspace.`
- Project type: `0→1 Product`
- Future public route target: `/work/daily-hours`
- Traditional Chinese: `ZH_PENDING_HUMAN_APPROVAL`; English must not be duplicated into zh

### DH-EVIDENCE-1.0 — Daily Hours approved static evidence

- Area ID: `DH-EVIDENCE-1.0`
- Latest approved state: `Seven exact external static files verified and lifecycle model approved as a generated presentation component`
- Status: `APPROVED_FOR_PHASE_1_IMPLEMENTATION`
- Human evidence: `Phase 0.6 instruction dated 2026-09-15 supplies the role-to-source approval mapping`
- Source owner: `Human approval matrix below; external files remain handoff sources until Phase 1 places approved derivatives in the canonical Asset Manifest`
- Exact commit/blob/tree if recoverable: `External handoff files are not blobs in baseline tree d66980327f1313c4827a50303dccb86330816d01; exact SHA-256 identities are recorded below`
- Preview/deployment evidence: `No Preview created; not Production`
- Supersedes: `Phase 0.5 PENDING_HUMAN_ASSET_SELECTION state and all donor/candidate asset assumptions`
- Current Production comparison: `No Daily Hours Work evidence set exists in Production`

| Asset | Exact source | Dimensions | File size | SHA-256 | Status | Human-approved? | Safe for Phase 1? | Production path | Replacement required? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Hero static visual | `/Users/ruby/Documents/ChatGPT/Daily-Hours-Motion-Handoff/motion-reference-captures/H-final-synthesis-decision.png` | `1440 × 1000` | `208136 bytes` | `8ad08d75cfde26cee7e62515e84dcbf21a62babac85f30aa04cae105022907b6` | `HUMAN_APPROVED_FOR_PHASE_1` | Yes | Yes | `UNASSIGNED — Phase 1 Asset Manifest work` | No |
| Project Health primary proof | `/Users/ruby/Documents/ChatGPT/Daily-Hours-Motion-Handoff/final-human-approved-evidence/1440-en-project-detail.png` | `1440 × 1000` | `186550 bytes` | `b4edbc84d1a1eb1d6801bfab501cb0ef9a6ca88405cd96f63edc483307649b19` | `HUMAN_APPROVED_FOR_PHASE_1` | Yes | Yes | `UNASSIGNED — Phase 1 Asset Manifest work` | No |
| Project Health connected-context evidence | `/Users/ruby/Documents/ChatGPT/Daily-Hours-Motion-Handoff/motion-reference-captures/C-effective-rate-margin-rework.png` | `376 × 641` | `40191 bytes` | `5062b880a47350f4a4f6b06ead8d68c14e47b2a70e6cab1e08f32e1de47aa4b3` | `HUMAN_APPROVED_FOR_PHASE_1` | Yes | Yes | `UNASSIGNED — Phase 1 Asset Manifest work` | No |
| Attention primary proof | `/Users/ruby/Documents/ChatGPT/Daily-Hours-Motion-Handoff/motion-reference-captures/D-project-ranking.png` | `1440 × 1000` | `145595 bytes` | `f794ffea5e1b2a20ddd2ebcae4365c61eab75befaa2e2a30868e1b991c0a0e1c` | `HUMAN_APPROVED_FOR_PHASE_1` | Yes | Yes | `UNASSIGNED — Phase 1 Asset Manifest work` | No |
| Attention ranking evidence | `/Users/ruby/Documents/ChatGPT/Daily-Hours-Motion-Handoff/motion-reference-captures/E-type-ranking.png` | `1440 × 1000` | `148086 bytes` | `1de287bab5541e512778fa102d36e0bb765132512c1e4c84d44e7b0b8afd741c` | `HUMAN_APPROVED_FOR_PHASE_1` | Yes | Yes | `UNASSIGNED — Phase 1 Asset Manifest work` | No |
| Attention rework evidence | `/Users/ruby/Documents/ChatGPT/Daily-Hours-Motion-Handoff/motion-reference-captures/F-rework-analysis.png` | `1440 × 1000` | `138827 bytes` | `eb3b13252d56b88c12273522083455b304468c67427194198869d634ad3d935d` | `HUMAN_APPROVED_FOR_PHASE_1` | Yes | Yes | `UNASSIGNED — Phase 1 Asset Manifest work` | No |
| Lifecycle active-state evidence | `/Users/ruby/Documents/ChatGPT/Daily-Hours-Motion-Handoff/motion-reference-captures/A-work-active-project.png` | `1440 × 1000` | `165643 bytes` | `2cf70aa039f29ea1781e52d1f329fbf8c6727c305240720be2f010df33e1fc2d` | `HUMAN_APPROVED_FOR_PHASE_1` | Yes | Yes | `UNASSIGNED — Phase 1 Asset Manifest work` | No |
| Lifecycle model | `PRESENTATION_COMPONENT` | `N/A` | `N/A` | `N/A` | `HUMAN_APPROVED_FOR_PHASE_1` | Yes | Yes | `NONE — generated component` | No |

Lifecycle model contract: `Active → Completed → Billed → Received`; semantic distinction: `Forecast → Final → Receivable → Cash received`; required label: `Completed ≠ Billed ≠ Received`; classification: `PRESENTATION_COMPONENT`; external asset required: `NO`.

### DH-MOTION-0.0 — Video pending

- Area ID: `DH-MOTION-0.0`
- Latest approved state: `Static-first release contract; final video is not a dependency`
- Status: `VIDEO_PENDING`
- Human evidence: `Phase 0.5 instruction dated 2026-09-15`
- Source owner: `Human Phase 0.5 handoff; governance contract only`
- Exact commit/blob/tree if recoverable: `No approved motion asset in baseline tree d66980327f1313c4827a50303dccb86330816d01`
- Preview/deployment evidence: `No Preview created; not Production`
- Supersedes: `Any donor/candidate video or placeholder behavior`
- Current Production comparison: `No Daily Hours Work hero film is live`
- `heroFilm`: `null`
- `playCta.enabled`: `false`
- `reducedMotion`: `use approved static hero visual`
- Forbidden: fake video player, Play product film CTA, autoplay placeholder, or promotion of any candidate video

### DH-WEB-1.0 — Future first production release

- Area ID: `DH-WEB-1.0`
- Latest approved state: `Identity reserved for a future first Production release`
- Status: `FUTURE_RELEASE_BLOCKED`
- Human evidence: `Phase 0.5 instruction explicitly forbids deployment and Production modification`
- Source owner: `Release Manifest`
- Exact commit/blob/tree if recoverable: `No release candidate exists`
- Preview/deployment evidence: `No Preview or Production candidate exists`
- Supersedes: `No prior Daily Hours Work release`
- Current Production comparison: `Daily Hours is not a Production Work case and remains only the current Experiment`

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

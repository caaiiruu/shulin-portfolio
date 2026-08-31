# R183.2 Human visual remediation audit

## Source boundary

This audit uses the current Content SSOT, Asset Manifest, repository history and the Human corrections in R183.2. It does not treat R181 automated acceptance as Human content approval. The canonical Experiment contract remains `compact-linear`: Hero → The Question → The Experiment → Evidence → What This Proved → Related / Next Experiment, with no Floating Navigator.

## Primary IA parity

| Project | IA parity | Overview | Complexity | Decisions | Evidence | Outcomes | Ownership | Related Work | Mutation |
|---|---|---|---|---|---|---|---|---|---|
| Voucher / Offer | PASS | Shared | Shared | Programme | Shared | Shared | Shared | Shared rail | Shared-only |
| Voucher Center | NORMALISED | Shared | Shared | Shared | Text-led | Shared | Shared | Shared rail | Content projection |
| Game Center | NORMALISED | Shared | Shared | Shared | Text-led | Shared | Shared | Shared rail | Content projection |
| DBS | PASS | Shared | Shared | Shared | Shared | Shared | Shared | Shared rail | Shared-only |
| Booking Connected Trip | PASS | Shared | Shared | Shared | Shared | Shared | Shared | Shared rail | Shared-only |
| Bandzo | REVIEW | Legacy Primary | Present | Present | Present | Present | Present | Shared rail | No content change |
| Taishin P2P | PASS | Shared | Shared | Shared | Shared | Shared | Shared | Shared rail | Shared-only |
| Cathay Mortgage Assistant | PASS | Shared | Shared | Shared | Shared | Shared | Shared | Shared rail | Shared-only |
| Payment | PASS | Shared | Shared | Shared | Shared | Shared | Shared | Shared rail | Shared-only |
| Cathay Account Opening | PASS | Shared | Shared | Shared | Shared | Shared | Shared | Shared rail | Shared-only |
| Cathay Review Remediation | PASS | Shared | Shared | Shared | Shared | Shared | Shared | Shared rail | Shared-only |
| CTBC Mortgage Self-Service | PASS | Shared | Shared | Shared | Shared | Shared | Shared | Shared rail | Shared-only |
| Booking Taxi | PASS | Shared | Shared | Shared | Text-led first item | Shared | Shared | Shared rail | Rejected draft removed |

## Outcome role audit

| Project | Current public role | Classification | Correct placement | Mutation |
|---|---|---|---|---|
| Voucher / Offer | Shipped system change + measured programme outcomes | Product/system change + quantitative measured | Outcomes | Visual owner only |
| Voucher Center | Shipped entry/state model + intent validation | Product/system change + qualitative validated | Outcomes | Normalised |
| Game Center | Multi-game launch + 10-week engagement | Product/system change + quantitative measured | Outcomes | Normalised |
| DBS | Operating-model and delivery change | Product/system change | Outcomes | Visual owner only |
| Booking Connected Trip | Market-ready product behaviour + measured performance | Product/system change + quantitative measured | Outcomes; diagnostic follow-up remains Evidence | Visual owner only |
| Bandzo | Product/learning state | Qualitative validated | Outcomes | Review retained |
| Taishin P2P | Governance/product structure | Product/system change | Outcomes | Visual owner only |
| Cathay Mortgage Assistant | Validated consultation behaviour | Qualitative validated | Outcomes | Visual owner only |
| Payment | Shipped product + transaction continuity | Product/system change + qualitative validated | Outcomes | Visual owner only |
| Cathay Account Opening | Delivered workflow/system state | Product/system change | Outcomes | Visual owner only |
| Cathay Review Remediation | Prioritised remediation direction | Product/system change; not measured impact | Outcomes | Visual owner only |
| CTBC | Application product model + validated continuation | Product/system change + qualitative validated | Outcomes | Visual owner only |
| Booking Taxi | Bounded Phase 1 recommendation | Product/system change/recommendation; not shipped | Outcomes | Draft Evidence asset removed |

## Outcome / Evidence remapping

| Project | Content | Before | After | Why |
|---|---|---|---|---|
| Voucher Center | 12/20, 18/20 and 7 vs 4 study signals | Legacy research section | Evidence | Observations changed the architecture decision; they are not business outcomes. |
| Voucher Center | Homepage entry, claimable count, red/green hierarchy, Claim → View | Legacy product scope | Outcomes | These are shipped product changes. |
| Game Center | Single-entry constraint, operator configuration and lifecycle analysis | Legacy problem/delivery sections | Evidence | These are the inputs used to decide. |
| Game Center | ~70% multi-game engagement and ~23% rounded MAU ratio | Legacy completion/business impact | Outcomes | These are bounded measured results, not causal proof for every decision. |
| Booking Taxi | Handwritten traveller synthesis | Image-led Evidence | Canonical text-led Evidence | Human rejected the rough public artefact; existing verified summary preserves the evidence role. |

## Public Experiment / Exploration inventory and source audit

| Project | Current IA | Status | Content | Assets | Human input needed |
|---|---|---|---|---|---|
| Freelance Project Operations Tool | Compact linear | CONTENT + ASSET GAP — HUMAN REQUIRED | EN/ZH pair is not source-complete; shipped/test boundary needs Human confirmation | No approved public Evidence asset | Confirm delivery/testing facts and optionally provide a public-safe product view |
| Weekly Design Session | Compact linear | CONTENT + ASSET GAP — HUMAN REQUIRED | Current Chinese repeats English and the learning/decision chain requires source confirmation | Abstract fallback only | Confirm participant scope, cadence and resulting team decision; provide a source artefact only if public-safe |
| Food Testing Workshop | Compact linear | CONTENT + ASSET GAP — HUMAN REQUIRED | Current Chinese repeats English and no verified downstream decision is recorded | Abstract fallback only | Confirm whether findings changed a product/research decision and whether any session artefact is public-safe |
| AJA Creative Workshop | Compact linear | CONTENT + ASSET GAP — HUMAN REQUIRED | Current Chinese repeats English; brand-impact language is unsupported by the measurement boundary | Abstract fallback only | Confirm the verified learning/decision and whether workshop documentation can be public |
| Capture Ideas | Compact linear | CONTENT + ASSET GAP — HUMAN REQUIRED | Current Chinese repeats English; concept/test boundary and resulting decision are not verified | Abstract fallback only | Confirm concept/prototype/test status and any follow-on decision; provide optional concept evidence |
| Aha Creative Toolbox | Compact linear | CONTENT + ASSET GAP — HUMAN REQUIRED | Current Chinese repeats English; validation and resulting direction are not verified | Abstract fallback only | Confirm who used it, what was tested and what changed; provide optional public-safe prototype evidence |
| Hello Sabau | Compact linear | CONTENT + ASSET GAP — HUMAN REQUIRED | Current Chinese repeats English; launch, participation and recognition claims require an approved concise source projection | Abstract fallback only | Confirm delivery state, public participation evidence and approved recognition wording; provide optional public artefact |

## Immediate Human content requests

- Homepage Hero CTA: provide the exact approved Chinese counterpart to `Find relevant solutions` or identify its canonical source. The current CTA is intentionally not guessed.
- Every Experiment: confirm the exact delivery status (`concept`, `prototype`, `test`, `internal exploration`, `recommendation`, or `shipped`) and the single verified learning or decision that followed.
- AJA Creative Workshop: confirm whether any public claim beyond participant feedback is supported; measured brand improvement is currently excluded.
- Game Center: confirm whether the rounded `~23% Gamification MAU / app MAU` may remain public with the ten-week scope; the unreconciled printed change is excluded.

## Immediate Human asset requests

- Booking Taxi: ASSET OPTIONAL — HUMAN MAY PROVIDE. The rejected handwritten synthesis is no longer rendered; the text-led Evidence remains complete.
- Experiments: provide only existing public-safe artefacts that prove the stated exploration. No synthetic interface or decorative mockup will be created. Every Experiment can remain text-led until its content boundary is confirmed.

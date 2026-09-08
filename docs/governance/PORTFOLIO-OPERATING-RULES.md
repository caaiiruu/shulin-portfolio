# Portfolio Operating Rules

## Purpose

Prevent approved-state regression, stale baseline inheritance, mixed-version releases, and untraceable Production changes.

## 1. Source-of-truth precedence

When sources conflict, use this order:

1. Latest explicit Human instruction
2. Latest Human screenshot / review feedback
3. Verified Human Approval Ledger entry
4. Exact reachable Git commit and tree
5. Verified Preview deployment
6. Current repository source
7. Older checkpoints / older conversations

Never let an older commit or Production snapshot override a newer Human-approved state.

## 2. Baseline hard stop

Implementation may begin only when all are known and verified:

- Approved Baseline ID
- reachable Git commit SHA
- exact Git tree SHA
- Preview deployment ID
- Human Approval Ledger status
- Regression Lock status
- clean working tree

If any item is missing, fragmented, stale, uncertain, or not verified: **STOP**.

## 3. Human approval closure

A Human-approved state is not archived until all are recorded:

Human approval → Approval Ledger → exact source commit → tree SHA → Preview deployment → regression lock update.

A staged worktree or Preview without a reachable commit must not be treated as a canonical baseline.

## 4. Donor branch rule

Feature branches are donors, never automatic whole-site baselines.

Integration order:

Verified Approved Baseline + scoped donor hunks → integration Preview → regression verification → Human review.

Never wholesale-merge a feature branch into the canonical baseline when shared files may contain stale state.

## 5. No approved-state regression

Every approved state is locked until explicitly superseded by Human approval.

After any implementation, all locked states must be reverified.

Any `REGRESSION`, `UNCERTAIN`, or `NOT VERIFIED` result blocks merge and Production promotion.

## 6. Roles

### Chat / Human-content layer
Owns:
- approved requirements
- content intent
- asset intent
- Approval Ledger decisions
- superseded/rejected states

### Work
Owns:
- forensic audit
- browser QA
- baseline verification
- deployment mapping
- release certification

### Codex
Owns:
- scoped implementation
- exact code changes
- build/tests
- hunk-level integration

Codex must not decide which historical version is the latest approved state.
Work must not redesign Human-approved content.

## 7. Production release gate

Production promotion requires all of:

- verified Approved Baseline ID
- exact commit SHA
- exact tree SHA
- verified Preview deployment ID
- full Regression Lock PASS
- Human release approval

After domain promotion, verify `shulinchou.com` resolves to the expected deployment and run Production smoke QA.

## 8. Required QA

At minimum for whole-site release:

- 1419
- 871
- 430
- EN
- ZH
- `/`
- `/work`
- `/experiments`
- `/profile`
- all canonical project detail routes
- Search closed/open/results/no-result/close/Escape
- clean routes
- key CTA links
- horizontal overflow
- reduced motion where applicable

## 9. Status vocabulary

Allowed statuses:

- VERIFIED
- STALE
- REGRESSION
- UNCERTAIN
- NOT VERIFIED

Only `VERIFIED` passes.

## 10. Incident recovery rule

If Production or Preview is discovered to contain stale approved state:

1. Freeze deploy/merge/rollback.
2. Recover the latest Human-approved state by area.
3. Recover exact source before recreating UI.
4. Materialize a reachable immutable recovery commit.
5. Rebuild the Approval Ledger and Regression Lock.
6. Validate Preview.
7. Obtain Human approval.
8. Only then promote Production.

Do not repair a baseline-integrity incident by patching symptoms one by one unless exact source recovery is impossible and Human explicitly approves reconstruction.

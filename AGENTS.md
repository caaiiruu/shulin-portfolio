# Portfolio Execution Gate

This repository uses mandatory governance before any implementation, QA, merge, rollback, or deployment.

## Required preflight

Before modifying source, every AI agent / contributor must read:

1. `docs/governance/PORTFOLIO-OPERATING-RULES.md`
2. `docs/governance/HUMAN-APPROVAL-LEDGER.md`
3. `docs/governance/REGRESSION-LOCK.md`
4. `docs/governance/APPROVED-BASELINE.md`
5. `docs/governance/RELEASE-MANIFEST.md`
6. `docs/governance/WORK-CHECKPOINT.md`

If any required baseline field is unknown, stale, fragmented, or not verified: **STOP**.

Do not:
- infer the latest Human-approved state from branch name, commit recency, Production, or memory;
- start implementation from an unverified baseline;
- merge donor/feature branches wholesale into the canonical baseline;
- promote Production without exact commit/tree/deployment mapping and Human release approval;
- mark `NOT VERIFIED`, `UNCERTAIN`, or `REGRESSION` as PASS.

## Mandatory status vocabulary

Use only:
- `VERIFIED`
- `STALE`
- `REGRESSION`
- `UNCERTAIN`
- `NOT VERIFIED`

Only `VERIFIED` may pass a release gate.

## Production hard stop

`shulinchou.com` must not be changed unless the Release Manifest points to an exact Human-approved baseline commit, tree, Preview deployment, and Human release approval.

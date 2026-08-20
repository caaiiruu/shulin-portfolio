# Execution Rules

## Capability preflight — required before choosing an execution path

Every Work execution must record the actual available capabilities before mutation:

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

Hard rules:
- never assume the environment is repo-attached
- never assume `gh` is installed or authenticated
- never assume `workflow_dispatch` is available through the active connector
- never repeat unauthenticated clone / scratch `.git` recovery loops
- choose the execution path only after capability detection
- if the preferred mechanism is unavailable, use an already-supported canonical alternative rather than inventing a project-specific recovery architecture

## Canonical project change pipeline

Normal project work uses:

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

Stacked repair PRs are exception handling only. They are not the normal project workflow.

GitHub-native execution is preferred when its required capabilities are present. Do not require a local scratch repo when the GitHub-native path works.

For large SSOT work, use the smallest deterministic mutation supported by the active connector/tooling. Do not perform a full replacement through a path known to truncate large content.

No rollback / force push.
No direct Production mutation.
